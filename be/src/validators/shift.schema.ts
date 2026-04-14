import { z } from "zod";

export const createShiftSchema = z.object({
  name: z.string().min(1, "Tên ca không được để trống"),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  is_active: z.boolean().default(true),
});

export const updateShiftSchema = z.object({
  name: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_active: z.boolean().optional(),
});
