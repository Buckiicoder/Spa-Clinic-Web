import { db } from "../config/db.js";

export type BranchInput = {
  name: string;
  address: string;
  latitude: number;
 longitude: number;
  allowed_radius?: number;
  created_by?: number;
};

// 🔹 GET ALL
export const getAllBranches = async () => {
  const result = await db.query(`
    SELECT
      b.*,
      u.name AS created_by_name
    FROM branches b
    LEFT JOIN users u
      ON u.id = b.created_by
    ORDER BY b.id ASC
  `);

  return result.rows;
};

// 🔹 GET BY ID
export const getBranchById = async (id: number) => {
  const result = await db.query(
    `
    SELECT
      b.*,
      u.name AS created_by_name
    FROM branches b
    LEFT JOIN users u
      ON u.id = b.created_by
    WHERE b.id = $1
    `,
    [id],
  );

  return result.rows[0];
};

// 🔹 FIND BY NAME
export const findBranchByName = async (name: string) => {
  const result = await db.query(
    `
    SELECT *
    FROM branches
    WHERE LOWER(name) = LOWER($1)
    `,
    [name],
  );

  return result.rows[0];
};

// 🔹 CREATE
export const createBranch = async (data: BranchInput) => {
  const {
    name,
    address,
    latitude,
    longitude,
    allowed_radius,
    created_by,
  } = data;

  const result = await db.query(
    `
    INSERT INTO branches (
      name,
      address,
      latitude,
      longitude,
      allowed_radius,
      created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      name,
      address,
      latitude,
      longitude,
      allowed_radius ?? 100,
      created_by ?? null,
    ],
  );

  return result.rows[0];
};

// 🔹 UPDATE
export const updateBranch = async (
  id: number,
  data: Partial<BranchInput>,
) => {
  const result = await db.query(
    `
    UPDATE branches
    SET
      name = COALESCE($1, name),
      address = COALESCE($2, address),
      latitude = COALESCE($3, latitude),
      longitude = COALESCE($4, longitude),
      allowed_radius = COALESCE($5, allowed_radius),
      updated_at = NOW()
    WHERE id = $6
    RETURNING *
    `,
    [
      data.name ?? null,
      data.address ?? null,
      data.latitude ?? null,
      data.longitude ?? null,
      data.allowed_radius ?? null,
      id,
    ],
  );

  return result.rows[0];
};

// 🔹 DELETE
export const deleteBranch = async (id: number) => {
  await db.query(
    `
    DELETE FROM branches
    WHERE id = $1
    `,
    [id],
  );
};
