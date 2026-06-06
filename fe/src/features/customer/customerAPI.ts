import { api } from "../../services/api";

export const getMyServiceHistoryAPI = () =>
  api.get("/customer/me/service-history");

export const updateMyProfileAPI = (data: any) =>
  api.put(
    "/customer/me/profile",
    data,
  );

export const rescheduleSessionAPI = (data: {
  session_id: number;
  service_date: string;
  service_time: string;
}) =>
  api.put(
    "/customer/me/sessions/reschedule",
    data,
  );