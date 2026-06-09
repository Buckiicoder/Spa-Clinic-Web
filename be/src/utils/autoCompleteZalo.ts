import cron from "node-cron";
import { reconcileZaloPayPayments } from "../services/payment/zalo.reconcile.js";

export const startCronJobs = () => {
  let isRunning = false;

  cron.schedule("*/10 * * * * *", async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      await reconcileZaloPayPayments();
    } finally {
      isRunning = false;
    }
  });
};
