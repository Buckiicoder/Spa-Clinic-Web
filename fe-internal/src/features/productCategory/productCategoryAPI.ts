import { api } from "../../services/api";

// GET
export const getProductCategoriesAPI = () =>
  api.get("/product-categories");

// CREATE
export const createProductCategoryAPI = (data: any) =>
  api.post("/product-categories", data);

// UPDATE
export const updateProductCategoryAPI = (
  id: number,
  data: any,
) => api.patch(`/product-categories/${id}`, data);

// DELETE
export const deleteProductCategoryAPI = (id: number) =>
  api.delete(`/product-categories/${id}`);
