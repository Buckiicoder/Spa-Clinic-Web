import { PoolClient } from "pg";
import { db } from "../../config/db.js";

export interface CreatePayrollInput {
  staff_id: number;

  salary_config_id?: number | null;

  month: number;

  year: number;

  employee_type: string;

  salary_unit: string;

  base_salary: number;

  standard_work_days: number;

  actual_work_days: number;

  standard_work_hours: number;

  actual_work_hours: number;

  gross_salary: number;

  ot_hours: number;

  ot_salary: number;

  allowance_total: number;

  commission_total: number;

  deduction_total: number;

  net_salary: number;

  payroll_status?: string;

  note?: string | null;
}

export interface CreatePayrollAllowanceInput {
  payroll_id: number;

  allowance_id?: number | null;

  allowance_name: string;

  amount_type: string;

  apply_type?: string | null;

  amount_value: number;

  quantity?: number;

  total_amount: number;

  note?: string | null;
}

export interface CreatePayrollDeductionInput {
  payroll_id: number;

  deduction_id?: number | null;

  deduction_name: string;

  amount_type: string;

  unit_type?: string | null;

  amount_value: number;

  quantity?: number;

  calculated_amount: number;

  note?: string | null;
}

export interface CreatePayrollCommissionInput {
  payroll_id: number;

  commission_revenue_type?: string | null;

  commission_calculation_type?: string | null;

  commission_unit?: string | null;

  commission_value?: number | null;

  minimum_revenue_target?: number | null;

  actual_revenue?: number;

  commission_amount?: number;

  note?: string | null;

  total_work_hours?: number;

  total_work_minutes?: number;

  total_work_sessions?: number;

  calculation_base_amount?: number;

  exceeded_revenue_amount?: number;

  commission_source_type?: string | null;

  metadata?: any;
}

const getExecutor = (client?: PoolClient) => {
  return client || db;
};

export const createPayroll = async (
  data: CreatePayrollInput,
  client?: PoolClient,
) => {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    INSERT INTO payrolls
    (
      staff_id,
      salary_config_id,

      month,
      year,

      employee_type,
      salary_unit,

      base_salary,

      standard_work_days,
      actual_work_days,

      standard_work_hours,
      actual_work_hours,

      gross_salary,
      allowance_total,
      commission_total,
      deduction_total,
      net_salary,

      ot_hours,
      ot_salary,

      payroll_status,
      note
    )
    VALUES
    (
      $1,$2,
      $3,$4,
      $5,$6,
      $7,
      $8,$9,
      $10,$11,
      $12,$13,$14,$15,
      $16,$17,$18,$19,$20
    )
    RETURNING *
  `,
    [
      data.staff_id,
      data.salary_config_id || null,

      data.month,
      data.year,

      data.employee_type,
      data.salary_unit,

      data.base_salary,

      data.standard_work_days,
      data.actual_work_days,

      data.standard_work_hours,
      data.actual_work_hours,

      data.gross_salary,
      data.allowance_total,
      data.commission_total,
      data.deduction_total,
      data.net_salary,

      data.ot_hours,
      data.ot_salary,

      data.payroll_status || "DRAFT",
      data.note || null,
    ],
  );

  return result.rows[0];
};

// ======================================================
// UPDATE PAYROLL SUMMARY
// ======================================================

export const updatePayrollSummary = async (
  payrollId: number,
  data: {
    gross_salary: number;

    ot_hours: number;

    ot_salary: number;

    allowance_total: number;

    commission_total: number;

    deduction_total: number;

    net_salary: number;

    payroll_status?: string;
  },
  client?: PoolClient,
) => {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
    UPDATE payrolls
    SET
      gross_salary = $1,

      ot_hours = $2,

ot_salary = $3,

      allowance_total = $4,

      commission_total = $5,

      deduction_total = $6,

      net_salary = $7,

      payroll_status = COALESCE($8, payroll_status),

      calculated_at = CURRENT_TIMESTAMP

    WHERE id = $9

    RETURNING *
  `,
    [
      data.gross_salary,

      data.ot_hours,

      data.ot_salary,

      data.allowance_total,

      data.commission_total,

      data.deduction_total,

      data.net_salary,

      data.payroll_status || null,

      payrollId,
    ],
  );

  return result.rows[0];
};

// ======================================================
// CREATE PAYROLL ALLOWANCES
// ======================================================

export const createPayrollAllowances = async (
  allowances: CreatePayrollAllowanceInput[],
  client?: PoolClient,
) => {
  if (!allowances.length) return [];

  const executor = getExecutor(client);

  const values: any[] = [];

  const placeholders = allowances.map((item, index) => {
    const base = index * 9;

    values.push(
      item.payroll_id,
      item.allowance_id || null,
      item.allowance_name,

      item.amount_type,

      item.apply_type,

      item.amount_value,

      item.quantity || 1,

      item.total_amount,

      item.note || null,
    );

    return `
      (
        $${base + 1},
        $${base + 2},
        $${base + 3},
        $${base + 4},
        $${base + 5},
        $${base + 6},
        $${base + 7},
        $${base + 8},
        $${base + 9}
      )
    `;
  });

  const result = await executor.query(
    `
    INSERT INTO payroll_allowances
    (
      payroll_id,
      allowance_id,
      allowance_name,
      amount_type,
      apply_type,
      amount_value,
      quantity,
      total_amount,
      note
    )
    VALUES
    ${placeholders.join(",")}
    RETURNING *
  `,
    values,
  );

  return result.rows;
};

// ======================================================
// CREATE PAYROLL DEDUCTIONS
// ======================================================

export const createPayrollDeductions = async (
  deductions: CreatePayrollDeductionInput[],
  client?: PoolClient,
) => {
  if (!deductions.length) return [];

  const executor = getExecutor(client);

  const values: any[] = [];

  const placeholders = deductions.map((item, index) => {
    const base = index * 9;

    values.push(
      item.payroll_id,
      item.deduction_id || null,
      item.deduction_name,
      item.amount_type,
      item.unit_type,
      item.amount_value,
      item.quantity || 1,
      item.calculated_amount,
      item.note || null,
    );

    return `
      (
        $${base + 1},
        $${base + 2},
        $${base + 3},
        $${base + 4},
        $${base + 5},
        $${base + 6},
        $${base + 7},
        $${base + 8},
        $${base + 9}
      )
    `;
  });

  const result = await executor.query(
    `
    INSERT INTO payroll_deductions
    (
      payroll_id,
      deduction_id,
      deduction_name,
      amount_type,
      unit_type,
      amount_value,
      quantity,
      calculated_amount,
      note
    )
    VALUES
    ${placeholders.join(",")}
    RETURNING *
  `,
    values,
  );

  return result.rows;
};

// ======================================================
// CREATE PAYROLL COMMISSION
// ======================================================

export const createPayrollCommission = async (
  data: CreatePayrollCommissionInput,
  client?: PoolClient,
) => {
  const executor = getExecutor(client);

  const result = await executor.query(
    `
  INSERT INTO payroll_commissions (
    payroll_id,

    commission_revenue_type,
    commission_calculation_type,

    commission_unit,
    commission_value,

    minimum_revenue_target,

    actual_revenue,

    commission_amount,

    total_work_sessions,
    total_work_hours,
    total_work_minutes,

    calculation_base_amount,
    exceeded_revenue_amount,

    commission_source_type,

    metadata,

    note
  )
  VALUES
  (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14,
    $15,
    $16
  )
  RETURNING *
`,
    [
      data.payroll_id,

      data.commission_revenue_type || null,
      data.commission_calculation_type || null,

      data.commission_unit || null,
      data.commission_value || null,

      data.minimum_revenue_target || null,

      data.actual_revenue || 0,

      data.commission_amount || 0,

      data.total_work_sessions || 0,
      data.total_work_hours || 0,
      data.total_work_minutes || 0,

      data.calculation_base_amount || 0,

      data.exceeded_revenue_amount || 0,

      data.commission_source_type || null,

      JSON.stringify(data.metadata || {}),

      data.note || null,
    ],
  );

  return result.rows[0];
};

// ======================================================
// DELETE OLD PAYROLL DATA
// ======================================================

export const deletePayrollRelations = async (
  payrollId: number,
  client?: PoolClient,
) => {
  const executor = getExecutor(client);

  await executor.query(
    `
    DELETE FROM payroll_allowances
    WHERE payroll_id = $1
  `,
    [payrollId],
  );

  await executor.query(
    `
    DELETE FROM payroll_deductions
    WHERE payroll_id = $1
  `,
    [payrollId],
  );

  await executor.query(
    `
    DELETE FROM payroll_commissions
    WHERE payroll_id = $1
  `,
    [payrollId],
  );
};

// ======================================================
// DELETE PAYROLL
// ======================================================

export const deletePayroll = async (payrollId: number, client?: PoolClient) => {
  const executor = getExecutor(client);

  await executor.query(
    `
    DELETE FROM payrolls
    WHERE id = $1
  `,
    [payrollId],
  );
};

// ======================================================
// UPSERT PAYROLL
// ======================================================

export const upsertPayroll = async (
  data: CreatePayrollInput,
  client?: PoolClient,
) => {
  const executor = getExecutor(client);

  const existing = await executor.query(
    `
    SELECT id
    FROM payrolls
    WHERE
      staff_id = $1
      AND month = $2
      AND year = $3
    LIMIT 1
  `,
    [data.staff_id, data.month, data.year],
  );

  // ============================================
  // UPDATE EXISTING
  // ============================================

  if (existing.rows.length > 0) {
    const payrollId = existing.rows[0].id;

    const result = await executor.query(
      `
      UPDATE payrolls
      SET
        salary_config_id = $1,

        employee_type = $2,
        salary_unit = $3,

        base_salary = $4,

        standard_work_days = $5,
        actual_work_days = $6,

        standard_work_hours = $7,
        actual_work_hours = $8,

        gross_salary = $9,
        ot_hours = $10,
        ot_salary = $11,

        allowance_total = $12,
        commission_total = $13,
        deduction_total = $14,
        net_salary = $15,

        payroll_status = $16,
        note = $17,

        calculated_at = CURRENT_TIMESTAMP

      WHERE id = $18

      RETURNING *
    `,
      [
        data.salary_config_id || null,

        data.employee_type,
        data.salary_unit,

        data.base_salary,

        data.standard_work_days,
        data.actual_work_days,

        data.standard_work_hours,
        data.actual_work_hours,

        data.gross_salary,

        data.ot_hours,
        data.ot_salary,

        data.allowance_total,
        data.commission_total,
        data.deduction_total,
        data.net_salary,

        data.payroll_status || "DRAFT",
        data.note || null,

        payrollId,
      ],
    );

    return result.rows[0];
  }

  // ============================================
  // CREATE NEW
  // ============================================

  return createPayroll(data, client);
};
