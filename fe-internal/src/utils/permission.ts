export const hasPosition = (
  user: any,
  positions: string[],
) => {
  return positions.includes(user?.position);
};

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/checklich": ["Lễ tân", "Quản lý"],
  "/payment/customer/:customerId": ["Lễ tân", "Quản lý"],
  "/payment/bill": ["Lễ tân", "Quản lý"],
  "/payment/bill/:paymentId": ["Lễ tân", "Quản lý"],

  "/doctor": ["Bác sĩ", "Quản lý"],

  "/technician": ["Kỹ thuật viên", "Quản lý"],

  "/chamcong": [
    "Lễ tân",
    "Bác sĩ",
    "Kỹ thuật viên",
    "Quản lý",
  ],

  "/timekeepingdaily": ["Quản lý"],
  "/qlychamcong": ["Quản lý"],
  "/qlynhanvien": ["Quản lý"],
  "/manager-assign": ["Quản lý"],
  "/payroll": ["Quản lý"],

  "/product": ["Quản lý"],
  "/service": ["Quản lý"],
  "/inventory": ["Quản lý"],
  "/discount": ["Quản lý"],
  "/customer": ["Quản lý"],
  "/treatment": ["Quản lý"],
  "/trangchu": ["Quản lý"],
};

export const hasPermission = (
  position: string | undefined,
  allowed: string[],
) => {
  if (!position) return false;

  return allowed.includes(position);
};