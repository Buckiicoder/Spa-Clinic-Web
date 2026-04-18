import { api } from "../../services/api";

//
// 🔹 GET theo tháng
//
export const getTimekeepingAPI = (
  month: number,
  year: number,
  user_id?: number,
) => {
  const query = user_id
    ? `timekeeping?month=${month}&year=${year}&user_id=${user_id}`
    : `timekeeping?month=${month}&year=${year}`;

  return api.get(query);
};

export const createTimekeepingAPI = (data: {
  records: {
    user_id: number;
    shift_id: number;
    work_date: string;
    status?: string;
  }[];
}) => api.post("/timekeeping", data);

// 🔹 UPDATE chung
//
export const updateTimekeepingAPI = (id: number, data: any) =>
  api.patch(`/timekeeping/${id}`, data);

// APPROVE
export const approveOffAPI = (id: number) =>
  api.patch(`/timekeeping/${id}/approve-off`);

export const rejectOffAPI = (id: number) =>
  api.patch(`/timekeeping/${id}/reject-off`);
//
// 🔹 CHECK-IN
//
export const checkInAPI = (id: number, lat?: number, lng?: number) =>
  api.patch(`/timekeeping/${id}/check-in`, { lat, lng });

//
// 🔹 CHECK-OUT
//
export const checkOutAPI = (id: number, lat?: number, lng?: number) =>
  api.patch(`/timekeeping/${id}/check-out`, { lat, lng });

//
// 🔹 BREAK
//
export const startBreakAPI = (id: number) =>
  api.patch(`/timekeeping/${id}/break-start`);

export const endBreakAPI = (id: number) =>
  api.patch(`/timekeeping/${id}/break-end`);

//
// 🔹 DELETE (hủy ca)
//
export const deleteTimekeepingAPI = (id: number) =>
  api.delete(`/timekeeping/${id}`);
