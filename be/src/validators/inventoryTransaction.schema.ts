import { z } from "zod";

export const inventoryTransactionItemSchema = z.object({
  product_id: z.number().int().positive("Sản phẩm không hợp lệ"),

  quantity: z
    .number()
    .int()
    .positive("Số lượng phải lớn hơn 0"),

  unit_price: z
    .number()
    .min(0, "Đơn giá phải lớn hơn hoặc bằng 0"),

  note: z.string().optional().nullable(),
});

export const createInventoryTransactionSchema = z.object({
  code: z
    .string()
    .min(1, "Mã phiếu không được để trống")
    .max(30),

  type: z.enum(["IMPORT", "EXPORT", "ADJUST"]),

  note: z.string().optional().nullable(),

  total_extra_cost: z.number().min(0).optional().default(0),

  transaction_date: z.string().optional(),

  items: z
    .array(inventoryTransactionItemSchema)
    .min(1, "Phải có ít nhất 1 sản phẩm"),
});
