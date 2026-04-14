import { z } from "zod";

export const createPositionSchema = z.object({
  name: z
    .string()
    .min(1, "Tên chức danh không được để trống")
    .max(50, "Tên chức danh tối đa 50 ký tự"),

  description: z
    .string()
    .max(255, "Mô tả quá dài")
    .optional(),
});

export const updatePositionSchema = z.object({
  name: z
    .string()
    .min(1, "Tên chức danh không hợp lệ")
    .max(50)
    .optional(),

  description: z
    .string()
    .max(255)
    .optional(),
});
