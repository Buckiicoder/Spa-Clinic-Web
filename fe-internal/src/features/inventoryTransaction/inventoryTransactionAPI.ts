import { api } from "../../services/api";

// 🔹 GET ALL
export const getInventoryTransactionsAPI = () =>
  api.get("/inventory-transactions");

// 🔹 GET BY ID
export const getInventoryTransactionByIdAPI = (id: number) =>
  api.get(`/inventory-transactions/${id}`);

// 🔹 CREATE
export const createInventoryTransactionAPI = (data: any) =>
  api.post("/inventory-transactions", data);

// 🔹 DELETE
export const deleteInventoryTransactionAPI = (id: number) =>
  api.delete(`/inventory-transactions/${id}`);
