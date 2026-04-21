export const getImageUrl = (path?: string) => {
  if (!path) return "";

  // nếu đã là link đầy đủ
  if (path.startsWith("http")) return path;

  // vì api base đang là http://localhost:5000/api
  // còn ảnh nằm ở http://localhost:5000/uploads/...
  return `http://localhost:5000${path}`;
};

export const formatPrice = (value: number) => {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
};

export const formatMoneyInput = (value: string | number) => {
  if (value === "" || value === null || value === undefined) return "";

  // ép về string rồi bỏ phần thập phân .00 nếu có
  const normalized = value.toString().split(".")[0];

  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseMoneyInput = (value: string) => {
  return value.replace(/\./g, "");
};