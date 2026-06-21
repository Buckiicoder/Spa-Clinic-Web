import { z } from "zod";

export const paymentProfileSchema = z.object({
  profile_id: z.number(),
});

export const availableDiscountSchema = z.object({
  customer_id: z.number(),

  profile_id: z.number(),
});

export const calculateDiscountSchema = z.object({
  customer_id: z.number(),

  profile_id: z.number(),

  discount_id: z.number().nullable().optional(),
});

export const createPaymentSchema = z.object({
  customer_id: z.number(),

  profile_id: z.number(),

  discount_id: z.number().nullable().optional(),

  payment_methods: z.array(
    z.object({
      payment_method: z.enum(["CASH", "BANK_TRANSFER", "MOMO", "VNPAY"]),
      amount: z.number().min(0),
      transaction_code: z.string().nullable().optional(),
      note: z.string().nullable().optional(),
    }),
  ),
});

// ======================================================
// GET ALL PAYMENTS
// ======================================================

export const getAllPaymentsSchema = z.object({
  day: z.coerce.number().optional(),

  month: z.coerce.number().min(1).max(12),

  year: z.coerce.number(),

  // status: z
  //   .enum([
  //     "pending",
  //     "partial_paid",
  //     "paid",
  //     "cancelled",
  //   ])
  //   .optional(),
  status: z.string().optional(),
});

export const paymentBillDetailSchema = z.object({
  payment_id: z.number(),
});

export const createVNPaySchema = z.object({
  profile_id: z.number(),

  discount_id: z.number().nullable().optional(),

  amount: z.number().positive(),

  source: z.enum(["customer", "staff"]).optional(),
});

export const createZaloPaySchema =
  z.object({
    profile_id:
      z.number(),

    discount_id: z
      .number()
      .nullable()
      .optional(),

    amount:
      z.number().positive(),
  });