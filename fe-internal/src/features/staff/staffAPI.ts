import { api } from "../../services/api";

// 🔹 GET ALL
export const getStaffsAPI = () =>
  api.get("/staff");

// 🔹 GET BY ID
export const getStaffByIdAPI = (id: number) =>
  api.get(`/staff/${id}`);

// 🔹 CREATE
export const createStaffAPI = (data: any) =>
  api.post("/staff", data);

// 🔹 UPDATE
export const updateStaffAPI = (id: number, data: any) =>
  api.patch(`/staff/${id}`, data);

// 🔹 DELETE
export const deleteStaffAPI = (id: number) =>
  api.delete(`/staff/${id}`);
