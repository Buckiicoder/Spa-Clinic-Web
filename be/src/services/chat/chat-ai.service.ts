import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatAIService {
  static async generateReply(prompt: string) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: `
Bạn là tư vấn viên spa.

QUY TẮC:
- trả lời ngắn gọn dưới 80 từ
- tự nhiên
- lịch sự
- không bịa thông tin
- được phép lấy các thông tin trên mạng để trình bày rõ hơn về các công năng dịch vụ đang có
- không nói chính xác giá
- chỉ nói khoảng giá
- tập trung chốt dịch vụ + đặt lịch
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return completion.choices[0].message.content || "";
  }
}
