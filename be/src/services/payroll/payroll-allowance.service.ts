// src/services/payroll/payroll-allowance.service.ts

import { PoolClient } from "pg";
import { getStaffAllowances } from "./payroll-query.service.js";

// ======================================================
// TYPES
// ======================================================

export interface PayrollAllowanceItem {
  allowance_id: number | null;

  allowance_name: string;

  amount_type: string;

  amount_value: number;

  apply_type?: string | null;

  calculation_base?: number;

  quantity: number;

  total_amount: number;

  note?: string | null;
}

interface BuildAllowanceParams {
  staff_id: number;

  payroll_id?: number;

  month: number;

  year: number;

  gross_salary: number;

  actual_work_days: number;

  actual_work_hours: number;

  total_service_count?: number;

  total_consultation_success?: number;
}

/**
 * ======================================================
 * BUILD PAYROLL ALLOWANCES
 * ======================================================
 *
 * Luồng:
 *
 * 1. Lấy toàn bộ phụ cấp của nhân viên
 * 2. Tính từng phụ cấp theo amount_type
 * 3. Trả về danh sách payroll_allowances
 * 4. Đồng thời tính tổng allowance_total
 *
 */
export const buildPayrollAllowances = async (params: BuildAllowanceParams,
  client?: PoolClient
) => {
  const {
    staff_id,

    gross_salary,

    actual_work_days,

    actual_work_hours,

    total_service_count = 0,

    total_consultation_success = 0,
  } = params;

  // ======================================================
  // GET STAFF ALLOWANCES
  // ======================================================

  const allowances = await getStaffAllowances(staff_id ,client);

  const payrollAllowances: PayrollAllowanceItem[] = [];

  let allowance_total = 0;

  // ======================================================
  // LOOP CALCULATE
  // ======================================================

  for (const allowance of allowances) {
    const calculated = calculateSingleAllowance({
      allowance,

      gross_salary,

      actual_work_days,

      actual_work_hours,

      total_service_count,

      total_consultation_success,
    });

    if (!calculated) continue;

    payrollAllowances.push(calculated);

    allowance_total += calculated.total_amount;
  }

  return {
    allowance_total,

    payrollAllowances,
  };
};

// ======================================================
// SINGLE ALLOWANCE CALCULATOR
// ======================================================

interface SingleAllowanceParams {
  allowance: any;

  gross_salary: number;

  actual_work_days: number;

  actual_work_hours: number;

  total_service_count: number;

  total_consultation_success: number;
}

const calculateSingleAllowance = ({
  allowance,

  gross_salary,

  actual_work_days,

  actual_work_hours,

  total_service_count,

  total_consultation_success,
}: SingleAllowanceParams): PayrollAllowanceItem | null => {
  const amountType = String(allowance.amount_type || "").toUpperCase();

  const applyType = String(allowance.apply_type || "").toUpperCase();

  const amountValue = Number(allowance.amount_value || 0);

  let quantity = 1;

  let totalAmount = 0;

  // calculate apply (daily || monthly)

  switch (applyType) {
    case "MONTHLY":
      quantity = 1;
      break;

    case "DAILY":
      quantity = actual_work_days;
      break;

    case "HOURLY":
      quantity = actual_work_hours;
      break;

    case "PER_SERVICE":
      quantity = total_service_count;
      break;

    case "PER_CONSULTATION":
      quantity = total_consultation_success;
      break;

    case "ATTENDANCE":
      quantity = actual_work_days >= 26 ? 1 : 0;
      break;

    default:
      quantity = 1;
  }

  // calculate amount
  if (amountType === "FIXED") {
    totalAmount = quantity * amountValue;
  } else if (amountType === "PERCENT") {
    totalAmount = ((gross_salary * amountValue) / 100) * quantity;
  } else {
    return null;
  }

  return {
    allowance_id: allowance.id,

    allowance_name: allowance.name,

    amount_type: amountType,

    apply_type: applyType,

    amount_value: amountValue,

    quantity,

    total_amount: roundMoney(totalAmount),

    note: allowance.note || null,
  };
};

// HELPERS

const roundMoney = (value: number) => {
  return Math.round(Number(value || 0));
};
