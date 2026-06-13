import { db } from "../../config/db.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatConsultService {
  static readonly BUSINESS_HOURS = {
    open: "08:00",
    close: "20:00",
    lastBooking: "19:30",
  };

  static getBusinessHoursText() {
    return `
SpaClinic hoạt động từ 08:00 đến 20:00 hằng ngày.

Khách hàng có thể đặt lịch trong khoảng:
08:00 - 19:30

Sau 19:30 hệ thống sẽ không nhận lịch mới để đảm bảo thời gian phục vụ.
`;
  }

  static isValidBookingTime(time: string) {
    const [hour, minute] = time.split(":").map(Number);

    const totalMinutes = hour * 60 + minute;

    const openMinutes = 8 * 60;

    const lastBookingMinutes = 19 * 60 + 30;

    return totalMinutes >= openMinutes && totalMinutes <= lastBookingMinutes;
  }

  static isPastDateTime(bookingDate: string, bookingTime: string) {
    const booking = new Date(`${bookingDate}T${bookingTime}:00`);

    return booking.getTime() < Date.now();
  }

  static parseRelativeDate(message: string) {
    const lower = message.toLowerCase();

    const now = new Date();

    if (lower.includes("hôm nay") || lower.includes("nay")) {
      return now.toISOString().split("T")[0];
    }

    if (lower.includes("ngày mai") || lower.includes("mai")) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);

      return d.toISOString().split("T")[0];
    }

    if (lower.includes("ngày kia")) {
      const d = new Date(now);

      d.setDate(d.getDate() + 2);

      return d.toISOString().split("T")[0];
    }

    return null;
  }

  static parseRelativeTime(message: string) {
    const lower = message.toLowerCase();

    if (lower.includes("sáng")) {
      return "09:00";
    }

    if (lower.includes("trưa")) {
      return "12:00";
    }

    if (lower.includes("chiều")) {
      return "15:00";
    }

    if (lower.includes("tối")) {
      return "19:00";
    }

    return null;
  }

  // =========================
  // lấy middle services
  // =========================

  static async getMiddleServices() {
    const result = await db.query(`
      SELECT
        id,
        name,
        description
      FROM services
      WHERE is_active = true
        AND parent_id IS NOT NULL
        AND area IS NULL
      ORDER BY id ASC
    `);

    return result.rows;
  }

  static async getAllServices() {
    const result = await db.query(`
    SELECT
      id,
      name,
      description,
      parent_id
    FROM services
    WHERE is_active = true
    ORDER BY id
  `);

    return result.rows;
  }

  static async searchService(keyword: string) {
    const result = await db.query(
      `
      SELECT
        id,
        name,
        description
      FROM services
      WHERE
        is_active = true
        AND LOWER(name)
        LIKE LOWER($1)
      LIMIT 20
      `,
      [`%${keyword}%`],
    );

    return result.rows;
  }

  static async getServiceListText() {
    const services = await this.getAllServices();

    if (!services.length) {
      return "Hiện tại chưa có dịch vụ nào.";
    }

    return services.map((s) => `• ${s.name}`).join("\n");
  }

  static async recommendByAI(symptom: string) {
    const services = await this.getMiddleServices();

    const serviceNames = services.map((s) => s.name).join(",");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `
Chỉ chọn 1 dịch vụ gần nhất.

Danh sách:
${serviceNames}

Trả về đúng tên dịch vụ.
`,
        },
        {
          role: "user",
          content: symptom,
        },
      ],
    });

    return completion.choices[0].message.content?.trim();
  }

  // =========================
  // recommend service
  // =========================

  static async recommendService(symptom: string) {
    const services = await this.getMiddleServices();

    const lower = symptom.toLowerCase();

    if (lower.includes("mụn")) {
      return "Trị mụn";
    }

    if (lower.includes("sẹo")) {
      return "Trị sẹo";
    }

    if (lower.includes("nám")) {
      return "Trị nám da";
    }

    if (lower.includes("tàn nhang")) {
      return "Trị tàn nhang";
    }

    if (lower.includes("đồi mồi")) {
      return "Trị đồi mồi";
    }

    if (lower.includes("thâm")) {
      return "Trị thâm";
    }

    if (lower.includes("lão hóa")) {
      return "Trẻ hóa da";
    }

    if (lower.includes("lỗ chân lông")) {
      return "Se khít lỗ chân lông";
    }

    if (lower.includes("viêm nang lông")) {
      return "Trị viêm nang lông";
    }

    if (lower.includes("triệt")) {
      return "Triệt lông";
    }

    return await this.recommendByAI(symptom);
  }
}
