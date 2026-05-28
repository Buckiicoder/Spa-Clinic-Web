import { z } from "zod";

// ================= CREATE TEMPLATE =================

export const createSalaryTemplateSchema = z.object({
  name: z.string().min(1),

  employee_type: z.enum(["FULLTIME", "PARTTIME", "CONTRACT"]),

  pay_period: z.enum(["MONTHLY", "WEEKLY", "DAILY"]),

  salary_amount: z.number(),

  salary_unit: z.enum(["MONTHLY", "HOURLY"]),

  has_commission: z.boolean().optional(),

  commission_revenue_type: z
    .enum(["PERSONAL_REVENUE", "BRANCH_REVENUE"])
    .nullable()
    .optional(),

  commission_calculation_type: z
    .enum(["TOTAL_REVENUE", "REVENUE_OVER_TARGET"])
    .nullable()
    .optional(),

  commission_value: z.number().nullable().optional(),

  commission_unit: z.enum(["PERCENT","FIXED"]).nullable().optional(),

  minimum_revenue_target: z.number().nullable().optional(),

  note: z.string().optional(),

  is_active: z.boolean().optional(),

  allowance_ids: z.array(z.number()).optional(),

  deduction_ids: z.array(z.number()).optional(),
});

// ================= UPDATE TEMPLATE =================

export const updateSalaryTemplateSchema = createSalaryTemplateSchema.partial();
