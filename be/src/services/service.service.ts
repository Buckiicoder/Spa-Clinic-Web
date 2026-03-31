import { db } from "../config/db.js";

export const getAllServices = async () => {
  const result = await db.query(
    "SELECT * FROM services WHERE is_active = true ORDER BY id ASC",
  );
  return result.rows;
};
