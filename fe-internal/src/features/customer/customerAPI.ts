import { api } from "../../services/api";

// ================= CUSTOMER =================

// GET ALL
export const getCustomersAPI = (params?: any) =>
  api.get("/customer", {
    params,
  });

// GET DETAIL
export const getCustomerDetailAPI = (id: number) =>
  api.get(`/customer/${id}`);

// CREATE
export const createCustomerAPI = (data: any) =>
  api.post("/customer", data);

// UPDATE
export const updateCustomerAPI = (
  id: number,
  data: any,
) => api.put(`/customer/${id}`, data);