import { api } from "../../services/api";

export const fetchPayrollsAPI = (params?: {
  keyword?: string;
  employee_type?: string;
  salary_unit?: string;
  month?: number;
  year?: number;
}) =>
  api.get("/payroll", {
    params,
  });

export const generatePayrollAPI = (data: {
  staff_id: number;
  month: number;
  year: number;
  payroll_status?: string;
  note?: string | null;
}) => api.post("/payroll/generate", data);

export const generateMultiplePayrollsAPI = (data: {
  staff_ids: number[];
  month: number;
  year: number;
}) => api.post("/payroll/generate-multiple", data);

export const regeneratePayrollAPI = (data: {
  staff_id: number;

  month: number;

  year: number;
}) => api.post("/payroll/regenerate", data);


// test tính lương thủ công trước khi áp tự động
export const runDailyPayrollSyncAPI = () =>
  api.post("/payroll/daily-sync");