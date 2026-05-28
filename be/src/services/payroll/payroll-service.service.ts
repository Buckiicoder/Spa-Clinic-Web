import { PoolClient } from "pg";
import dayjs from "dayjs";
import { db } from "../../config/db.js";

// QUERY
import {
  getStaffSalaryConfig,
  getStaffTimekeepingSummary,
  getExistingPayroll,
  getPayrolls,
  getStandardWorkDaysOfMonth,
  getAllActiveStaffs,
} from "./payroll-query.service.js";

// CALCULATION
import { calculateBaseSalary } from "./payroll-calculation.service.js";

// ALLOWANCE
import { buildPayrollAllowances } from "./payroll-allowance.service.js";

// DEDUCTION
import { buildPayrollDeductions } from "./payroll-deduction.service.js";

// COMMISSION
import { buildPayrollCommission } from "./payroll-commission.service.js";

// PERSISTENCE
import {
  upsertPayroll,
  deletePayrollRelations,
  createPayrollAllowances,
  createPayrollDeductions,
  createPayrollCommission,
} from "./payroll-persistence.service.js";
 
export interface GeneratePayrollInput {
  staff_id: number;

  month: number;

  year: number;

  payroll_status?: string;

  note?: string | null;
}

// ======================================================
// GENERATE PAYROLL
// ======================================================

export const generatePayroll = async (input: GeneratePayrollInput) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await generatePayrollTransaction(input, client);

    await client.query("COMMIT");

    return result;
  } catch (err) {
    await client.query("ROLLBACK");

    throw err;
  } finally {
    client.release();
  }
};

// ======================================================
// GENERATE PAYROLL TRANSACTION
// ======================================================

export const generatePayrollTransaction = async (
  input: GeneratePayrollInput,
  client: PoolClient,
) => {
  const { staff_id, month, year, payroll_status = "FINALIZED", note } = input;

  // ====================================================
  // 1. GET SALARY CONFIG
  // ====================================================

  const salaryConfig = await getStaffSalaryConfig(staff_id, client);

  if (!salaryConfig) {
    throw new Error("Nhân viên chưa có cấu hình lương");
  }

  // ====================================================
  // 2. GET ATTENDANCE SUMMARY
  // ====================================================

  const attendanceSummary = await getStaffTimekeepingSummary(
    staff_id,
    month,
    year,
    client,
  );

  const standardWorkDays = getStandardWorkDaysOfMonth(month, year);

  // ====================================================
  // 3. CALCULATE BASE SALARY
  // ====================================================

  const salaryCalculation = calculateBaseSalary({
    employee_type: salaryConfig.employee_type,

    salary_unit: salaryConfig.salary_unit,

    salary_amount: Number(salaryConfig.salary_amount),

    standard_work_days: standardWorkDays,

    actual_work_days: Number(attendanceSummary.full_work_days || 0),

    standard_work_hours: Number(attendanceSummary.standard_work_hours || 208),

    actual_work_hours: Number(attendanceSummary.total_work_hours || 0),
  });

  // ====================================================
  // 4. GET ALLOWANCES
  // ====================================================

  const allowanceCalculation = await buildPayrollAllowances(
    {
      staff_id,

      month,
      year,

      gross_salary: salaryCalculation.gross_salary,

      actual_work_days: salaryCalculation.actual_work_days,

      actual_work_hours: salaryCalculation.actual_work_hours,
    },
    client,
  );

    // ====================================================
  // 6. CALCULATE COMMISSION
  // ====================================================

  const commissionCalculation = await buildPayrollCommission(
    {
      staff_id,

      month,
      year,
    },
    client,
  );

  // ====================================================
  // 5. GET DEDUCTIONS
  // ====================================================

  const deductionCalculation = await buildPayrollDeductions(
    {
      staff_id,

      month,
      year,

      gross_salary: salaryCalculation.gross_salary,

      allowance_total: allowanceCalculation.allowance_total,

      commission_total: commissionCalculation.commission_total,

      actual_work_days: salaryCalculation.actual_work_days,

      actual_work_hours: salaryCalculation.actual_work_hours,

      standard_work_days: standardWorkDays,

      standard_work_hours: Number(attendanceSummary.standard_work_hours || 208),
    },
    client,
  );

  // ====================================================
  // 7. NET SALARY
  // ====================================================

  const netSalary =
    salaryCalculation.gross_salary +
    allowanceCalculation.allowance_total -
    deductionCalculation.deduction_total +
    commissionCalculation.commission_total;

  // ====================================================
  // 8. UPSERT PAYROLL
  // ====================================================

  const payroll = await upsertPayroll(
    {
      staff_id,

      salary_config_id: salaryConfig.id,

      month,
      year,

      employee_type: salaryConfig.employee_type,

      salary_unit: salaryConfig.salary_unit,

      base_salary: Number(salaryConfig.salary_amount),

      standard_work_days: standardWorkDays,

      actual_work_days: salaryCalculation.actual_work_days,

      standard_work_hours: Number(attendanceSummary.standard_work_hours || 208),
      actual_work_hours: salaryCalculation.actual_work_hours,

      gross_salary: salaryCalculation.gross_salary,

      allowance_total: allowanceCalculation.allowance_total,

      commission_total: commissionCalculation.commission_total,

      deduction_total: deductionCalculation.deduction_total,

      net_salary: Number(netSalary),

      payroll_status,

      note: note || null,
    },
    client,
  );

  // ====================================================
  // 9. DELETE OLD RELATIONS
  // ====================================================

  await deletePayrollRelations(payroll.id, client);

  // ====================================================
// 10. INSERT ALLOWANCES
// ====================================================

if (allowanceCalculation.payrollAllowances.length) {
  await createPayrollAllowances(
    allowanceCalculation.payrollAllowances.map((item) => ({
      payroll_id: payroll.id,

      allowance_id: item.allowance_id,

      allowance_name: item.allowance_name,

      amount_type: item.amount_type,

      amount_value: item.amount_value,

      quantity: item.quantity || 1,

      total_amount: item.total_amount,

      apply_type: item.apply_type || null,

      note: item.note || null,
    })),
    client,
  );
}

// 11. INSERT DEDUCTIONS
if (deductionCalculation.payrollDeductions.length) {
  await createPayrollDeductions(
    deductionCalculation.payrollDeductions.map((item) => ({
      payroll_id: payroll.id,

      deduction_id: item.deduction_id,

      deduction_name: item.deduction_name,

      amount_type: item.amount_type,

      amount_value: item.amount_value,

      calculated_amount: item.calculated_amount,

      unit_type: item.unit_type || null,

      quantity: item.quantity || 1,

      note: item.note || null,
    })),
    client,
  );
}

  // ====================================================
  // 12. INSERT COMMISSION
  // ====================================================

  if (
    commissionCalculation.commission_total > 0 &&
    commissionCalculation.payrollCommission
  ) {
    await createPayrollCommission(
      {
  payroll_id: payroll.id,

  commission_revenue_type:
    commissionCalculation
      .payrollCommission
      .commission_revenue_type,

  commission_calculation_type:
    commissionCalculation
      .payrollCommission
      .commission_calculation_type,

  commission_unit:
    commissionCalculation
      .payrollCommission
      .commission_unit,

  commission_value:
    commissionCalculation
      .payrollCommission
      .commission_value,

  minimum_revenue_target:
    commissionCalculation
      .payrollCommission
      .minimum_revenue_target,

  actual_revenue:
    commissionCalculation
      .payrollCommission
      .actual_revenue,

  commission_amount:
    commissionCalculation
      .payrollCommission
      .commission_amount,

  total_work_sessions:
    commissionCalculation
      .payrollCommission
      .total_work_sessions || 0,

  total_work_hours:
    commissionCalculation
      .payrollCommission
      .total_work_hours || 0,

  total_work_minutes:
    commissionCalculation
      .payrollCommission
      .total_work_minutes || 0,

  calculation_base_amount:
    commissionCalculation
      .payrollCommission
      .calculation_base_amount || 0,

  exceeded_revenue_amount:
    commissionCalculation
      .payrollCommission
      .exceeded_revenue_amount || 0,

  commission_source_type:
    commissionCalculation
      .payrollCommission
      .commission_source_type || undefined,

  metadata:
    commissionCalculation
      .payrollCommission
      .metadata || {},

  note:
    commissionCalculation
      .payrollCommission
      .note || null,
},
      client,
    );
  }


  // 13. RETURN DETAIL
  return {
    payroll,

    attendance: attendanceSummary,

    salary_calculation: salaryCalculation,

    allowances: allowanceCalculation,

    deductions: deductionCalculation,

    commission: commissionCalculation,
  };
};

// ======================================================
// GENERATE MULTIPLE PAYROLLS
// ======================================================

export const generateMultiplePayrolls = async (
  staffIds: number[],

  month: number,

  year: number,
) => {
  const results = [];

  for (const staffId of staffIds) {
    try {
      const payroll = await generatePayroll({
        staff_id: staffId,

        month,
        year,
      });

      results.push({
        staff_id: staffId,

        success: true,

        data: payroll,
      });
    } catch (err: any) {
      results.push({
        staff_id: staffId,

        success: false,

        error: err.message,
      });
    }
  }

  return results;
};

// Auto sync payroll toàn bộ nhân viên mỗi ngày

export const generateDailyPayrolls = async () => {
  const now = dayjs();

  const month = now.month() + 1;

  const year = now.year();

  const staffs = await getAllActiveStaffs();

  const results = [];

  for (const staff of staffs) {
    try {
      const payroll = await generatePayroll({
        staff_id: staff.id,

        month,
        year,

        // chưa chốt tháng
        payroll_status: "DRAFT",

        note: "AUTO_DAILY_SYNC",
      });

      results.push({
        staff_id: staff.id,

        success: true,

        payroll_id: payroll.payroll.id,
      });
      
      console.log("PAYROLL ERROR", {
  staff_id: staff.id,
});
    } catch (err: any) {
      results.push({
        staff_id: staff.id,

        success: false,

        error: err.message,

        
      });

      console.log("PAYROLL ERROR", {
  staff_id: staff.id,
  error: err,
});
    }
  }
  

  return {
    total: staffs.length,

    success: results.filter((x) => x.success).length,

    failed: results.filter((x) => !x.success).length,

    results,
  };
};

// RUN PAYROLL DAILY SYNC NOW
// Dùng để test manual

export const runPayrollDailySyncNow = async () => {
  return generateDailyPayrolls();
};


// REGENERATE PAYROLL
export const regeneratePayroll = async (
  staff_id: number,

  month: number,

  year: number,
) => {
  const oldPayroll = await getExistingPayroll(staff_id, month, year);

  if (!oldPayroll) {
    throw new Error("Không tìm thấy bảng lương");
  }

  return generatePayroll({
    staff_id,
    month,
    year,
  });
};

export const getPayrollList = async (filters?: {
  keyword?: string;

  employee_type?: string;

  salary_unit?: string;

  month?: number;

  year?: number;
}) => {
  return getPayrolls(filters);
};
