import { z } from "zod";

export const createBookingSchema = z
  .object({
    name: z.string().min(2),

    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/)
      .optional()
      .or(z.literal("")),

    email: z.string().email().optional().or(z.literal("")),

    service_id: z.number(),
    booking_date: z.string(),
    booking_time: z.string(),
    quantity: z.number().min(1).default(1),

    // ✅ thêm mới (optional → không phá FE cũ)
    note: z.string().optional(),
    doctor_id: z.number().optional(),
    consulting_by: z.number().optional(),
    is_consultation: z.boolean().optional(),

    source: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => v || null),
    customer_note: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => v || null),
    customer_status: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => v || null),
    referrer_id: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === "" || val === undefined) return null;

        const num = Number(val);
        return isNaN(num) ? null : num;
      }),
  })
  .refine(
    (data) => {
      return (
        (data.phone && data.phone !== "") || (data.email && data.email !== "")
      );
    },
    {
      message: "Phải có ít nhất số điện thoại hoặc email",
      path: ["phone"], // hiển thị lỗi ở phone
    },
  );
