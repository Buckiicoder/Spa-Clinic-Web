import { api } from "../../../services/api";

// ================= STAFF SALARY =================

// GET ALL
export const getAllStaffSalariesAPI = () =>
  api.get("/salary/staff");

// GET DETAIL
export const getStaffSalaryDetailAPI = (
  staffId: number,
) =>
  api.get(`/salary/staff/${staffId}`);

// ASSIGN / UPDATE
export const assignStaffSalaryAPI = (
  data: any,
) =>
  api.post("/salary/staff", data);