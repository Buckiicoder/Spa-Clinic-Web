import { db } from "../../config/db.js";

export class ChatCapacityService {
  static async getAvailableStaffCount(
    bookingDate: string,
    bookingTime: string,
  ) {
    const result = await db.query(
      `
    SELECT COUNT(DISTINCT td.user_id) as total

    FROM timekeeping_daily td

    JOIN shifts s
      ON s.id = td.shift_id

    WHERE td.work_date = $1

    AND td.status IN (
      'SCHEDULED',
      'WORKING'
    )

    AND s.start_time <= $2::time
    AND s.end_time > $2::time

    AND (
      td.break_start_time IS NULL
      OR td.break_end_time IS NULL
      OR NOT (
          $2::time >= td.break_start_time::time
          AND
          $2::time < td.break_end_time::time
      )
    )
    `,
      [bookingDate, bookingTime],
    );

    return Number(result.rows[0]?.total || 0);
  }
  static async getBookingCount(bookingDate: string, bookingTime: string) {
    const result = await db.query(
      `
    SELECT COUNT(*) as total
    FROM bookings
    WHERE booking_date = $1
      AND booking_time BETWEEN
      ($2::time - interval '30 minute')
      AND
      ($2::time + interval '30 minute')
      AND status IN (
        'PENDING',
        'IN_CONSULTATION',
        'CHECKED_IN',
        'CONSULTED',
        'IN_TREATMENT'
      )
    `,
      [bookingDate, bookingTime],
    );

    return Number(result.rows[0]?.total || 0);
  }

  static readonly EXTRA_CAPACITY = 10;
  static async getSlotCapacity(bookingDate: string, bookingTime: string) {
    const staff = await this.getAvailableStaffCount(bookingDate, bookingTime);

    return staff + this.EXTRA_CAPACITY;
  }

  static async isSlotAvailable(bookingDate: string, bookingTime: string) {
    const staff = await this.getAvailableStaffCount(bookingDate, bookingTime);

    const bookingCount = await this.getBookingCount(bookingDate, bookingTime);

    const maxCapacity = staff + this.EXTRA_CAPACITY;

    return {
      available: bookingCount < maxCapacity,

      bookingCount,

      staff,

      maxCapacity,
    };
  }

  static generateSlots() {
    const slots = [];

    let hour = 8;
    let minute = 0;

    while (hour < 20 || (hour === 19 && minute <= 30)) {
      slots.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      );

      minute += 30;

      if (minute === 60) {
        hour++;
        minute = 0;
      }
    }

    return slots;
  }

  static async suggestSlots(bookingDate: string) {
    const slots = this.generateSlots();

    const availableSlots = [];

    for (const slot of slots) {
      const check = await this.isSlotAvailable(bookingDate, slot);

      if (check.available) {
        availableSlots.push({
          time: slot,
          booking: check.bookingCount,
          capacity: check.maxCapacity,
        });
      }
    }

    return availableSlots.slice(0, 5);
  }
}
