import { z } from "zod";

// ================= CREATE DEDUCTION =================

export const createSalaryDeductionSchema =
  z.object({
    name: z.string().min(1),

    amount_type: z.enum([
      "FIXED",
      "PERCENT",
    ]),

    amount_value: z.number(),

    unit_type: z.enum([
      "DAILY",
      "MONTHLY",
    ]),

    condition_text: z
      .string()
      .optional(),

    note: z.string().optional(),
  });