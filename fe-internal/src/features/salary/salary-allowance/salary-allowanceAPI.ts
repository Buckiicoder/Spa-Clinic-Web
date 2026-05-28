import { api } from "../../../services/api";

// ================= ALLOWANCE =================

// GET ALL
export const getSalaryAllowancesAPI = (keyword: string) =>
  api.get(`/salary/allowance?keyword=${keyword}`);

// GET DETAIL
export const getSalaryAllowanceDetailAPI = (
  id: number,
) =>
  api.get(`/salary/allowance/${id}`);

// CREATE
export const createSalaryAllowanceAPI = (
  data: any,
) =>
  api.post("/salary/allowance", data);