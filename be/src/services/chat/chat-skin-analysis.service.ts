import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatSkinAnalysisService {
  static async analyze(symptom: string) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",

      temperature: 0.2,

      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
Bạn là chuyên gia phân tích tình trạng da.

Nhiệm vụ:

- phân tích nguyên nhân thường gặp
- xác định mức độ
- xác định có cần hỏi thêm không

Trả về JSON:

{
  "possible_causes": [],
  "care_advice": [],
  "severity": "low|medium|high",
  "need_more_info": true,
  "question": ""
}
`,
        },
        {
          role: "user",
          content: symptom,
        },
      ],
    });

    const content = completion.choices[0].message.content || "{}";

    return content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  }
}
