import { db } from "../config/db.js";

export type ProductCategoryInput = {
  name: string;
  description?: string;
  prefix?: string;
};

export const generateCategoryPrefix = async (name: string) => {
  // bỏ dấu, viết hoa
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

  const words = normalized.split(/\s+/);

  // ví dụ: "Cà phê sữa" -> CPS
  let prefix = words.map((w) => w[0]).join("");

  // nếu chỉ có 1 từ thì lấy 2-3 ký tự đầu
  if (words.length === 1) {
    prefix = normalized.slice(0, 3);
  }

  prefix = prefix.slice(0, 5);

  let finalPrefix = prefix;
  let counter = 1;

  // tránh trùng unique
  while (true) {
    const existed = await db.query(
      `SELECT id FROM product_categories WHERE prefix = $1`,
      [finalPrefix],
    );

    if (existed.rowCount === 0) break;

    finalPrefix = `${prefix}${counter}`;
    counter++;
  }

  return finalPrefix;
};

// 🔹 GET ALL
export const getAllProductCategories = async () => {
  const result = await db.query(`
    SELECT *
    FROM product_categories
    ORDER BY name ASC
  `);

  return result.rows;
};

// 🔹 GET BY ID
export const getProductCategoryById = async (id: number) => {
  const result = await db.query(
    `
    SELECT *
    FROM product_categories
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

// 🔹 FIND BY NAME
export const findProductCategoryByName = async (
  name: string
) => {
  const result = await db.query(
    `
    SELECT *
    FROM product_categories
    WHERE LOWER(name) = LOWER($1)
    `,
    [name]
  );

  return result.rows[0];
};

// 🔹 CREATE
export const createProductCategory = async (
  data: ProductCategoryInput
) => {
  const prefix = await generateCategoryPrefix(data.name);

  const result = await db.query(
    `
    INSERT INTO product_categories (
      name,
      description,
      prefix
    )
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [data.name, data.description || null,prefix]
  );

  return result.rows[0];
};

// 🔹 UPDATE
export const updateProductCategory = async (
  id: number,
  data: Partial<ProductCategoryInput>
) => {
  const existing = await getProductCategoryById(id);

  let prefix = existing.prefix;

   if (data.name && data.name !== existing.name) {
    prefix = await generateCategoryPrefix(data.name);
  }

  const result = await db.query(
    `
    UPDATE product_categories
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      prefix = COALESCE($3, prefix)
    WHERE id = $4
    RETURNING *
    `,
    [
      data.name,
      data.description,
      prefix,
      id,
    ]
  );

  return result.rows[0];
};

// 🔹 DELETE
export const deleteProductCategory = async (id: number) => {
  await db.query(
    `
    DELETE FROM product_categories
    WHERE id = $1
    `,
    [id]
  );
};
