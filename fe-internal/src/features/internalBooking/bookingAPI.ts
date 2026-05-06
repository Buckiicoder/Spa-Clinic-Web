import { api } from "../../services/api";

// 🔹 GET
export const getBookingsAPI = () =>
  api.get("/booking");

export const getBookingByIdAPI = (id: string) =>
  api.get(`/booking/${id}`);

export const searchCustomersAPI = (params: {
  phone?: string;
  email?: string;
}) => api.get("/booking/search", { params });

// 🔹 CREATE
export const createBookingStaffAPI = (data: any) =>
  api.post("/booking/staff", data);

export const createBookingPublicAPI = (data: any) =>
  api.post("/booking/customer", data);

// 🔹 UPDATE
export const updateBookingAPI = (id: string, data: any) =>
  api.patch(`/booking/${id}`, data);

export const checkInBookingAPI = (id: string) =>
  api.patch(`/booking/${id}/check-in`);

// 🔹 DELETE
export const deleteBookingAPI = (id: string) =>
  api.delete(`/booking/${id}`);