import { api } from "../../services/api";

// GET
export const getInventoryTransactionsAPI = () =>
  api.get("/inventory-transactions");

export const getInventoryTransactionByIdAPI = (
  id: number,
) => api.get(`/inventory-transactions/${id}`);

// CREATE
export const createInventoryTransactionAPI = (
  data: any,
) => api.post("/inventory-transactions", data);

// UPDATE
export const updateInventoryTransactionAPI = (
  id: number,
  data: any,
) => api.put(`/inventory-transactions/${id}`, data);

// CONFIRM
export const confirmInventoryTransactionAPI = (
  id: number,
) => api.patch(`/inventory-transactions/${id}/confirm`);

// CANCEL
export const cancelInventoryTransactionAPI = (
  id: number,
) => api.patch(`/inventory-transactions/${id}/cancel`);