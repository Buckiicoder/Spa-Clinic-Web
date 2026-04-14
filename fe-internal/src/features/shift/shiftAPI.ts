import { api } from "../../services/api";

// 🔹 GET ALL
export const getShiftsAPI = () =>
  api.get("/shift");

// 🔹 CREATE
export const createShiftAPI = (data: any) =>
  api.post("/shift", data);

// 🔹 UPDATE
export const updateShiftAPI = (id: number, data: any) =>
  api.patch(`/shift/${id}`, data);

// 🔹 DELETE
export const deleteShiftAPI = (id: number) =>
  api.delete(`/shift/${id}`);
