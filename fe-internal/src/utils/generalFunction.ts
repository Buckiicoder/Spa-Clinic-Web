export const formatPrice = (
  value?: number | string | null,
) => {
  const number = Number(value || 0);

  return number.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
};

export const formatTimeForInput = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

export const parseShiftTime = (
  dateStr: string,
  time?: string,
) => {
  if (!time) return null;

  const [year, month, day] = dateStr
    .split("-")
    .map(Number);

  const [hour, minute] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0,
  );
};

export const formatDateOnly = (value?: string) => {
  if (!value) return "";

  return value.slice(0, 10);
};

export const toDateInputValue = (
  value?: string | null,
) => {
  if (!value) return "";

  const date = new Date(value);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};