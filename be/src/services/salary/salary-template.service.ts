import { db } from "../../config/db.js";
import { PoolClient } from "pg";

const getExecutor = (
  client?: PoolClient,
) => {
  return client || db;
};

// =========================
// GET ALL TEMPLATES
// =========================

export const getSalaryTemplates = async (client?: PoolClient) => {
  const executor = getExecutor(client);

  const result = await executor.query(`
    SELECT
      st.*,

      COUNT(DISTINCT ta.allowance_id)
        AS allowance_count,

      COUNT(DISTINCT td.deduction_id)
        AS deduction_count

    FROM salary_templates st

    LEFT JOIN template_allowances ta
      ON ta.template_id = st.id

    LEFT JOIN template_deductions td
      ON td.template_id = st.id

    GROUP BY st.id

    ORDER BY st.created_at DESC
  `);

  return result.rows;
};

// =========================
// GET TEMPLATE DETAIL
// =========================

export const getSalaryTemplateDetail = async (
  id: number,
  client?: PoolClient,
) => {
  const executor = getExecutor(client);
  // template
  const templateRes = await executor.query(
    `
    SELECT *
    FROM salary_templates
    WHERE id = $1
  `,
    [id],
  );

  const template = templateRes.rows[0];

  if (!template) return null;

  // allowances
  const allowanceRes = await db.query(
    `
    SELECT sa.*

    FROM template_allowances ta

    INNER JOIN salary_allowances sa
      ON sa.id = ta.allowance_id

    WHERE ta.template_id = $1

    ORDER BY sa.id ASC
  `,
    [id],
  );

  // deductions
  const deductionRes = await db.query(
    `
    SELECT sd.*

    FROM template_deductions td

    INNER JOIN salary_deductions sd
      ON sd.id = td.deduction_id

    WHERE td.template_id = $1

    ORDER BY sd.id ASC
  `,
    [id],
  );

  return {
    ...template,

    allowances: allowanceRes.rows,

    deductions: deductionRes.rows,
  };
};
// =========================
// CREATE TEMPLATE
// =========================

export const createSalaryTemplate = async (
  data: any,
  client?: PoolClient,
) => {
  const executor = getExecutor(client);

  const {
    name,
    employee_type,
    pay_period,
    
    salary_amount,
salary_unit,

    has_commission,
    commission_revenue_type,
    commission_calculation_type,
    commission_value,
    commission_unit,
    minimum_revenue_target,

    note,
    is_active,
  } = data;

  const result = await executor.query(
    `
    INSERT INTO salary_templates
    (
      name,
      employee_type,
      pay_period,

      salary_amount,
salary_unit,

      has_commission,
      commission_revenue_type,
      commission_calculation_type,
      commission_value,
      commission_unit,
      minimum_revenue_target,

      note,
      is_active
    )
    VALUES
    (
      $1,$2,$3,$4,
      $5,$6,
      $7,$8,$9,$10,$11,
      $12, $13
    )
    RETURNING *
  `,
    [
      name,
      employee_type,
      pay_period,
     salary_amount,
salary_unit,
      has_commission,
      commission_revenue_type,
      commission_calculation_type,
      commission_value,
      commission_unit,
      minimum_revenue_target,

      note,
      is_active ?? true,
    ],
  );

  return result.rows[0];
};

// =========================
// UPDATE TEMPLATE
// =========================

export const updateSalaryTemplate = async (
  id: number,
  data: any,
  client?: PoolClient,
) => {
  const executor = getExecutor(client);

  const {
    name,
    employee_type,
    pay_period,
    salary_amount,
salary_unit,

    has_commission,
    commission_revenue_type,
    commission_calculation_type,
    commission_value,
    commission_unit,
    minimum_revenue_target,

    note,
    is_active,
  } = data;

  const result = await executor.query(
    `
    UPDATE salary_templates
    SET
      name = $1,
      employee_type = $2,
      pay_period = $3,
      salary_amount = $4,
salary_unit = $5,

      has_commission = $6,
      commission_revenue_type = $7,
      commission_calculation_type = $8,
      commission_value = $9,
      commission_unit = $10,
      minimum_revenue_target = $11,

      note = $12,
      is_active = $13

    WHERE id = $14

    RETURNING *
  `,
    [
      name,
      employee_type,
      pay_period,
      salary_amount,
salary_unit,

      has_commission,
      commission_revenue_type,
      commission_calculation_type,
      commission_value,
      commission_unit,
      minimum_revenue_target,

      note,
      is_active,

      id,
    ],
  );

  return result.rows[0];
};

// =========================
// ADD TEMPLATE ALLOWANCES
// =========================

export const addTemplateAllowances = async (
  templateId: number,
  allowanceIds: number[],
client?: PoolClient,) => {
  if (!allowanceIds?.length) return;

    const executor = getExecutor(client);


  const values: any[] = [];

  const placeholders = allowanceIds.map(
    (allowanceId, index) => {
      const base = index * 2;

      values.push(templateId);
      values.push(allowanceId);

      return `($${base + 1}, $${base + 2})`;
    },
  );

  await executor.query(
    `
    INSERT INTO template_allowances
    (
      template_id,
      allowance_id
    )
    VALUES
    ${placeholders.join(",")}
  `,
    values,
  );
};

// =========================
// ADD TEMPLATE DEDUCTIONS
// =========================

export const addTemplateDeductions = async (
  templateId: number,
  deductionIds: number[],
  client?: PoolClient,
) => {
  if (!deductionIds?.length) return;

    const executor = getExecutor(client);


  const values: any[] = [];

  const placeholders = deductionIds.map(
    (deductionId, index) => {
      const base = index * 2;

      values.push(templateId);
      values.push(deductionId);

      return `($${base + 1}, $${base + 2})`;
    },
  );

  await executor.query(
    `
    INSERT INTO template_deductions
    (
      template_id,
      deduction_id
    )
    VALUES
    ${placeholders.join(",")}
  `,
    values,
  );
};

// =========================
// REMOVE TEMPLATE ALLOWANCES
// =========================

export const removeTemplateAllowances = async (
  templateId: number,
  client?: PoolClient,
) => {
    const executor = getExecutor(client);

  await executor.query(
    `
    DELETE FROM template_allowances
    WHERE template_id = $1
  `,
    [templateId],
  );
};

// =========================
// REMOVE TEMPLATE DEDUCTIONS
// =========================

export const removeTemplateDeductions = async (
  templateId: number,
  client?: PoolClient,
) => {
    const executor = getExecutor(client);

  await executor.query(
    `
    DELETE FROM template_deductions
    WHERE template_id = $1
  `,
    [templateId],
  );
};