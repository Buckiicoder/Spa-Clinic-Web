import { z } from "zod";

// ======================================================
// GET PAYMENT PROFILE DETAIL
// ======================================================

export const paymentProfileSchema = z.object({
  profile_id: z.number(),
});

// ======================================================
// GET AVAILABLE DISCOUNTS
// ======================================================

export const availableDiscountSchema = z.object({
  customer_id: z.number(),

  profile_id: z.number(),
});

// ======================================================
// CALCULATE DISCOUNT
// ======================================================

export const calculateDiscountSchema = z.object({
  customer_id: z.number(),

  profile_id: z.number(),

  discount_id: z.number().nullable().optional(),
});

// ======================================================
// CREATE PAYMENT
// ======================================================

export const createPaymentSchema = z.object({
  customer_id: z.number(),

  profile_id: z.number(),

  discount_id: z.number().nullable().optional(),

  payment_methods: z.array(
    z.object({
      payment_method: z.enum([
        "CASH",
        "BANK_TRANSFER",
        "MOMO",
        "VNPAY",
      ]),

      amount: z.number().min(0),

      transaction_code: z
        .string()
        .nullable()
        .optional(),

      note: z.string().nullable().optional(),
    })
  ),
});