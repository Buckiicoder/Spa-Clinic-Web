import cron from "node-cron";

import { autoCheckoutJob } from "./autoCheckoutJob.js";

export const startAutoCheckoutCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log(
        "[AUTO CHECKOUT] Running...",
      );

      await autoCheckoutJob();

      console.log(
        "[AUTO CHECKOUT] Done",
      );
    } catch (err) {
      console.error(
        "[AUTO CHECKOUT] Error",
        err,
      );
    }
  });
};