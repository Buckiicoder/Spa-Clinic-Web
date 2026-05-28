export class ChatIntentService {
  static detectIntent(message: string) {
    const lower =
      message.toLowerCase();

    // =========================
    // booking
    // =========================

    if (
      lower.includes("đặt lịch") ||
      lower.includes("book") ||
      lower.includes("hẹn")
    ) {
      return "booking";
    }

    // =========================
    // consult
    // =========================

    if (
      lower.includes("mụn") ||
      lower.includes("nám") ||
      lower.includes("tàn nhang") ||
      lower.includes("sẹo") ||
      lower.includes("thâm") ||
      lower.includes("da") ||
      lower.includes("lỗ chân lông") ||
      lower.includes("xỉn màu") ||
      lower.includes("quanh mắt")
    ) {
      return "consult";
    }

    return "general";
  }
}