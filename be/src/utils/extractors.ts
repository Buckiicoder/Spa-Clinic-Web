import dayjs from "dayjs";
import { PHONE_REGEX, EMAIL_REGEX, DATE_REGEX, TIME_REGEX } from "./regex.js";

export function extractName(text: string): string | null {
  const cleaned = text.trim();

  const patterns = [
    /tên\s*[:\-]\s*([a-zA-ZÀ-ỹ\s]+)/i,
    /tên\s+(?:là|của\s+(?:tôi|em|mình)\s+là)\s*([a-zA-ZÀ-ỹ\s]+)/i,
    /em là\s*([a-zA-ZÀ-ỹ\s]+)/i,
    /mình là\s*([a-zA-ZÀ-ỹ\s]+)/i,
    /tôi là\s*([a-zA-ZÀ-ỹ\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);

    if (match?.[1]) {
      const name = match[1]
        .split(/[,.;!?]|\b(?:sđt|số điện thoại|phone|điện thoại|đặt lịch)\b/i)[0]
        .trim();

      if (name.length >= 2 && name.length <= 40) {
        return name;
      }
    }
  }

  const phoneMatch = cleaned.match(/0\d{9,10}/);

  if (phoneMatch) {
    const beforePhone = cleaned
      .substring(0, phoneMatch.index)
      .replace(/[,:-]/g, "")
      .trim();

    if (beforePhone && beforePhone.length >= 2 && beforePhone.length <= 30) {
      return beforePhone;
    }
  }

  return null;
}

export function extractPhone(text: string) {
  const match = text.match(PHONE_REGEX);

  return match ? match[0] : null;
}

export function extractEmail(text: string) {
  const match = text.match(EMAIL_REGEX);

  return match ? match[0] : null;
}

export function extractQuantity(text: string) {
  const lower = text.toLowerCase();

  const match = lower.match(/(\d+)\s*(người|khách|suất|lượt)/);

  if (match) {
    return Number(match[1]);
  }

  return 1;
}

export function extractDate(text: string) {
  const lower = text.toLowerCase();

  // hôm nay
  if (
    /\bhôm nay\b/.test(lower) ||
    /\bnay\b/.test(lower) ||
    /\bsáng nay\b/.test(lower) ||
    /\bchiều nay\b/.test(lower) ||
    /\btối nay\b/.test(lower)
  ) {
    return dayjs().format("YYYY-MM-DD");
  }

  // ngày mai
  if (
    /\bmai\b/.test(lower) ||
    /\bngày mai\b/.test(lower) ||
    /\bsáng mai\b/.test(lower) ||
    /\bchiều mai\b/.test(lower) ||
    /\btối mai\b/.test(lower)
  ) {
    return dayjs()
      .add(1, "day")
      .format("YYYY-MM-DD");
  }

  // ngày kia
  if (
    /\bngày kia\b/.test(lower) ||
    /\bmốt\b/.test(lower) ||
    /\bsáng ngày kia\b/.test(lower) ||
    /\bchiều ngày kia\b/.test(lower) ||
    /\btối ngày kia\b/.test(lower)
  ) {
    return dayjs()
      .add(2, "day")
      .format("YYYY-MM-DD");
  }

  const match = lower.match(DATE_REGEX);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);

  const year = match[3]
    ? Number(match[3].replace("/", ""))
    : dayjs().year();

  const parsed = dayjs(
    `${year}-${month}-${day}`
  );

  return parsed.isValid()
    ? parsed.format("YYYY-MM-DD")
    : null;
}
export function extractTime(text: string) {
  const lower = text.toLowerCase();

  const match =
    lower.match(/\b(\d{1,2})h(\d{0,2})?\b/) ||
    lower.match(/\b(\d{1,2})\s*giờ(?:\s*(\d{1,2}))?\b/) ||
    lower.match(/\b(\d{1,2}):(\d{2})\b/);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);

  const minute =
    match[2] && match[2] !== ""
      ? match[2]
      : "00";

  if (
    lower.includes("chiều") ||
    lower.includes("tối")
  ) {
    if (hour < 12) {
      hour += 12;
    }
  }

  return `${String(hour).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}
