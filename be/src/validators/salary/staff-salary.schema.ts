import { z } from "zod";

export const assignStaffSalarySchema = z.object({
  staff_id: z.number(),

  template_id: z.number().nullable().optional(),

  employee_type: z.enum(["FULLTIME", "PARTTIME", "CONTRACT"]),

  pay_period: z.enum(["MONTHLY", "WEEKLY", "DAILY"]),

  salary_amount: z.number().nullable().optional(),

  salary_unit: z.enum(["MONTHLY", "HOURLY"]),

  has_commission: z.boolean().optional(),

  commission_revenue_type: z
    .enum(["PERSONAL_REVENUE", "BRANCH_REVENUE", "WORK_HOUR"])
    .nullable()
    .optional(),

  commission_calculation_type: z
    .enum(["TOTAL_REVENUE", "REVENUE_OVER_TARGET", "WORK_HOUR"])
    .nullable()
    .optional(),

  commission_value: z.number().nullable().optional(),

  commission_unit: z.enum(["PERCENT", "FIXED_AMOUNT"]).nullable().optional(),

  minimum_revenue_target: z.number().nullable().optional(),

  effective_from: z.string(),

  effective_to: z.string().nullable().optional(),

  note: z.string().optional(),

  is_active: z.boolean().optional(),

  allowance_ids: z.array(z.number()).optional(),

  deduction_ids: z.array(z.number()).optional(),
});
