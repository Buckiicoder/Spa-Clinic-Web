// src/services/payroll/payroll-deduction.service.ts

import { PoolClient } from "pg";
import { getStaffDeductions } from "./payroll-query.service.js";

// ======================================================
// TYPES
// ======================================================

export interface PayrollDeductionItem {
  deduction_id: number | null;

  deduction_name: string;

  amount_type: string;

  amount_value: number;

  unit_type: string;

  quantity: number;

  calculated_amount: number;

  note?: string | null;
}

interface BuildDeductionParams {
  staff_id: number;

  payroll_id?: number;

  month: number;

  year: number;

  gross_salary: number;

  allowance_total: number;

  commission_total: number;

  actual_work_days: number;

  actual_work_hours: number;

  standard_work_days?: number;

  standard_work_hours?: number;
}

// ======================================================
// MAIN
// ======================================================

/**
 * ======================================================
 * BUILD PAYROLL DEDUCTIONS
 * ======================================================
 *
 * Luồng:
 *
 * 1. Lấy danh sách giảm trừ nhân viên
 * 2. Tính từng khoản:
 *    - bảo hiểm
 *    - công đoàn
 *    - nghỉ quá số công
 *    - phạt
 *    - %
 *    - cố định
 *
 * 3. Trả về:
 *    - deduction_total
 *    - payroll deductions
 *
 */

export const buildPayrollDeductions = async (
  params: BuildDeductionParams,
  client?: PoolClient,
) => {
  const {
    staff_id,

    gross_salary,

    allowance_total,

    commission_total,

    actual_work_days,

    actual_work_hours,
  } = params;

  // ======================================================
  // GET STAFF DEDUCTIONS
  // ======================================================

  const deductions = await getStaffDeductions(staff_id, client);

  const payrollDeductions: PayrollDeductionItem[] = [];

  let deduction_total = 0;

  // ======================================================
  // TAXABLE INCOME
  // ======================================================

  /**
   * Có thể thay đổi rule sau:
   *
   * gross
   * + allowance
   * + commission
   */

  const taxableSalary =
    Number(gross_salary || 0) +
    Number(allowance_total || 0) +
    Number(commission_total || 0);

  // ======================================================
  // LOOP
  // ======================================================

  for (const deduction of deductions) {
    const calculated = calculateSingleDeduction({
      deduction,

      taxableSalary,

      gross_salary,

      actual_work_days,

      actual_work_hours,

      standard_work_days: params.standard_work_days,

      standard_work_hours: params.standard_work_hours,
    });
    if (!calculated) continue;

    payrollDeductions.push(calculated);

    deduction_total += calculated.calculated_amount;
  }

  return {
    deduction_total: roundMoney(deduction_total),

    payrollDeductions,
  };
};

// ======================================================
// SINGLE DEDUCTION
// ======================================================

interface SingleDeductionParams {
  deduction: any;

  taxableSalary: number;

  gross_salary: number;

  actual_work_days: number;

  actual_work_hours: number;

  standard_work_days?: number;

  standard_work_hours?: number;
}

const calculateSingleDeduction = ({
  deduction,

  taxableSalary,

  gross_salary,

  actual_work_days,

  actual_work_hours,

  standard_work_days,

  standard_work_hours,
}: SingleDeductionParams): PayrollDeductionItem | null => {
  const amountType = deduction.amount_type;

  const amountValue = Number(deduction.amount_value || 0);

  const unitType = deduction.unit_type;

  let quantity = 1;

  let calculatedAmount = 0;

  // STANDARD
  const standardDays = standard_work_days || 26;

  const standardHours = standard_work_hours || 176;

  // MISSING
  const missingDays = Math.max(standardDays - actual_work_days, 0);

  const missingHours = Math.max(standardHours - actual_work_hours, 0);

  // DAILY
  /**
   * Ví dụ:
   *
   * - nghỉ 1 ngày trừ 100k
   * - BH theo ngày
   */

  if (unitType === "DAILY") {
    quantity = missingDays;

    // FIXED
    if (amountType === "FIXED") {
      calculatedAmount = quantity * amountValue;
    }

    // PERCENT
    else if (amountType === "PERCENT") {
      const salaryPerDay = Number(gross_salary || 0) / standardDays;

      calculatedAmount = quantity * ((salaryPerDay * amountValue) / 100);
    } else {
      return null;
    }
  }

  // MONTHLY
  /**
   * Ví dụ:
   *
   * - bảo hiểm 10.5%
   * - công đoàn 100k/tháng
   */
  else if (unitType === "MONTHLY") {
    quantity = 1;

    // FIXED
    if (amountType === "FIXED") {
      calculatedAmount = amountValue;
    }

    // PERCENT
    else if (amountType === "PERCENT") {
      calculatedAmount = (Number(taxableSalary || 0) * amountValue) / 100;
    } else {
      return null;
    }
  }

  // ======================================================
  // UNKNOWN UNIT
  // ======================================================
  else {
    return null;
  }

  return {
    deduction_id: deduction.id,

    deduction_name: deduction.name,

    amount_type: amountType,

    unit_type: unitType,

    amount_value: amountValue,

    quantity,

    calculated_amount: roundMoney(calculatedAmount),

    note: deduction.note || deduction.condition_text || null,
  };
};

const roundMoney = (value: number) => {
  return Math.round(Number(value || 0));
};
