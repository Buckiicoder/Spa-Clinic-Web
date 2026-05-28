// src/services/payroll/payroll-commission.service.ts

import { PoolClient } from "pg";
import {
  getStaffSalaryConfig,
  getDoctorCommissionRevenue,
  getTechnicianWorkSummary,
} from "./payroll-query.service.js";

// ======================================================
// TYPES
// ======================================================

export interface PayrollCommissionItem {
  commission_revenue_type: string | null;

  commission_calculation_type: string | null;

  commission_unit: string | null;

  commission_value: number;

  minimum_revenue_target: number;

  actual_revenue: number;

  commission_amount: number;

  note?: string | null;

  total_work_hours?: number;

  total_work_minutes?: number;

  total_work_sessions?: number;

  calculation_base_amount?: number;

  exceeded_revenue_amount?: number;

  commission_source_type?: string;

  metadata?: any;
}

interface BuildCommissionParams {
  staff_id: number;

  payroll_id?: number;

  month: number;

  year: number;
}

// ======================================================
// MAIN
// ======================================================

/**
 * ======================================================
 * BUILD PAYROLL COMMISSION
 * ======================================================
 *
 * FLOW:
 *
 * 1. lấy salary config
 * 2. check có commission không
 * 3. check rule:
 *
 *    - PERSONAL_REVENUE
 *    - BRANCH_REVENUE
 *
 * 4. check calculation type:
 *
 *    - TOTAL_REVENUE
 *    - REVENUE_OVER_TARGET
 *
 * 5. check commission unit:
 *
 *    - PERCENT
 *    - FIXED_AMOUNT
 *
 * 6. tính commission_amount
 *
 */

export const buildPayrollCommission = async (
  params: BuildCommissionParams,
  client?: PoolClient,
) => {
  const { staff_id, month, year } = params;

  const salaryConfig = await getStaffSalaryConfig(staff_id, client);

  if (!salaryConfig) {
    return {
      commission_total: 0,
      payrollCommission: null,
    };
  }

  if (!salaryConfig.has_commission) {
    return {
      commission_total: 0,
      payrollCommission: null,
    };
  }

  const revenueType = salaryConfig.commission_revenue_type;

  let actualRevenue = 0;

  let totalWorkHours = 0;

  let totalWorkMinutes = 0;

  let totalSessions = 0;

  // ======================================================
  // DOCTOR REVENUE
  // ======================================================

  if (revenueType === "PERSONAL_REVENUE") {
    const revenueData = await getDoctorCommissionRevenue(staff_id, month, year);

    actualRevenue = revenueData.actual_revenue;
  }

  // ======================================================
  // TECHNICIAN HOURS
  // ======================================================
  else if (revenueType === "TECHNICIAN_WORK_HOUR") {
    const workSummary = await getTechnicianWorkSummary(staff_id, month, year);

    totalWorkHours = workSummary.total_work_hours;

    totalWorkMinutes = workSummary.total_work_minutes;

    totalSessions = workSummary.total_sessions;
  }

  const payrollCommission = calculateCommission({
    salaryConfig,

    actual_revenue: actualRevenue,

    total_work_hours: totalWorkHours,

    total_work_minutes: totalWorkMinutes,

    total_sessions: totalSessions,
  });

  return {
    commission_total: payrollCommission?.commission_amount || 0,

    payrollCommission,
  };
};

// ======================================================
// CALCULATE SINGLE COMMISSION
// ======================================================

interface CalculateCommissionParams {
  salaryConfig: any;

  actual_revenue: number;

  total_work_hours: number;

  total_work_minutes: number;

  total_sessions: number;
}

const calculateCommission = ({
  salaryConfig,
  actual_revenue,
  total_work_hours,
  total_work_minutes,
  total_sessions,
}: CalculateCommissionParams): PayrollCommissionItem | null => {
  const commissionRevenueType = salaryConfig.commission_revenue_type;

  const commissionCalculationType = salaryConfig.commission_calculation_type;

  const commissionUnit = salaryConfig.commission_unit;

  const commissionValue = Number(salaryConfig.commission_value || 0);

  const minimumRevenueTarget = Number(salaryConfig.minimum_revenue_target || 0);

  let commissionAmount = 0;

  // ======================================================
  // INVALID CONFIG
  // ======================================================

  if (!commissionRevenueType || !commissionCalculationType || !commissionUnit) {
    return null;
  }

  // ======================================================
  // CASE 1:
  // TOTAL_REVENUE
  // ======================================================

  /**
   * Ví dụ:
   *
   * doanh thu:
   * 200 triệu
   *
   * hoa hồng:
   * 5%
   *
   * => commission = 10 triệu
   */

  if (commissionCalculationType === "TOTAL_REVENUE") {
    commissionAmount = calculateCommissionByUnit({
      commissionUnit,

      commissionValue,

      revenue: actual_revenue,
    });
  }

  // ======================================================
  // CASE 2:
  // REVENUE_OVER_TARGET
  // ======================================================

  /**
   * Ví dụ:
   *
   * target:
   * 100 triệu
   *
   * doanh thu:
   * 160 triệu
   *
   * phần vượt:
   * 60 triệu
   *
   * hoa hồng:
   * 5%
   */
  else if (commissionCalculationType === "REVENUE_OVER_TARGET") {
    const exceededRevenue = Math.max(actual_revenue - minimumRevenueTarget, 0);

    commissionAmount = calculateCommissionByUnit({
      commissionUnit,

      commissionValue,

      revenue: exceededRevenue,
    });
  }

  // TECHNICIAN_WORK_HOUR
  if (commissionRevenueType === "TECHNICIAN_WORK_HOUR") {
    if (commissionUnit === "FIXED_AMOUNT") {
      commissionAmount = total_work_hours * commissionValue;
    }
  }

  // ======================================================
  // RESULT
  // ======================================================

  return {
    commission_revenue_type: commissionRevenueType,

    commission_calculation_type: commissionCalculationType,

    commission_unit: commissionUnit,

    commission_value: commissionValue,

    minimum_revenue_target: minimumRevenueTarget,

    actual_revenue,

    commission_amount: roundMoney(commissionAmount),

    note: buildCommissionNote({
      commissionRevenueType,

      commissionCalculationType,
    }),

    total_work_hours,

    total_work_minutes,

    total_work_sessions: total_sessions,

    calculation_base_amount:
      commissionRevenueType === "TECHNICIAN_WORK_HOUR"
        ? total_work_hours
        : actual_revenue,

    exceeded_revenue_amount: Math.max(actual_revenue - minimumRevenueTarget, 0),

    commission_source_type:
      commissionRevenueType === "TECHNICIAN_WORK_HOUR"
        ? "SESSION_TRACKING"
        : "PAYMENT",

    metadata: {
      generated_at: new Date(),

      revenue_type: commissionRevenueType,
    },
  };
};

// ======================================================
// CALCULATE BY UNIT
// ======================================================

interface CalculateCommissionByUnitParams {
  commissionUnit: string;

  commissionValue: number;

  revenue: number;
}

const calculateCommissionByUnit = ({
  commissionUnit,

  commissionValue,

  revenue,
}: CalculateCommissionByUnitParams) => {
  // ======================================================
  // PERCENT
  // ======================================================

  /**
   * ví dụ:
   *
   * 5%
   */

  if (commissionUnit === "PERCENT") {
    return (revenue * commissionValue) / 100;
  }

  // ======================================================
  // FIXED_AMOUNT
  // ======================================================

  /**
   * ví dụ:
   *
   * đạt target:
   * thưởng cứng 10 triệu
   */

  if (commissionUnit === "FIXED_AMOUNT") {
    /**
     * revenue > 0 mới được nhận
     */

    return revenue > 0 ? commissionValue : 0;
  }

  return 0;
};

// ======================================================
// BUILD NOTE
// ======================================================

interface BuildCommissionNoteParams {
  commissionRevenueType: string;

  commissionCalculationType: string;
}

const buildCommissionNote = ({
  commissionRevenueType,

  commissionCalculationType,
}: BuildCommissionNoteParams) => {
  const revenueText =
    commissionRevenueType === "PERSONAL_REVENUE"
      ? "Doanh thu cá nhân"
      : "Doanh thu chi nhánh";

  const calcText =
    commissionCalculationType === "TOTAL_REVENUE"
      ? "Tính trên tổng doanh thu"
      : "Tính trên phần vượt target";

  return `${revenueText} - ${calcText}`;
};

// ======================================================
// HELPERS
// ======================================================

const roundMoney = (value: number) => {
  return Math.round(Number(value || 0));
};
