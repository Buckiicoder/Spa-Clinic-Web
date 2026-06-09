import { db } from "../../config/db.js";
import axios from "axios";
import crypto from "crypto";
import moment from "moment";

import * as paymentServices from "./payment.service.js";

export const createZaloPayPayment = async ({
  profile_id,
  amount,
  discount_id,
}: {
  profile_id: number;
  amount: number;
  discount_id?: number | null;
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // ================================
    // 1. GET PROFILE
    // ================================
    const profile = await paymentServices.getPaymentProfileDetail(profile_id);

    if (!profile) {
      throw new Error("Không tìm thấy hồ sơ");
    }

    if (!amount || amount <= 0) {
      throw new Error("Số tiền không hợp lệ");
    }

    // ================================
    // 2. CHECK EXISTING PAYMENT (OPTIONAL)
    // ================================
    let payment = await paymentServices.getPendingPaymentByProfile(profile_id);

    let subtotal = Number(profile.package_price);
    let discountAmount = 0;
    let finalAmount = subtotal;
    let discount: any = null;

    // ================================
    // 3. FIRST TIME PAYMENT → CREATE PAYMENT
    // ================================
    if (!payment) {
      const paymentResult = await client.query(
        `
        INSERT INTO payments (
          payment_code,
          customer_id,
          subtotal_amount,
          discount_amount,
          final_amount,
          paid_amount,
          remaining_amount,
          status,
          discount_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          `PAY${Date.now()}`,
          profile.customer_id,
          subtotal,
          0,
          subtotal,
          0,
          subtotal,
          "pending",
          null,
        ],
      );

      payment = paymentResult.rows[0];

      // payment_items
      await client.query(
        `
        INSERT INTO payment_items (
          payment_id,
          profile_id,
          service_id,
          package_id,
          item_type,
          item_name,
          quantity,
          unit_price,
          subtotal_amount,
          discount_amount,
          final_amount
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `,
        [
          payment.id,
          profile.profile_id,
          profile.service_id,
          profile.package_id,
          "service_package",
          profile.package_name,
          1,
          subtotal,
          subtotal,
          0,
          subtotal,
        ],
      );
    }

    // ================================
    // 4. APPLY DISCOUNT (IMPORTANT FIX)
    // ================================
    if (discount_id) {
      const available = await paymentServices.getAvailableDiscounts(profile_id);

      discount = available.discounts.find((d: any) => d.id === discount_id);

      if (!discount) {
        throw new Error("Mã giảm giá không hợp lệ");
      }

      await client.query(`SELECT * FROM discounts WHERE id=$1 FOR UPDATE`, [
        discount.id,
      ]);

      discountAmount = paymentServices.calculateDiscountAmount({
        subtotal: payment.remaining_amount,
        discount,
      });

      finalAmount = Number(payment.final_amount) - discountAmount;

      await client.query(
        `
        UPDATE payments
        SET discount_id=$1,
            discount_amount=$2,
            final_amount=$3,
            remaining_amount=$3 - paid_amount
        WHERE id=$4
        `,
        [discount.id, discountAmount, finalAmount, payment.id],
      );
    }

    // ================================
    // 5. VALIDATE AMOUNT
    // ================================
    if (amount > payment.remaining_amount) {
      throw new Error("Số tiền vượt quá công nợ");
    }

    // ================================
    // 6. CREATE TRANSACTION
    // ================================
    const transactionResult = await client.query(
      `
      INSERT INTO payment_transactions (
        payment_id,
        payment_method,
        gateway_provider,
        amount,
        status,
        transaction_code,
    raw_response
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        payment.id,
        "zalopay",
        "zalopay",
        amount,
        "success",
        "TEST_" + Date.now(),
        JSON.stringify({
          mock: true,
          status: "success",
        }),
      ],
    );

    const transaction = transactionResult.rows[0];

    // update payment
    // dùng để test nhé
    const newPaid = Number(payment.paid_amount) + Number(transaction.amount);

    const newRemaining = Number(payment.final_amount) - newPaid;

    const newStatus = newRemaining <= 0 ? "paid" : "partial_paid";

    await client.query(
      `
  UPDATE payments
  SET paid_amount=$1,
      remaining_amount=$2,
      status=$3
  WHERE id=$4
  `,
      [newPaid, newRemaining, newStatus, payment.id],
    );

    // ================================
    // 7. APP TRANS ID
    // ================================
    const app_trans_id = moment().format("YYMMDD") + "_" + Date.now();

    await client.query(
      `
      UPDATE payment_transactions
      SET zalopay_app_trans_id=$1
      WHERE id=$2
      `,
      [app_trans_id, transaction.id],
    );

    // ================================
    // 8. ORDER DATA
    // ================================
    const embed_data = {
      payment_id: payment.id,
      transaction_id: transaction.id,
    };

    const items = [
      {
        payment_code: payment.payment_code,
      },
    ];

    const order: any = {
      app_id: Number(process.env.ZALOPAY_APP_ID),
      app_trans_id,
      app_user: String(payment.customer_id),
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: Math.round(amount),
      description: `Thanh toán ${payment.payment_code}`,
      bank_code: "",
      callback_url: process.env.ZALOPAY_CALLBACK_URL,
      redirecturl: process.env.ZALOPAY_REDIRECT_URL,
    };

    const data =
      order.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;

    order.mac = crypto
      .createHmac("sha256", process.env.ZALOPAY_KEY1!)
      .update(data)
      .digest("hex");

    // ================================
    // 9. CALL ZALOPAY
    // ================================
    const response = await axios.post(process.env.ZALOPAY_CREATE_URL!, null, {
      params: order,
    });

    if (response.data.return_code !== 1) {
      throw new Error(`ZaloPay failed: ${JSON.stringify(response.data)}`);
    }

    await client.query("COMMIT");

    return {
      payment,
      transaction,
      paymentUrl: response.data.order_url,
      zaloResponse: response.data,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const zalopayCallbackService = async (body: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const dataStr = body.data;
    const reqMac = body.mac;

    // ================================
    // 1. VERIFY SIGNATURE
    // ================================
    const mac = crypto
      .createHmac("sha256", process.env.ZALOPAY_KEY2!)
      .update(dataStr)
      .digest("hex");

    if (mac !== reqMac) {
      return {
        return_code: -1,
        return_message: "invalid mac",
      };
    }

    const data = JSON.parse(dataStr);

    // ================================
    // 2. FIND TRANSACTION
    // ================================
    const transactionResult = await client.query(
      `
      SELECT *
      FROM payment_transactions
      WHERE zalopay_app_trans_id=$1
      FOR UPDATE
      `,
      [data.app_trans_id],
    );

    const transaction = transactionResult.rows[0];

    if (transaction.status === "success") {
      return { return_code: 1 };
    }

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // ================================
    // 3. UPDATE TRANSACTION
    // ================================
    await client.query(
      `
      UPDATE payment_transactions
      SET status='success',
          transaction_code=$1,
          raw_response=$2
      WHERE id=$3
      `,
      [data.zp_trans_id, JSON.stringify(data), transaction.id],
    );

    // ================================
    // 4. UPDATE PAYMENT (CORE LOGIC)
    // ================================
    const paymentResult = await client.query(
      `
      SELECT *
      FROM payments
      WHERE id=$1
      FOR UPDATE
      `,
      [transaction.payment_id],
    );

    const payment = paymentResult.rows[0];

    const newPaid = Number(payment.paid_amount) + Number(transaction.amount);

    const newRemaining = Number(payment.final_amount) - newPaid;

    const newStatus = newRemaining <= 0 ? "paid" : "partial_paid";

    await client.query(
      `
      UPDATE payments
      SET paid_amount=$1,
          remaining_amount=$2,
          status=$3
      WHERE id=$4
      `,
      [newPaid, newRemaining, newStatus, payment.id],
    );

    await client.query("COMMIT");

    return {
      return_code: 1,
      return_message: "success",
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
