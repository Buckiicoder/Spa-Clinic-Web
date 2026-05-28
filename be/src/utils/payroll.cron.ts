import cron from "node-cron";

import {
  generateDailyPayrolls,
} from "../services/payroll/payroll-service.service.js";

// ======================================================
// DAILY PAYROLL AUTO GENERATE
// Chạy lúc 23:59 giờ Việt Nam mỗi ngày
// ======================================================

cron.schedule(
  "59 23 * * *",
  async () => {
    console.log(
      "[PAYROLL CRON] Running daily payroll sync...",
    );

    try {
      const result =
        await generateDailyPayrolls();

      console.log(
        "[PAYROLL CRON] Success:",
        result,
      );
    } catch (err) {
      console.error(
        "[PAYROLL CRON] Failed:",
        err,
      );
    }
  },
  {
    timezone: "Asia/Ho_Chi_Minh",
  },
);