export interface SalaryAllowance {
  id?: number;

  name: string;

  amount_value: number | string;

  amount_type: "FIXED" | "PERCENT";

  apply_type: "MONTHLY" | "DAILY";
}

export interface SalaryDeduction {
  id: string;

  name: string;

  amount_value: number | string;

  amount_type: "FIXED" | "PERCENT";

  unit_type?: "DAILY" | "MONTHLY";

  condition_text?: string;
}

export interface SalaryTemplateFormState {
  name: string;

  employee_type: "FULLTIME" | "PARTTIME" | "CONTRACT";

  pay_period: "MONTHLY" | "WEEKLY" | "DAILY";

  salary_amount: string;

salary_unit:
  | "MONTHLY"
  | "HOURLY";

  has_commission: boolean;

  commission_revenue_type: string | null;

  commission_calculation_type: string | null;

  commission_value: number | string;

  commission_unit: "PERCENT" | "FIXED AMOUNT" | null;

  minimum_revenue_target: number | string;

  note: string;

  is_active: boolean;

  allowances: SalaryAllowance[];

  deductions: SalaryDeduction[];
}

export interface StaffSalaryFormState {
  template_id: string;

  employee_type:
    | "FULLTIME"
    | "PARTTIME"
    | "CONTRACT";

  pay_period:
    | "MONTHLY"
    | "WEEKLY"
    | "DAILY";

  salary_amount: number | string;

  salary_unit:
    | "MONTHLY"
    | "HOURLY";

  has_commission: boolean;

  commission_revenue_type: string | null;

  commission_calculation_type: string | null;

  commission_value: number | string;

  commission_unit: "PERCENT" | "FIXED_AMOUNT" | null;

  minimum_revenue_target: number | string;

  effective_from: string;

  effective_to: string;

  note: string;

  is_active: boolean;

  allowances: SalaryAllowance[];

  deductions: SalaryDeduction[];
}