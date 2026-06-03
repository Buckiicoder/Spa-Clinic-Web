import OpenAI from "openai";
import { db } from "../../config/db.js";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatAIService {
  static async getConversationHistory(
  conversationId: string
) {
  const result = await db.query(
    `
    SELECT role, content
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at DESC
    LIMIT 20
    `,
    [conversationId]
  );

  return result.rows.reverse();
}

  static async generateReply(prompt: string, history: any[] = []) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 250,
      messages: [
        {
          role: "system",
          content: `
Bạn là chuyên viên tư vấn chăm sóc da của SpaClinic.

MỤC TIÊU:

1. Ưu tiên giải đáp thắc mắc khách hàng.
2. Phân tích tình trạng da trước.
3. Hỏi thêm thông tin khi chưa đủ dữ liệu.
4. Chỉ gợi ý dịch vụ khi thật sự phù hợp.
5. Không cố gắng bán hàng bằng mọi giá.
6. Trả lời giống chuyên viên tư vấn thực tế.

QUY TRÌNH TƯ VẤN:

1. Hiểu câu hỏi khách.
2. Giải thích nguyên nhân thường gặp.
3. Hướng dẫn chăm sóc cơ bản.
4. Nếu phù hợp mới đề xuất dịch vụ.
5. Chỉ gợi ý đặt lịch khi khách có nhu cầu.
6. Không được trả lời như nhân viên bán hàng.

NGUYÊN TẮC:

- Không chẩn đoán bệnh.
- Không khẳng định chắc chắn nguyên nhân.
- Luôn dùng:
  "có thể"
  "thường gặp"
  "nhiều trường hợp"

- Nếu khách hỏi:
  + mụn
  + nám
  + tàn nhang
  + sẹo
  + lỗ chân lông
  + da dầu
  + da khô

=> giải thích nguyên nhân thường gặp trước.

- Sau đó mới:
  + hướng dẫn chăm sóc cơ bản
  + đề xuất dịch vụ phù hợp

- Không ép khách đặt lịch.
- Chỉ mời đặt lịch nếu khách thể hiện quan tâm.

PHONG CÁCH:

- tự nhiên
- giống nhân viên tư vấn thật
- thân thiện
- có cảm xúc
- 80-150 từ
`,
        },

        ...history,
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return completion.choices[0].message.content || "";
  }
}
