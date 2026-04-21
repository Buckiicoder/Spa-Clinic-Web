// features/product/productAPI.ts

import { api } from "../../services/api";

// 🔹 GET ALL
export const getProductsAPI = () => api.get("/product");

// 🔹 GET BY ID
export const getProductByIdAPI = (id: number) =>
  api.get(`/product/${id}`);

// 🔹 CREATE
export const createProductAPI = (data: any) =>
  api.post("/product", data);

// 🔹 UPDATE
export const updateProductAPI = (
  id: number,
  data: any
) => api.patch(`/product/${id}`, data);

// 🔹 DELETE (soft delete)
export const deleteProductAPI = (id: number) =>
  api.delete(`/product/${id}`);

export const uploadProductImageAPI = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  return api.post("/product/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
