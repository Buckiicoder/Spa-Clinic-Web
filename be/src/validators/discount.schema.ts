import { z } from "zod";

// ======================================================
// GET ALL DISCOUNTS
// ======================================================

export const getDiscountsSchema = z.object({
  keyword: z.string().optional(),

  is_active: z.boolean().optional(),

  discount_type: z
    .enum(["PERCENT", "FIXED"])
    .optional(),

  minimum_customer_rank: z
    .enum([
      "BRONZE",
      "SILVER",
      "GOLD",
      "DIAMOND",
      "VIP",
      "SUPER_VIP",
    ])
    .optional(),
});

// ======================================================
// GET DETAIL
// ======================================================

export const discountIdSchema = z.object({
  id: z.number(),
});

// ======================================================
// CREATE DISCOUNT
// ======================================================

export const createDiscountSchema = z.object({
  code: z.string().min(1),

  name: z.string().min(1),

  description: z.string().nullable().optional(),

  discount_type: z.enum(["PERCENT", "FIXED"]),

  discount_value: z.number().min(0),

  max_discount_amount: z
    .number()
    .nullable()
    .optional(),

  min_order_amount: z.number().optional(),

  usage_limit: z.number().nullable().optional(),

  usage_limit_per_customer: z
    .number()
    .optional(),

  minimum_customer_rank: z
    .enum([
      "BRONZE",
      "SILVER",
      "GOLD",
      "DIAMOND",
      "VIP",
      "SUPER_VIP",
    ])
    .nullable()
    .optional(),

  first_visit_only: z.boolean().optional(),

  start_date: z.string(),

  end_date: z.string(),

  is_active: z.boolean().optional(),

  service_ids: z.array(z.number()).optional(),

  service_package_ids: z
    .array(z.number())
    .optional(),
});

// ======================================================
// UPDATE DISCOUNT
// ======================================================

export const updateDiscountSchema =
  createDiscountSchema.partial();

// ======================================================
// DELETE DISCOUNT
// ======================================================

export const deleteDiscountSchema = z.object({
  id: z.number(),
});