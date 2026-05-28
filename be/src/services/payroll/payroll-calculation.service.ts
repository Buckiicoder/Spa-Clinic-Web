// ======================================================
// TYPES
// ======================================================

export interface PayrollCalculationInput {
  employee_type: string;

  salary_unit: string;

  salary_amount: number;

  standard_work_days: number;

  actual_work_days: number;

  standard_work_hours: number;

  actual_work_hours: number;
}

export interface PayrollCalculationResult {
  gross_salary: number;

  missing_work_days: number;

  missing_work_hours: number;

  actual_work_days: number;

  actual_work_hours: number;
}

// ======================================================
// MAIN CALCULATION
// ======================================================

export const calculateBaseSalary = (
  input: PayrollCalculationInput,
): PayrollCalculationResult => {
  const {
    salary_unit,
    salary_amount,

    standard_work_days,
    actual_work_days,

    standard_work_hours,
    actual_work_hours,
  } = input;

  // ============================================
  // MONTHLY SALARY
  // ============================================

  if (salary_unit === "MONTHLY") {
    const dailySalary =
      salary_amount / standard_work_days;

    const grossSalary =
      dailySalary * actual_work_days;

    return {
      gross_salary: Number(grossSalary),

      missing_work_days: Math.max(
        standard_work_days - actual_work_days,
        0,
      ),

      missing_work_hours: 0,

      actual_work_days,

      actual_work_hours,
    };
  }

  // ============================================
  // HOURLY SALARY
  // ============================================

  if (salary_unit === "HOURLY") {
    const grossSalary =
      salary_amount * actual_work_hours;

    return {
      gross_salary: Number(grossSalary),

      missing_work_days: 0,

      missing_work_hours: Math.max(
        standard_work_hours - actual_work_hours,
        0,
      ),

      actual_work_days,

      actual_work_hours,
    };
  }

  // fallback
  return {
    gross_salary: 0,

    missing_work_days: 0,

    missing_work_hours: 0,

    actual_work_days,

    actual_work_hours,
  };
};