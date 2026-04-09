import OpenAI from "openai";
import { db } from "../config/db.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatService {
  // 1. Main function
  static async handleMessage({
    message,
    userId,
    conversationId,
  }: {
    message: string;
    userId?: number;
    conversationId?: string;
  }) {
    // 1.1 tạo conversation nếu chưa có
    if (!conversationId) {
      conversationId = await this.createConversation(userId);
    }

    // 1.2 lưu message user
    await this.saveMessage(conversationId, "user", message);

    // 1.3 lấy history (10 message gần nhất)
    const history = await this.getConversationHistory(conversationId);

    // 1.4 gọi AI
    const aiResult = await this.callAI(history);

    // 1.5 parse JSON
    let parsed;
    try {
      parsed = JSON.parse(aiResult);
    } catch (err) {
      parsed = { intent: "unknown", reply: aiResult };
    }

    // 1.6 xử lý intent
    let reply = "";

    if (parsed.intent === "create_booking") {
      reply = await this.handleCreateBooking(parsed, userId, conversationId);
    } else {
      reply = parsed.reply || "Xin lỗi, tôi chưa hiểu yêu cầu.";
    }

    // 1.7 lưu response AI
    await this.saveMessage(conversationId, "assistant", reply);

    return {
      reply,
      conversationId,
    };
  }

  // =============================

  static async createConversation(userId?: number) {
    const id = "conv_" + Date.now();

    await db.query(
      `INSERT INTO conversations (id, user_id) VALUES ($1, $2)`,
      [id, userId || null]
    );

    return id;
  }

  // =============================

  static async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) {
    await db.query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, $2, $3)`,
      [conversationId, role, content]
    );
  }

  // =============================

  static async getConversationHistory(conversationId: string) {
    const res = await db.query(
      `SELECT role, content
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 10`,
      [conversationId]
    );

    return res.rows.map((row: any) => ({
      role: row.role,
      content: row.content,
    }));
  }

  // =============================

  static async callAI(history: any[]) {
    const systemPrompt = `
Bạn là chatbot của spa.

Chỉ hỗ trợ:
- đặt lịch (create_booking)
- hỏi dịch vụ

KHÔNG được:
- trả lời dữ liệu nội bộ
- bịa thông tin

Trả về JSON format:
{
  "intent": "...",
  "service": "...",
  "date": "...",
  "time": "...",
  "quantity": 1,
  "reply": "câu trả lời cho user"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
      ],
      temperature: 0.2,
    });

    return completion.choices[0].message.content || "";
  }

  // =============================

  static async handleCreateBooking(
    data: any,
    userId?: number,
    conversationId?: string
  ) {
    const { service, date, time, quantity } = data;

    // 1. tìm service_id
    const serviceRes = await db.query(
      `SELECT id FROM services WHERE LOWER(name) LIKE LOWER($1) LIMIT 1`,
      [`%${service}%`]
    );

    if (serviceRes.rowCount === 0) {
      return "Xin lỗi, tôi không tìm thấy dịch vụ này.";
    }

    const serviceId = serviceRes.rows[0].id;

    // 2. tạo booking
    const bookingCode = "BK_" + Date.now();

    await db.query(
      `INSERT INTO bookings 
      (booking_code, customer_id, service_id, booking_date, booking_time, quantity, created_source, conversation_id)
      VALUES ($1,$2,$3,$4,$5,$6,'CHATBOT',$7)`,
      [
        bookingCode,
        userId || null,
        serviceId,
        date,
        time,
        quantity || 1,
        conversationId,
      ]
    );

    return `Đã đặt lịch ${service} lúc ${time} ngày ${date}`;
  }
}
