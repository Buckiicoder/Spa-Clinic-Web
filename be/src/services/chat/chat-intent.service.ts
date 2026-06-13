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
      lower.includes("lịch hẹn") ||
      lower.includes("hẹn lịch") ||
      lower.includes("đặt hẹn") ||
      lower.includes("đặt giúp") ||
      lower.includes("đặt cho") ||
      lower.includes("muốn hẹn") ||
      lower.includes("muốn đặt") ||
      lower.includes("chốt lịch") ||
      lower.includes("lên lịch")
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

    // if (lower.includes("dịch vụ")) {
    //   return "service_info";
    // }

    if (
      lower.includes("dịch vụ") ||
      lower.includes("dịch vụ nào") ||
      lower.includes("spa có gì") ||
      lower.includes("clinic có gì") ||
      lower.includes("có gì") ||
      lower.includes("làm gì") ||
      lower.includes("gói nào") ||
      lower.includes("liệu trình") ||
      lower.includes("điều trị gì") ||
      lower.includes("cung cấp gì") ||
      lower.includes("thực hiện gì")
    ) {
      return "service_list";
    }

    if (
      lower.includes("mở cửa") ||
      lower.includes("đóng cửa") ||
      lower.includes("mấy giờ") ||
      lower.includes("làm việc") ||
      lower.includes("hoạt động")
    ) {
      return "business_hours";
    }

    if (lower.includes("spa ở đâu")) {
      return "faq";
    }

    return "general";
  }
}
