import dayjs from "dayjs";
import {
  PHONE_REGEX,
  EMAIL_REGEX,
  DATE_REGEX,
  TIME_REGEX,
} from "./regex.js";

export const extractName = (
  message: string,
): string | null => {
  const patterns = [
    /tên \s+([^\n,.]+)/i,
    /mình \s+([^\n,.]+)/i,
    /tôi \s+([^\n,.]+)/i,
    /anh \s+([^\n,.]+)/i,
    /chị \s+([^\n,.]+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
};

export function extractPhone(
  text: string,
) {
  const match = text.match(
    PHONE_REGEX,
  );

  return match ? match[0] : null;
}

export function extractEmail(
  text: string,
) {
  const match = text.match(
    EMAIL_REGEX,
  );

  return match ? match[0] : null;
}

export function extractQuantity(
  text: string,
) {
  const match = text.match(/\d+/);

  if (!match) {
    return 1;
  }

  return Number(match[0]);
}

export function extractDate(
  text: string,
) {
  const lower = text.toLowerCase();

  // =====================
  // hôm nay
  // =====================

  if (lower.includes("hôm nay")) {
    return dayjs().format(
      "YYYY-MM-DD",
    );
  }

  // =====================
  // ngày mai
  // =====================

  if (
    lower.includes("ngày mai")
  ) {
    return dayjs()
      .add(1, "day")
      .format("YYYY-MM-DD");
  }

  // =====================
  // dd/mm/yyyy
  // =====================

  const match = lower.match(
    DATE_REGEX,
  );

  if (match) {
    const day = match[1];

    const month = match[2];

    const year =
      match[3]?.replace("/", "") ||
      dayjs().year();

    return dayjs(
      `${year}-${month}-${day}`,
    ).format("YYYY-MM-DD");
  }

  return null;
}

export function extractTime(
  text: string,
) {
  const lower = text.toLowerCase();

  const match = lower.match(
    TIME_REGEX,
  );

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);

  // =====================
  // chiều tối
  // =====================

  if (
    lower.includes("chiều") ||
    lower.includes("tối")
  ) {
    if (hour < 12) {
      hour += 12;
    }
  }

  return `${String(hour).padStart(
    2,
    "0",
  )}:00`;
}