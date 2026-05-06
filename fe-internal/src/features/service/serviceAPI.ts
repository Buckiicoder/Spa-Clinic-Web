import { api } from "../../services/api";

// GET ALL (có packages)
export const getServicesAPI = () =>
  api.get("/service/getServices");

// GET MIDDLE SERVICE
export const getMiddleServiceAPI = () =>
   api.get("/service/getMiddleServices");

// GET TREE
export const getServiceTreeAPI = () =>
  api.get("/service/tree");

// GET DETAIL
export const getServiceDetailAPI = (id: number) =>
  api.get(`/service/${id}`);

// CREATE
export const createServiceAPI = (data: any) =>
  api.post("/service", data);

// UPDATE
export const updateServiceAPI = (id: number, data: any) =>
  api.put(`/service/${id}`, data);

// DELETE
export const deleteServiceAPI = (id: number) =>
  api.delete(`/service/${id}`);