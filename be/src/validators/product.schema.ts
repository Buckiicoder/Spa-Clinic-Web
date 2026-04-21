import { z } from "zod";

export const createProductSchema = z.object({
  barcode: z.string().max(100).optional().nullable().transform((value) => value?.trim() || null),

  name: z.string().min(1, "Tên sản phẩm không được để trống").max(255),

  description: z.string().optional().nullable(),

  category_id: z.number().int().positive().optional().nullable(),

  unit: z.string().min(1).max(30).default("cái"),

  sale_price: z.number().min(0, "Giá niêm yết phải >= 0"),

  current_price: z.number().min(0, "Giá bán hiện tại phải >= 0"),

  stock_quantity: z.number().int().min(0).default(0),

  image_url: z
    .union([
      z.string().url(),
      z.string().startsWith("/uploads/"),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  is_active: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  barcode: z.string().max(100).optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  category_id: z.number().int().positive().optional().nullable(),
  unit: z.string().min(1).max(30).optional(),
  sale_price: z.number().min(0).optional(),
  current_price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  image_url: z
    .union([
      z.string().url(),
      z.string().startsWith("/uploads/"),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  is_active: z.boolean().optional(),
});
