import { db } from "../../config/db.js";

import { ChatMemoryService, BookingDraft } from "./chat-memory.service.js";
import { ChatIntentService } from "./chat-intent.service.js";
import { ChatBookingService } from "./chat-booking.service.js";
import { ChatServiceMatcherService } from "./chat-service-matcher.service.js";
import { ChatAIService } from "./chat-ai.service.js";
import { ChatConsultService } from "./chat-consult.service.js";
import { ChatBookingExtractorService } from "./chat-booking-extractor.service.js";
import { ChatCapacityService } from "./chat-capacity.service.js";
import {
  extractName,
  extractPhone,
  extractEmail,
  extractDate,
  extractTime,
  extractQuantity,
} from "../../utils/extractors.js";
import { ChatSkinAnalysisService } from "./chat-skin-analysis.service.js";

export class ChatService {
  private static isBookingConfirmation(message: string) {
    const lower = this.normalizeText(message);

    const bookingWords = [
      "đặt lịch",
      "tôi muốn đặt lịch",
      "đặt giúp tôi",
      "có",
      "ok",
      "oke",
      "đồng ý",
      "xác nhận",
      "đặt luôn",
      "book",
    ];

    return bookingWords.some((word) => lower.includes(word));
  }

  private static isRescheduleMessage(message: string) {
    const lower = message.toLowerCase();

    return (
      lower.includes("à") ||
      lower.includes("không") ||
      lower.includes("đổi") ||
      lower.includes("sửa") ||
      lower.includes("chuyển")
    );
  }

  private static normalizeText(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .trim();
  }

  private static validateBookingDraft(
    draft: BookingDraft,
    userId?: number,
  ): string[] {
    const missingFields: string[] = [];

    if (!draft.service_name) {
      missingFields.push("dịch vụ");
    }

    if (!userId && !draft.name) {
      missingFields.push("tên");
    }

    if (!userId && !draft.phone) {
      missingFields.push("số điện thoại");
    }

    if (!draft.booking_date) {
      missingFields.push("ngày");
    }

    if (!draft.booking_time) {
      missingFields.push("giờ");
    }

    return missingFields;
  }

  static async handleMessage({
    message,
    userId,
    conversationId,
  }: {
    message: string;
    userId?: number;
    conversationId?: string;
  }) {
    // create conversation
    if (!conversationId) {
      conversationId = await this.createConversation(userId);
    }

    // save user message
    await this.saveMessage(conversationId, "user", message);

    // memory
    // ChatMemoryService.get(conversationId);

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

    let memory = ChatMemoryService.get(conversationId);

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
      symptom:
        message.length > 20
          ? memory.symptom
            ? `${memory.symptom}\n${message}`
            : message
          : memory.symptom,
    };

    console.log("PURE REGEX", JSON.stringify(extracted, null, 2));

    const aiExtract = await ChatBookingExtractorService.extract(message);

    console.log("PURE AI", JSON.stringify(aiExtract, null, 2));

    const merged: Partial<BookingDraft> = {
      name: extracted.name ?? aiExtract.name,

      phone: extracted.phone ?? aiExtract.phone,

      email: extracted.email ?? aiExtract.email,

      // DATE luôn ưu tiên regex
      booking_date: extracted.booking_date ?? aiExtract.booking_date,

      // TIME ưu tiên AI
      booking_time: /^\d{2}:\d{2}$/.test(extracted.booking_time || "")
        ? extracted.booking_time
        : aiExtract.booking_time,

      quantity: extracted.quantity ?? 1,

      symptom: extracted.symptom,
    };

    const relativeDate = ChatConsultService.parseRelativeDate(message);

    const relativeTime = ChatConsultService.parseRelativeTime(message);

    const isReschedule = this.isRescheduleMessage(message);

    ChatMemoryService.update(conversationId, {
      ...merged,
      booking_intent: this.isBookingConfirmation(message) ? true : undefined,
    });

    console.log(
  "MEMORY AFTER UPDATE",
  JSON.stringify(
    ChatMemoryService.get(conversationId),
    null,
    2,
  ),
);

    if (isReschedule && (relativeDate || relativeTime)) {
      ChatMemoryService.replaceBookingSchedule(conversationId, {
        booking_date: relativeDate,
        booking_time: relativeTime,
      });
    }

    console.log(
  "MEMORY AFTER RESCHEDULE",
  JSON.stringify(
    ChatMemoryService.get(conversationId),
    null,
    2,
  ),
);

    memory = ChatMemoryService.get(conversationId);

    if (!memory.service_name && memory.symptom) {
      const suggestedService = await ChatConsultService.recommendService(
        memory.symptom,
      );

      console.log("AUTO SERVICE:", suggestedService);

      if (suggestedService) {
        ChatMemoryService.update(conversationId, {
          service_name: suggestedService,
        });

        memory = ChatMemoryService.get(conversationId);
      }
    }

    const matchedService = ChatServiceMatcherService.findService(message);

    if (matchedService) {
      ChatMemoryService.update(conversationId, {
        service_name: matchedService,
      });

      memory = ChatMemoryService.get(conversationId);
    }

    console.log("MATCHED SERVICE:", matchedService);

    // =========================
    // update memory
    // =========================

    const consultStep = (memory.consult_step || 0) + 1;

    ChatMemoryService.update(conversationId, {
      consult_step: consultStep,
    });

    memory = ChatMemoryService.get(conversationId);

    // detect intent
    const intent = ChatIntentService.detectIntent(message);

    // =========================
    // business hours
    // =========================

    if (intent === "business_hours") {
      const reply = ChatConsultService.getBusinessHoursText();

      await this.saveMessage(conversationId, "assistant", reply);

      return {
        reply,
        conversationId,
      };
    }

    if (intent === "service_price") {
      let serviceName = memory.service_name;

      if (!serviceName) {
        serviceName = await ChatConsultService.recommendService(message);
      }

      if (serviceName) {
        ChatMemoryService.update(conversationId, {
          service_name: serviceName,
        });

        memory = ChatMemoryService.get(conversationId);
      }

      if (serviceName) {
        const packages = await this.getServicePackages(serviceName);

        const reply = `
Dựa trên thông tin bạn chia sẻ, hiện dịch vụ ${serviceName} có các gói:

${packages}

Chi phí thực tế sẽ phụ thuộc tình trạng da sau khi bác sĩ thăm khám.

Nếu thuận tiện mình có thể hỗ trợ đặt lịch soi da và tư vấn miễn phí cho bạn.
`;

        await this.saveMessage(conversationId, "assistant", reply);

        return {
          reply,
          conversationId,
        };
      }
    }

    if (intent === "service_list") {
      const matchedServices = await ChatConsultService.searchService(message);

      if (matchedServices.length > 0) {
        const reply = matchedServices
          .map(
            (s) =>
              `• ${s.name}
${s.description || ""}`,
          )
          .join("\n\n");

        return {
          reply,
          conversationId,
        };
      }

      const services = await ChatConsultService.getServiceListText();

      return {
        reply: `Spa hiện đang cung cấp:\n\n${services}`,
        conversationId,
      };
    }

    // =========================
    // create booking
    // =========================

    if (intent === "booking" || memory.booking_intent) {
      if (!memory.service_name && memory.symptom) {
        const suggestedService = await ChatConsultService.recommendService(
          memory.symptom,
        );

        if (suggestedService) {
          ChatMemoryService.update(conversationId, {
            service_name: suggestedService,
          });

          memory = ChatMemoryService.get(conversationId);
        }
      }

      if (!memory.service_name) {
        const suggestedService = await ChatConsultService.recommendService(
          memory.symptom || message,
        );

        if (suggestedService) {
          ChatMemoryService.update(conversationId, {
            service_name: suggestedService,
          });

          memory = ChatMemoryService.get(conversationId);
        }
      }

      if (
        memory.booking_time &&
        !ChatConsultService.isValidBookingTime(memory.booking_time)
      ) {
         await this.saveMessage(
    conversationId,
    "assistant",
    "Spa chỉ nhận lịch từ 08:00 đến 19:30. Bạn muốn đổi sang giờ nào?",
  );

  return {
    reply:
      "Spa chỉ nhận lịch từ 08:00 đến 19:30. Bạn muốn đổi sang giờ nào?",
    conversationId,
  };
      }

      if (!memory.service_name) {
        return {
          reply:
            "Hiện hệ thống chưa xác định được dịch vụ phù hợp. Bạn có thể mô tả rõ hơn tình trạng da để bác sĩ tư vấn chính xác nhé.",
          conversationId,
        };
      }

      const finalMissing = this.validateBookingDraft(memory, userId);

      if (finalMissing.length > 0) {
        const reply = `Vui lòng cung cấp các thông tin còn thiếu sau để có thể đặt lịch nhé: ${finalMissing.join(
          ", ",
        )}`;

        await this.saveMessage(conversationId, "assistant", reply);

        return {
          reply,
          conversationId,
        };
      }

      try {
        if (memory.booking_date && memory.booking_time) {
          const slotInfo = await ChatCapacityService.isSlotAvailable(
            memory.booking_date,
            memory.booking_time,
          );

          if (!slotInfo.available) {
            const suggestions = await ChatCapacityService.suggestSlots(
              memory.booking_date,
            );

            return {
              reply: `
Khung giờ ${memory.booking_time}
đang quá tải.

Các khung giờ còn trống:

${suggestions.map((x) => x.time).join(", ")}
`,
              conversationId,
            };
          }
        }

        if (
          memory.booking_date &&
          memory.booking_time &&
          ChatConsultService.isPastDateTime(
            memory.booking_date,
            memory.booking_time,
          )
        ) {
          return {
            reply: "Không thể đặt lịch trong quá khứ.",
            conversationId,
          };
        }

        const booking = await ChatBookingService.createBooking({
          userId,
          conversationId,
          draft: memory,
        });

        console.log("REGEX EXTRACT:", extracted);

        console.log("AI EXTRACT:", aiExtract);

        ChatMemoryService.clear(conversationId);

        const successReply = `
      ✅ Đặt lịch thành công

      Mã lịch hẹn: ${booking.booking_code}

      Khách hàng:
      ${memory.name}

      Dịch vụ:
      ${memory.service_name}

      Ngày:
      ${memory.booking_date}

      Giờ:
      ${memory.booking_time}

      Vui lòng đến trước giờ hẹn khoảng 10 phút.

      Bác sĩ sẽ thăm khám trực tiếp và tư vấn chi tiết tình trạng da của bạn trước khi thực hiện liệu trình.
      `;
        ``;

        await this.saveMessage(conversationId, "assistant", successReply);

        return {
          reply: successReply,
          conversationId,
        };
      } catch (error: any) {
        const reply = error?.message || "Không thể tạo lịch hẹn.";

        await this.saveMessage(conversationId, "assistant", reply);

        return {
          reply,
          conversationId,
        };
      }
    }

    if (intent === "consult" || intent === "general") {
      const history =
        await ChatAIService.getConversationHistory(conversationId);

      let analysis: any = null;

      try {
        const analysisRaw = await ChatSkinAnalysisService.analyze(message);

        analysis = JSON.parse(analysisRaw || "{}");
      } catch {
        analysis = null;
      }

      // =========================
      // tìm dịch vụ phù hợp
      // =========================

      let serviceName = memory.service_name;

      if (!serviceName) {
        serviceName = await ChatConsultService.recommendService(
          memory.symptom || message,
        );
      }

      if (serviceName && !memory.service_name) {
        ChatMemoryService.update(conversationId, {
          service_name: serviceName,
        });

        memory = ChatMemoryService.get(conversationId);
      }

      let packages = "";

      if (serviceName) {
        packages = await this.getServicePackages(serviceName);
      }

      // =========================
      // AI trả lời tư vấn
      // =========================

      const aiReply = await ChatAIService.generateReply(
        `
Khách hỏi:

${message}

Phân tích:

${JSON.stringify(analysis)}

Dịch vụ phù hợp:

${serviceName || "chưa xác định"}

Các gói hiện có:

${packages || "không có"}

Số lần tư vấn:

${consultStep}

QUY TẮC:

1. Nếu chưa đủ thông tin:
   chỉ hỏi thêm tối đa 1 câu.

2. Nếu đã xác định được dịch vụ:
   giải thích ngắn gọn.

3. Nếu đã tư vấn từ 3 lần trở lên:
   KHÔNG hỏi thêm.

4. Nếu có dịch vụ phù hợp:
   giới thiệu các gói hiện có.

5. Nếu khách hỏi giá:
   trả lời bằng các gói trong hệ thống.

6. Sau khi giới thiệu dịch vụ:
   chuyển sang mời đặt lịch.

7. Nhấn mạnh khi đặt lịch online rằng:

   "bác sĩ cần thăm khám trực tiếp
   để đánh giá chính xác tình trạng."

8. Mục tiêu cuối:
   hướng khách tới đặt lịch.
`,
        history,
      );

      await this.saveMessage(conversationId, "assistant", aiReply);

      return {
        reply: aiReply,
        conversationId,
      };
    }
    return {
      reply:
        "Mình chưa hiểu rõ yêu cầu của bạn. Bạn có thể mô tả chi tiết hơn được không?",
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
      WHERE LOWER(TRIM(s.name)) = LOWER(TRIM($1))
      `,
      [serviceName],
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
