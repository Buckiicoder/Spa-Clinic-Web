import { api } from "../../../services/api";

// ================= DEDUCTION =================

// GET ALL
export const getSalaryDeductionsAPI = (keyword: string) =>
  api.get(`/salary/deduction?keyword=${keyword}`);

// GET DETAIL
export const getSalaryDeductionDetailAPI = (
  id: number,
) =>
  api.get(`/salary/deduction/${id}`);

// CREATE
export const createSalaryDeductionAPI = (
  data: any,
) =>
  api.post("/salary/deduction", data);