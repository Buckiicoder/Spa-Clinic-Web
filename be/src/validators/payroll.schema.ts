import { z } from "zod";

// GENERATE PAYROLL
export const generatePayrollSchema = z.object({
  staff_id: z.number(),

  month: z.number().min(1).max(12),

  year: z.number().min(2000),

  payroll_status: z
    .string()
    .optional(),

  note: z
    .string()
    .nullable()
    .optional(),
});

// GENERATE MULTIPLE PAYROLLS
export const generateMultiplePayrollsSchema =
  z.object({
    staff_ids: z.array(z.number()),

    month: z.number().min(1).max(12),

    year: z.number().min(2000),
  });

// ======================================================
// REGENERATE PAYROLL
// ======================================================

export const regeneratePayrollSchema =
  z.object({
    staff_id: z.number(),

    month: z.number().min(1).max(12),

    year: z.number().min(2000),
  });