import { db } from "../../config/db.js";

import {
  findUserByContact,
  createGuestUser,
  upsertCustomer,
  createBooking,
  getBookingById,
} from "../booking.service.js";

export class ChatBookingService {
  static async createBooking({
    userId,
    conversationId,
    draft,
  }: any) {
    if (!draft.booking_date) {
      throw new Error("Thiếu ngày");
    }

    if (!draft.booking_time) {
      throw new Error("Thiếu giờ");
    }

    if (!draft.service_name) {
      throw new Error("Thiếu dịch vụ");
    }

    if (!userId && !draft.name) {
      throw new Error("Thiếu tên khách hàng");
    }

    if (!userId && !draft.phone) {
      throw new Error("Thiếu số điện thoại");
    }

    // =========================
    // tìm middle service
    // =========================

    const serviceRes = await db.query(
      `
      SELECT id, name
      FROM services
      WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
        AND is_active = true
        AND parent_id IS NOT NULL
        AND area IS NULL
      LIMIT 1
      `,
      [draft.service_name],
    );

    if ((serviceRes.rowCount ?? 0) === 0) {
      throw new Error("Không tìm thấy dịch vụ phù hợp");
    }

    const service = serviceRes.rows[0];

    // =========================
    // user login
    // =========================

    let customerId = userId;

    // =========================
    // guest user
    // =========================

    if (!customerId) {
      let user = await findUserByContact(
        draft.phone || null,
        draft.email || null,
      );

      if (!user) {
        user = await createGuestUser(
          draft.name,
          draft.phone || null,
          draft.email || null,
        );
      }

      customerId = user.id;

      await upsertCustomer(customerId, {
        source: "CHATBOT",
      });
    }

    // =========================
    // create booking
    // =========================

    const bookingRaw = await createBooking({
      customer_id: customerId,
      service_id: service.id,
      booking_date: draft.booking_date,
      booking_time: draft.booking_time,
      quantity: draft.quantity || 1,
      created_by: customerId,
      note: draft.symptom || null,

      created_source: "CHATBOT",
      conversation_id: conversationId,
    });

    return await getBookingById(bookingRaw.id);
  }
}