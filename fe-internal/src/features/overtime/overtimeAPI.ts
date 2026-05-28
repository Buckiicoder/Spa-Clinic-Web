import { api } from "../../services/api";

export const fetchOvertimeRequestsAPI = (params?: {
  keyword?: string;
  status?: string;
  user_id?: number;
  from_date?: string;
  to_date?: string;
}) =>
  api.get("/overtime", {
    params,
  });

export const fetchMyOvertimeRequestsAPI = () =>
  api.get("/overtime/my-request");

export const fetchOvertimeRequestDetailAPI = (id: number) =>
  api.get(`/overtime/${id}`);

export const createOvertimeRequestAPI = (data: {
  user_id: number;
  
  timekeeping_id: number;

  work_date: string;

  request_start_time: string | null;

  request_end_time: string | null;

  requested_minutes?: number;

  reason?: string | null;
}) => api.post("/overtime", data);

export const approveOvertimeRequestAPI = (
  id: number,
  data: {
    approved_minutes?: number;

    note?: string | null;
  },
) => api.patch(`/overtime/${id}/approve`, data);

export const rejectOvertimeRequestAPI = (
  id: number,
  data: {
    reject_reason: string;
  },
) => api.patch(`/overtime/${id}/reject`, data);

export const cancelOvertimeRequestAPI = (id: number) =>
  api.patch(`/overtime/${id}/cancel`);

export const fetchTimekeepingDailyViewAPI = (params: {
  date: string;
  status?: string;
}) =>
  api.get("/overtime/timekeeping-daily-view", {
    params,
  });
