import { db } from "../config/db.js";

export type ShiftInput = {
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

// 🔹 GET ALL
export const getAllShifts = async () => {
  const result = await db.query(`
    SELECT *
    FROM shifts
    ORDER BY id ASC
  `);

  return result.rows;
};

// 🔹 GET BY ID
export const getShiftById = async (id: number) => {
  const result = await db.query(
    `SELECT * FROM shifts WHERE id = $1`,
    [id]
  );

  return result.rows[0]; // ❗ không throw nữa
};

// 🔹 FIND BY NAME (để controller check trùng)
export const findShiftByName = async (name: string) => {
  const result = await db.query(
    `SELECT * FROM shifts WHERE name = $1`,
    [name]
  );

  return result.rows[0];
};

// 🔹 CREATE
export const createShift = async (data: ShiftInput) => {
  const { name, start_time, end_time, is_active } = data;

  const result = await db.query(
    `INSERT INTO shifts (name, start_time, end_time, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, start_time, end_time, is_active]
  );

  return result.rows[0];
};

// 🔹 UPDATE
export const updateShift = async (
  id: number,
  data: Partial<ShiftInput>
) => {
  const { name, start_time, end_time, is_active } = data;

  const result = await db.query(
    `UPDATE shifts
     SET name = COALESCE($1, name),
         start_time = COALESCE($2, start_time),
         end_time = COALESCE($3, end_time),
         is_active = COALESCE($4, is_active)
     WHERE id = $5
     RETURNING *`,
    [name, start_time, end_time, is_active, id]
  );

  return result.rows[0];
};

// 🔹 DELETE
export const deleteShift = async (id: number) => {
  await db.query(`DELETE FROM shifts WHERE id = $1`, [id]);
};
