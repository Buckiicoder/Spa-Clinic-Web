import { db } from "../../config/db.js";

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

  // =========================
  // recommend service
  // =========================

  static async recommendService(symptom: string) {
    const services =
      await this.getMiddleServices();

    const lower =
      symptom.toLowerCase();

    // =========================
    // regex nhẹ trước
    // =========================

    if (
      lower.includes("mụn")
    ) {
      return "Trị mụn";
    }

    if (
      lower.includes("nám") ||
      lower.includes("tàn nhang") ||
      lower.includes("đốm nâu")
    ) {
      return "Trị nám";
    }

    if (
      lower.includes("thâm")
    ) {
      return "Trị thâm";
    }

    if (
      lower.includes("sẹo")
    ) {
      return "Trị sẹo";
    }

    // =========================
    // fallback AI nhẹ
    // =========================

    return null;
  }
}