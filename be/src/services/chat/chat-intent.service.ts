export class ChatIntentService {
  static detectIntent(message: string) {
    const lower = message.toLowerCase();

    // =========================
    // booking
    // =========================
    if (
      lower.includes("giá") ||
  lower.includes("bao nhiêu tiền") ||
  lower.includes("chi phí") ||
  lower.includes("bảng giá") ||
  lower.includes("combo")
    ) {
      return "service_price";
    }

    if (
      lower.includes("đặt lịch") ||
      lower.includes("book") ||
      lower.includes("hẹn") || 
      lower.includes("ngày") || 
      lower.includes("đặt") || 
      lower.includes("lúc")
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

    if (lower.includes("giá")) {
      return "price";
    }

    if (lower.includes("bao nhiêu tiền")) {
      return "price";
    }

    if (lower.includes("dịch vụ")) {
      return "service_info";
    }

    if (lower.includes("spa ở đâu")) {
      return "faq";
    }

    return "general";
  }
}
