import { api } from "../../services/api";

// ================= CUSTOMER =================

// GET ALL
export const getCustomersAPI = () =>
  api.get("/customer");

// GET DETAIL
export const getCustomerDetailAPI = (id: number) =>
  api.get(`/customer/${id}`);


// ================= PROFILE =================

// CREATE PROFILE (thêm liệu trình)
export const createCustomerProfileAPI = (data: any) =>
  api.post("/customer/profile", data);

// GET PROFILE BY CUSTOMER
export const getProfilesByCustomerAPI = (customerId: number) =>
  api.get(`/customer/profile/${customerId}`);


// ================= SESSION =================

// CREATE SESSION
export const createSessionAPI = (data: any) =>
  api.post("/customer/session", data);

// GET SESSION BY PROFILE
export const getSessionsByProfileAPI = (profileId: number) =>
  api.get(`/customer/session/${profileId}`);
