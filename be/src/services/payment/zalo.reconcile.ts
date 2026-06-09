import axios from "axios";
import crypto from "crypto";
import { db } from "../../config/db.js";

export const reconcileZaloPayPayments = async () => {
  const client = await db.connect();

  try {
    const pendingTx = await client.query(`
      SELECT *
      FROM payment_transactions
      WHERE status = 'pending'
      AND gateway_provider = 'zalopay'
      AND zalopay_app_trans_id IS NOT NULL
      AND created_at < NOW() - INTERVAL '30 seconds'
      LIMIT 50
    `);

    for (const tx of pendingTx.rows) {
      await checkAndUpdateTransaction(client, tx);
    }
  } catch (err) {
    console.error("Reconcile error:", err);
  } finally {
    client.release();
  }
};

const checkAndUpdateTransaction = async (client: any, tx: any) => {
  const app_trans_id = tx.zalopay_app_trans_id;

  const data =
    process.env.ZALOPAY_APP_ID +
    "|" +
    app_trans_id +
    "|" +
    process.env.ZALOPAY_KEY1;

  const mac = crypto
    .createHmac("sha256", process.env.ZALOPAY_KEY1!)
    .update(data)
    .digest("hex");

  const res = await axios.post(
    process.env.ZALOPAY_QUERY_ORDER_URL!,
    null,
    {
      params: {
        app_id: process.env.ZALOPAY_APP_ID,
        app_trans_id,
        mac,
      },
    },
  );

  const result = res.data;

  // ❌ chưa thanh toán
  if (result.return_code !== 1) return;

  // ✔ đã thanh toán
  await client.query("BEGIN");

  // 1. update transaction
  await client.query(
    `
    UPDATE payment_transactions
    SET status='success',
        transaction_code=$1,
        raw_response=$2
    WHERE id=$3
    `,
    [result.zp_trans_id, JSON.stringify(result), tx.id],
  );

  // 2. update payment
  const paymentRes = await client.query(
    `
    SELECT *
    FROM payments
    WHERE id=$1
    FOR UPDATE
    `,
    [tx.payment_id],
  );

  const payment = paymentRes.rows[0];

  const newPaid =
    Number(payment.paid_amount) + Number(tx.amount);

  const newRemaining =
    Number(payment.final_amount) - newPaid;

  const newStatus =
    newRemaining <= 0 ? "paid" : "partial_paid";

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
};