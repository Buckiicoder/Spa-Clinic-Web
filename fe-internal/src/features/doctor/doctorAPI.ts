import { api } from "../../services/api";

// 🔹 Lấy danh sách booking chờ tư vấn
export const getWaitingConsultationsAPI = () =>
  api.get("/doctor/waiting");

// 🔹 Lấy chi tiết booking (cho màn hình bác sĩ)
export const getConsultationDetailAPI = (id: number) =>
  api.get(`/doctor/${id}`);

// 🔹 Bác sĩ nhận khách (CHECKED_IN → IN_CONSULTATION)
export const startConsultationAPI = (id: number) =>
  api.patch(`/doctor/${id}/start`);

// 🔹 Hoàn thành tư vấn (IN_CONSULTATION → CONSULTED)
export const completeConsultationAPI = (id: number) =>
  api.patch(`/doctor/${id}/complete`);

// 🔹 Update thông tin tư vấn
export const updateConsultationAPI = (id: number, data: any) =>
  api.patch(`/doctor/${id}`, data);


// ================= PROFILE =================
// 🔹 Tạo profile (sau khi chốt gói)
export const createProfileFromConsultationAPI = (
  bookingId: number,
  data: any,
) =>
  api.post("/doctor/profile", {
    ...data,
    booking_id: bookingId, // 🔥 BE đang cần cái này
  });

// 🔹 update profile
export const updateProfileAPI = (id: number, data: any) =>
  api.patch(`/doctor/profile/${id}`, data);

// 🔹 delete profile
export const deleteProfileAPI = (id: number) =>
  api.delete(`/doctor/profile/${id}`);


// ================= SESSION =================

// 🔹 create session
export const createSessionAPI = (data: any) =>
  api.post("/doctor/session", data);

// 🔹 update session
export const updateSessionAPI = (id: number, data: any) =>
  api.patch(`/doctor/session/${id}`, data);

// 🔹 delete session
export const deleteSessionAPI = (id: number) =>
  api.delete(`/doctor/session/${id}`);