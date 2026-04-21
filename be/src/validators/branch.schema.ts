import { z } from "zod";

export const createBranchSchema = z.object({
  name: z
    .string()
    .min(1, "Tên cơ sở không được để trống")
    .max(100, "Tên cơ sở tối đa 100 ký tự"),

  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(255, "Địa chỉ tối đa 255 ký tự"),

  latitude: z
    .number({
      required_error: "Thiếu vĩ độ",
    })
    .min(-90)
    .max(90),

  longitude: z
    .number({
      required_error: "Thiếu kinh độ",
    })
    .min(-180)
    .max(180),

  allowed_radius: z
    .number()
    .min(10, "Bán kính tối thiểu 10m")
    .max(1000, "Bán kính tối đa 1000m")
    .optional(),
});

export const updateBranchSchema = z.object({
  name: z
    .string()
    .min(1, "Tên cơ sở không hợp lệ")
    .max(100)
    .optional(),

  address: z
    .string()
    .min(1)
    .max(255)
    .optional(),

  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),

  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),

  allowed_radius: z
    .number()
    .min(10)
    .max(1000)
    .optional(),
});
