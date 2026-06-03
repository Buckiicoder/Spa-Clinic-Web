import { api } from "../../services/api";

// ======================================================
// OVERVIEW
// ======================================================

export const getDashboardOverviewAPI = () => api.get("/dashboard/overview");

// LOW STOCK PRODUCTS
export const getLowStockProductsAPI = (limit = 10) =>
  api.get(`/dashboard/products/low-stock?limit=${limit}`);

// ATTENDANCE
export const getTopAttendanceStaffsAPI = (limit = 10) =>
  api.get(`/dashboard/staffs/attendance?limit=${limit}`);

// LATE STAFFS
export const getLateStaffsAPI = (limit = 10) =>
  api.get(`/dashboard/staffs/late?limit=${limit}`);

// DOCTOR REVENUE
export const getTopDoctorRevenueAPI = (limit = 10) =>
  api.get(`/dashboard/staffs/doctor-revenue?limit=${limit}`);

// TECHNICIAN REVENUE
export const getTopTechnicianRevenueAPI = (limit = 10) =>
  api.get(`/dashboard/staffs/technician-revenue?limit=${limit}`);

// VIP CUSTOMERS
export const getTopVipCustomersAPI = (limit = 10) =>
  api.get(`/dashboard/customers/vip?limit=${limit}`);

// LOYAL CUSTOMERS
export const getTopLoyalCustomersAPI = (limit = 10) =>
  api.get(`/dashboard/customers/loyal?limit=${limit}`);

// SERVICES
// MOST BOOKED SERVICES
export const getMostBookedServicesAPI = (limit = 10) =>
  api.get(`/dashboard/services/most-booked?limit=${limit}`);

// LEAST BOOKED SERVICES
export const getLeastBookedServicesAPI = (limit = 10) =>
  api.get(`/dashboard/services/least-booked?limit=${limit}`);

// MOST BOOKED PACKAGES
export const getMostBookedPackagesAPI = (limit = 10) =>
  api.get(`/dashboard/packages/most-booked?limit=${limit}`);

// LEAST BOOKED PACKAGES
export const getLeastBookedPackagesAPI = (limit = 10) =>
  api.get(`/dashboard/packages/least-booked?limit=${limit}`);

// REVENUE
export const getRevenueStatisticsAPI = () =>
  api.get("/dashboard/revenues/statistics");

export const getRevenueByDateRangeAPI = (
  startDate: string,
  endDate: string,
) =>
  api.get(
    `/dashboard/revenues/by-date-range?startDate=${startDate}&endDate=${endDate}`,
  );