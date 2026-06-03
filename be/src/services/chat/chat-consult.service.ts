import { db } from "../../config/db.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ChatConsultService {
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

static async recommendByAI(
 symptom: string
) {
 const services =
   await this.getMiddleServices();

 const serviceNames =
   services.map(
     s => s.name
   ).join(",");

 const completion =
   await openai.chat.completions.create({
     model:"gpt-4o-mini",
     temperature:0.1,
     messages:[
       {
         role:"system",
         content:`
Chỉ chọn 1 dịch vụ gần nhất.

Danh sách:
${serviceNames}

Trả về đúng tên dịch vụ.
`
       },
       {
         role:"user",
         content:symptom
       }
     ]
   });

 return completion
   .choices[0]
   .message
   .content
   ?.trim();
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
