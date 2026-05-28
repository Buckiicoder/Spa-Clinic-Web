import { api } from "../../../services/api";

// ================= TEMPLATE =================

// GET ALL
export const getSalaryTemplatesAPI = () =>
  api.get("/salary/template");

// GET DETAIL
export const getSalaryTemplateDetailAPI = (
  id: number,
) =>
  api.get(`/salary/template/${id}`);

// CREATE
export const createSalaryTemplateAPI = (
  data: any,
) =>
  api.post("/salary/template", data);

// UPDATE
export const updateSalaryTemplateAPI = (
  id: number,
  data: any,
) =>
  api.put(`/salary/template/${id}`, data);