import { db } from "../../config/db.js";
import crypto from "crypto";
import qs from "qs";
import * as paymentServices from "./payment.service.js";

const sortObject = (obj: any) => {
  const sorted: any = {};

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });

  return sorted;
};

console.log("RETURN URL:", process.env.VNP_RETURN_URL);
console.log("TMN:", process.env.VNP_TMN_CODE);
console.log("URL:", process.env.VNP_URL);

export const createVNPayPayment = async ({
  profile_id,
  discount_id,
  amount,
  ipAddr,
}: {
  profile_id: number;
  discount_id?: number | null;
  amount: number;
  ipAddr: string;
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const profile = await paymentServices.getPaymentProfileDetail(profile_id);

    if (!profile) {
      throw new Error("Không tìm thấy hồ sơ");
    }

    if(!amount || amount <= 0) {
      throw new Error("Số tiền thanh toán không hợp lệ");
    }

    const pendingPayment =
      await paymentServices.getPendingPaymentByProfile(profile_id);

    let subtotal = Number(profile.package_price);

    let discountAmount = 0;

    let finalAmount = subtotal;

    let discount: any = null;

    if (pendingPayment) {
      subtotal = Number(pendingPayment.remaining_amount);

      finalAmount = subtotal;
    }

    if (discount_id) {
      const availableDiscounts =
        await paymentServices.getAvailableDiscounts(profile_id);

      discount = availableDiscounts.discounts.find(
        (d: any) => d.id === discount_id,
      );

      if (!discount) {
        throw new Error("Mã giảm giá không hợp lệ");
      }

      discountAmount = paymentServices.calculateDiscountAmount({
        subtotal,
        discount,
      });

      finalAmount = subtotal - discountAmount;
    }

    //-----------------------------------
    // CREATE PAYMENT
    //-----------------------------------

    const paymentResult = await client.query(
      `
      INSERT INTO payments (
        payment_code,
        customer_id,
        booking_id,
        subtotal_amount,
        discount_amount,
        final_amount,
        paid_amount,
        remaining_amount,
        discount_id,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10
      )
      RETURNING *
      `,
      [
        `PAY${Date.now()}`,
        profile.customer_id,
        profile.booking_id || null,
        subtotal,
        discountAmount,
        finalAmount,
        0,
        finalAmount,
        discount?.id || null,
        "pending",
      ],
    );

    const payment = paymentResult.rows[0];

    //-----------------------------------
    // PAYMENT ITEM
    //-----------------------------------

    await client.query(
      `
      INSERT INTO payment_items(
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
      VALUES(
        $1,$2,$3,$4,
        $5,$6,$7,
        $8,$9,$10,$11
      )
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
        discountAmount,
        finalAmount,
      ],
    );

    //-----------------------------------
    // CREATE TRANSACTION PENDING
    //-----------------------------------

    const vnpTxnRef = `${payment.id}_${Date.now()}`;

    const transactionResult = await client.query(
      `
        INSERT INTO payment_transactions(
          payment_id,
          payment_method,
          gateway_provider,
          amount,
          status,
          vnp_txn_ref
        )
        VALUES(
          $1,$2,$3,$4,$5,$6
        )
        RETURNING *
        `,
      [payment.id, "vnpay", "vnpay", amount, "pending", vnpTxnRef],
    );

    //-----------------------------------
    // VNPay URL
    //-----------------------------------

    const createDate = new Date();

    const vnpParams: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.VNP_TMN_CODE,

      vnp_Locale: "vn",

      vnp_CurrCode: "VND",

      vnp_TxnRef: vnpTxnRef,

      vnp_OrderInfo: `Thanh toan profile ${profile.profile_id}`,

      vnp_OrderType: "other",

      vnp_Amount: Math.round(amount * 100),

      vnp_ReturnUrl: process.env.VNP_RETURN_URL,

      vnp_IpAddr: ipAddr,

      vnp_CreateDate: createDate
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .substring(0, 14),
    };

    const sortedParams = sortObject(vnpParams);

    const signData = qs.stringify(sortedParams, {
      encode: false,
    });

    const secureHash = crypto
      .createHmac("sha512", process.env.VNP_HASH_SECRET!)
      .update(signData)
      .digest("hex");

    sortedParams.vnp_SecureHash = secureHash;

    const paymentUrl = `${process.env.VNP_URL}?${qs.stringify(sortedParams, {
      encode: false,
    })}`;

    await client.query("COMMIT");

    return {
      payment,
      paymentUrl,
      transaction: transactionResult.rows[0],
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const vnpayReturnService = async (query: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const secureHash = query.vnp_SecureHash;

    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    const sortedParams = sortObject(query);

    const signData = qs.stringify(sortedParams, {
      encode: false,
    });

    const checkHash = crypto
      .createHmac("sha512", process.env.VNP_HASH_SECRET!)
      .update(signData)
      .digest("hex");

    if (secureHash !== checkHash) {
      throw new Error("Sai chữ ký VNPay");
    }

    const txnRef = query.vnp_TxnRef;

    const responseCode = query.vnp_ResponseCode;

    const transactionResult = await client.query(
      `
        SELECT *
        FROM payment_transactions
        WHERE vnp_txn_ref = $1
        LIMIT 1
        `,
      [txnRef],
    );

    const transaction = transactionResult.rows[0];

    if (!transaction) {
      throw new Error("Không tìm thấy giao dịch");
    }

    //----------------------------------
    // SUCCESS
    //----------------------------------

    if (responseCode === "00") {
      await client.query(
        `
        UPDATE payment_transactions
        SET
          status='success',
          transaction_code=$1,
          vnp_transaction_no=$2,
          raw_response=$3
        WHERE id=$4
        `,
        [
          query.vnp_BankTranNo,
          query.vnp_TransactionNo,
          JSON.stringify(query),
          transaction.id,
        ],
      );

      await paymentServices.updatePaymentAmounts(
        client,
        transaction.payment_id,
        Number(transaction.amount),
      );

      await client.query("COMMIT");

      return {
        success: true,
      };
    }

    //----------------------------------
    // FAILED
    //----------------------------------

    await client.query(
      `
      UPDATE payment_transactions
      SET
        status='failed',
        raw_response=$1
      WHERE id=$2
      `,
      [JSON.stringify(query), transaction.id],
    );

    await client.query("COMMIT");

    return {
      success: false,
      code: responseCode,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
