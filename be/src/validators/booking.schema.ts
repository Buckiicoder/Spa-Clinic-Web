import { z } from "zod";

export const createBookingSchema = z
  .object({
    name: z.string().min(2),

    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/)
      .optional()
      .or(z.literal("")), // 👈 cho phép ""

    email: z
      .string()
      .email()
      .optional()
      .or(z.literal("")), // 👈 cho phép ""

    service_id: z.number(),
    booking_date: z.string(),
    booking_time: z.string(),
    quantity: z.number().min(1).default(1),
  })
  .refine(
    (data) => {
      return (
        (data.phone && data.phone !== "") ||
        (data.email && data.email !== "")
      );
    },
    {
      message: "Phải có ít nhất số điện thoại hoặc email",
      path: ["phone"], // hiển thị lỗi ở phone
    }
  );
