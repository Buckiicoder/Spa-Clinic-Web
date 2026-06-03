import cron from "node-cron";
import { db } from "../config/db.js";

export const startBookingCron = () => {
  cron.schedule("5 0 * * *", async () => {
    try {
      console.log("Running booking no-show cron...");

      const result = await db.query(`
        UPDATE bookings
        SET
          status = 'NO_SHOW',
          updated_at = CURRENT_TIMESTAMP
        WHERE
          status = 'PENDING'
          AND booking_date < CURRENT_DATE
      `);

      console.log(
        `Updated ${result.rowCount} bookings to NO_SHOW`,
      );
    } catch (error) {
      console.error(
        "Booking cron error:",
        error,
      );
    }
  });
};