import { api } from "../../services/api";

// 🔹 GET theo tháng
export const getScheduleAPI = (month: number, year: number) =>
  api.get(`/schedule?month=${month}&year=${year}`);

// 
export const getFullScheduleAPI = (month: number, year: number) =>
  api.get(`/schedule/full?month=${month}&year=${year}`);


// 🔹 CREATE period
export const createSchedulePeriodAPI = (data: {
  month: number;
  year: number;
  status?: string;
  open_from?: string;
  open_to?: string;
}) => api.post("/schedule", data);

// 🔹 UPDATE period
export const updateSchedulePeriodAPI = (id: number, data: any) =>
  api.patch(`/schedule/${id}`, data);

// 🔹 SET days (bulk)
export const setScheduleDaysAPI = (data: {
  period_id: number;
  days: {
    work_date: string;
    shift_id: number;
    employee_type: "FULLTIME" | "PARTTIME";
    max_employee?: number;
  }[];
}) => api.post("/schedule/days", data);
