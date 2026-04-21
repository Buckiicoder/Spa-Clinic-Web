import { z } from "zod";

export const createProductCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên phân loại không được để trống")
    .max(100),

  description: z.string().optional(),
});

export const updateProductCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});
