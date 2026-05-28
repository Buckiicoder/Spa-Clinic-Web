import { db } from "../../config/db.js";

// =========================
// GET ALL
// =========================

export const getSalaryAllowances = async (keyword: string) => {
  const result = await db.query(
    `
  SELECT *
  FROM salary_allowances
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

export const getSalaryAllowanceDetail = async (id: number) => {
  const result = await db.query(
    `
    SELECT *
    FROM salary_allowances
    WHERE id = $1
  `,
    [id],
  );

  return result.rows[0];
};

// =========================
// CREATE
// =========================

export const createSalaryAllowance = async (data: any) => {
  const { name, amount_type, amount_value, apply_type } = data;

  const result = await db.query(
    `
    INSERT INTO salary_allowances
    (
      name,
      amount_type,
      amount_value,
      apply_type
    )
    VALUES
    ($1,$2,$3,$4)
    RETURNING *
  `,
    [name, amount_type, amount_value, apply_type],
  );

  return result.rows[0];
};
