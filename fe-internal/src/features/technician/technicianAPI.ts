import { api } from "../../services/api";

/**
 * ================= MANAGER =================
 */

// 🔹 khách đã khám xong trong ngày
export const getConsultedTodayAPI = () =>
  api.get("/technician/consulted-today");

// 🔹 danh sách kỹ thuật viên đang làm
export const getWorkingTechniciansAPI = () =>
  api.get("/technician/technicians");

// 🔹 gán KTV cho session
export const assignTechnicianAPI = (data: {
  session_id: number;
  technician_id: number;
}) => api.post("/technician/assign", data);

/**
 * ================= TECHNICIAN =================
 */

// 🔹 danh sách ca của tôi
export const getMySessionsAPI = () =>
  api.get("/technician/me");

// 🔹 chi tiết session
export const getSessionDetailAPI = (id: number) =>
  api.get(`/technician/session/${id}`);

// 🔹 bắt đầu session
export const startSessionAPI = (id: number) =>
  api.patch(`/technician/session/${id}/start`);

// 🔹 hoàn thành session
export const completeSessionAPI = (id: number, data: any) =>
  api.patch(`/technician/session/${id}/complete`, data);