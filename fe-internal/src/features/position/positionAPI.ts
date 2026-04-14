import { api } from "../../services/api";

// GET ALL
export const getPositionsAPI = () =>
  api.get("/position");

// GET BY ID
export const getPositionByIdAPI = (id: number) =>
  api.get(`/position/${id}`);

// CREATE
export const createPositionAPI = (data: any) =>
  api.post("/position", data);

// UPDATE
export const updatePositionAPI = (id: number, data: any) =>
  api.patch(`/position/${id}`, data);

// DELETE
export const deletePositionAPI = (id: number) =>
  api.delete(`/position/${id}`);
