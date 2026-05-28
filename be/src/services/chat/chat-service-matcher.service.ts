import { SERVICE_KEYWORDS } from "../../utils/service_keywords.js";

export class ChatServiceMatcherService {
  static findService(message: string) {
    const lower = message.toLowerCase();

    for (const item of SERVICE_KEYWORDS) {
      const found = item.keywords.some((k) =>
        lower.includes(k.toLowerCase())
      );

      if (found) {
        return item.service;
      }
    }

    return null;
  }
}