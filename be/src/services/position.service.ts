import { db } from "../config/db.js";

export type PositionInput = {
  name: string;
  description?: string;
};

// 🔹 GET ALL
export const getAllPositions = async () => {
  const result = await db.query(`
    SELECT *
    FROM positions
    ORDER BY id ASC
  `);

  return result.rows;
};

// 🔹 GET BY ID
export const getPositionById = async (id: number) => {
  const result = await db.query(
    `SELECT * FROM positions WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

// 🔹 FIND BY NAME (check trùng)
export const findPositionByName = async (name: string) => {
  const result = await db.query(
    `SELECT * FROM positions WHERE name = $1`,
    [name]
  );

  return result.rows[0];
};

// 🔹 CREATE
export const createPosition = async (data: PositionInput) => {
  const { name, description } = data;

  const result = await db.query(
    `INSERT INTO positions (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [name, description || null]
  );

  return result.rows[0];
};

// 🔹 UPDATE
export const updatePosition = async (
  id: number,
  data: Partial<PositionInput>
) => {
  const result = await db.query(
    `UPDATE positions
     SET name = COALESCE($1, name),
         description = COALESCE($2, description)
     WHERE id = $3
     RETURNING *`,
    [
      data.name ?? null,
      data.description ?? null,
      id,
    ]
  );

  return result.rows[0];
};

// 🔹 DELETE
export const deletePosition = async (id: number) => {
  await db.query(`DELETE FROM positions WHERE id = $1`, [id]);
};
