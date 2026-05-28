import { z } from "zod";

// ================= CREATE ALLOWANCE =================

export const createSalaryAllowanceSchema = z.object({
  name: z.string().min(1),

  amount_type: z.enum([
    "FIXED",
    "PERCENT",
  ]),

  amount_value: z.number(),

  apply_type: z.enum([
    "DAILY",
    "MONTHLY",
  ]),

  is_active: z.boolean().optional(),
});