import { db } from "../../config/db.js";

// =========================
// GET ALL
// =========================

export const getSalaryDeductions = async (keyword: string) => {
  const result = await db.query(
    `
  SELECT *
  FROM salary_deductions
  WHERE
    name ILIKE $1
  ORDER BY
    similarity(name, $2) DESC,
    name ASC
  LIMIT 5
`,
    [`%${keyword}%`, keyword],
  );

  return result.rows;
};

// =========================
// GET DETAIL
// =========================

export const getSalaryDeductionDetail = async (id: number) => {
  const result = await db.query(
    `
    SELECT *
    FROM salary_deductions
    WHERE id = $1
  `,
    [id],
  );

  return result.rows[0];
};

// =========================
// CREATE
// =========================

export const createSalaryDeduction = async (data: any) => {
  const {
    name,
    amount_type,
    amount_value,
    unit_type,
    condition_text,
    note,
  } = data;

  const result = await db.query(
    `
    INSERT INTO salary_deductions
(
  name,
  amount_type,
  amount_value,
  unit_type,
  condition_text,
  note
)
VALUES
($1,$2,$3,$4,$5,$6)
    RETURNING *
  `,
    [name, amount_type, amount_value, unit_type, condition_text, note],
  );

  return result.rows[0];
};
