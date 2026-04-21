import { api } from "../../services/api";

// GET ALL
export const getBranchesAPI = () => api.get("/branch");

// GET BY ID
export const getBranchByIdAPI = (id: number) =>
  api.get(`/branch/${id}`);

// CREATE
export const createBranchAPI = (data: any) =>
  api.post("/branch", data);

// UPDATE
export const updateBranchAPI = (id: number, data: any) =>
  api.patch(`/branch/${id}`, data);

// DELETE
export const deleteBranchAPI = (id: number) =>
  api.delete(`/branch/${id}`);