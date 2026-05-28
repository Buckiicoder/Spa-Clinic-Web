import { db } from "../../config/db.js";

import { ChatMemoryService, BookingDraft } from "./chat-memory.service.js";
import { ChatIntentService } from "./chat-intent.service.js";
import { ChatBookingService } from "./chat-booking.service.js";
import { ChatServiceMatcherService } from "./chat-service-matcher.service.js";
import { ChatAIService } from "./chat-ai.service.js";
import { ChatConsultService } from "./chat-consult.service.js";
import {
  extractName,
  extractPhone,
  extractEmail,
  extractDate,
  extractTime,
  extractQuantity,
} from "../../utils/extractors.js";

export class ChatService {
  static async handleMessage({
    message,
    userId,
    conversationId,
  }: {
    message: string;
    userId?: number;
    conversationId?: string;
  }) {
    // =========================
    // create conversation
    // =========================

    if (!conversationId) {
      conversationId = await this.createConversation(userId);
    }

    // =========================
    // save user message
    // =========================

    await this.saveMessage(conversationId, "user", message);

    // =========================
    // memory
    // =========================

    ChatMemoryService.get(conversationId);

    if (userId) {
      const userRes = await db.query(
        `
    SELECT
      name,
      phone,
      email
    FROM users
    WHERE id = $1
    `,
        [userId],
      );

      if ((userRes.rowCount || 0) > 0) {
        const user = userRes.rows[0];

        ChatMemoryService.update(conversationId, {
          name: user.name,
          phone: user.phone,
          email: user.email,
        });
      }
    }

    // =========================
    // extract info
    // =========================

    const extracted: Partial<BookingDraft> = {
      name: extractName(message),
      phone: extractPhone(message),
      email: extractEmail(message),
      booking_date: extractDate(message),
      booking_time: extractTime(message),
      quantity: extractQuantity(message),
    };

    const matchedService = ChatServiceMatcherService.findService(message);

    if (matchedService) {
      extracted.service_name = matchedService;
    }

    // =========================
    // update memory
    // =========================

    const updatedMemory = ChatMemoryService.update(conversationId, extracted);

    // =========================
    // detect intent
    // =========================

    const intent = ChatIntentService.detectIntent(message);

    // =========================
    // consult
    // =========================

    if (intent === "consult") {
      // =========================
      // lưu symptom
      // =========================

      ChatMemoryService.update(conversationId, {
        symptom: message,
      });

      // =========================
      // recommend middle service
      // =========================

      let serviceName = updatedMemory.service_name;

      if (!serviceName) {
        const recommended = await ChatConsultService.recommendService(message);

        if (recommended) {
          serviceName = recommended;

          ChatMemoryService.update(conversationId, {
            service_name: recommended,
          });
        }
      }

      // =========================
      // chưa xác định được
      // =========================

      if (!serviceName) {
        const aiReply = await ChatAIService.generateReply(`
Khách đang mô tả tình trạng:

${message}

Hãy hỏi thêm tối đa 1 câu
để xác định khách đang gặp vấn đề gì.
`);

        await this.saveMessage(conversationId, "assistant", aiReply);

        return {
          reply: aiReply,
          conversationId,
        };
      }

      // =========================
      // lấy package
      // =========================

      const packages = await this.getServicePackages(serviceName);

      // =========================
      // AI tư vấn mềm
      // =========================

      const aiReply = await ChatAIService.generateReply(`
Khách mô tả:

${message}

Spa xác định khách có thể phù hợp với:
${serviceName}

Các gói:
${packages}

Hãy:
- tư vấn ngắn gọn
- KHÔNG khẳng định bệnh
- nói "có thể"
- mời khách đặt lịch thăm khám
`);

      await this.saveMessage(conversationId, "assistant", aiReply);

      return {
        reply: aiReply,
        conversationId,
      };
    }

    // =========================
    // booking flow
    // =========================

    const missingFields = [];

    if (!updatedMemory.service_name) {
      missingFields.push("dịch vụ");
    }

    if (!userId) {
      if (!updatedMemory.name) {
        missingFields.push("tên người đặt")
      }
      if (!updatedMemory.phone) {
        missingFields.push("số điện thoại");
      }
    }

    if (!updatedMemory.booking_date) {
      missingFields.push("ngày");
    }

    if (!updatedMemory.booking_time) {
      missingFields.push("giờ");
    }

    // =========================
    // ask missing
    // =========================

    if (missingFields.length > 0) {
      const reply = `Bạn vui lòng hãy cung cấp thêm các thông tin còn thiếu gồm: ${missingFields.join(", ")}`;

      await this.saveMessage(conversationId, "assistant", reply);

      return {
        reply,
        conversationId,
      };
    }

    // =========================
    // create booking
    // =========================

    const booking = await ChatBookingService.createBooking({
      userId,
      conversationId,
      draft: updatedMemory,
    });

    console.log(booking);

    // =========================
    // clear memory
    // =========================

    ChatMemoryService.clear(conversationId);

    const successReply = `
Đặt lịch thành công.

• Mã đặt lịch: ${booking.booking_code}
• Dịch vụ: ${updatedMemory.service_name}
• Ngày: ${updatedMemory.booking_date}
• Giờ: ${updatedMemory.booking_time}

Vui lòng có mặt đúng giờ hẹn.
Cảm ơn bạn đã tin tưởng SpaClinic 💖
`;
    await this.saveMessage(conversationId, "assistant", successReply);

    return {
      reply: successReply,
      conversationId,
    };
  }

  // =========================

  static async createConversation(userId?: number) {
    const id = "conv_" + Date.now();

    await db.query(
      `
      INSERT INTO conversations
      (id, user_id)
      VALUES ($1, $2)
      `,
      [id, userId || null],
    );

    return id;
  }

  // =========================

  static async saveMessage(
    conversationId: string,
    role: string,
    content: string,
  ) {
    await db.query(
      `
      INSERT INTO messages
      (conversation_id, role, content)
      VALUES ($1,$2,$3)
      `,
      [conversationId, role, content],
    );
  }

  // =========================

  static async getServicePackages(serviceName: string) {
    const result = await db.query(
      `
      SELECT
        sp.name,
        sp.price,
        sp.total_sessions
      FROM service_packages sp
      JOIN services s
        ON s.id = sp.service_id
      WHERE LOWER(s.name)
      LIKE LOWER($1)
      `,
      [`%${serviceName}%`],
    );

    return result.rows
      .map(
        (r: any) =>
          `
${r.name}
${r.total_sessions} buổi
Giá khoảng ${Math.floor(r.price / 1000000) - 1}-${Math.floor(
            r.price / 1000000,
          )} triệu
`,
      )
      .join("\n");
  }
}
