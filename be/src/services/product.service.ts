import { db } from "../config/db.js";

export type ProductInput = {
  barcode?: string | null;
  name: string;
  description?: string | null;
  category_id: number;
  unit?: string;
  sale_price: number;
  current_price: number;
  stock_quantity?: number;
  image_url?: string | null;
  is_active?: boolean;
};

export const generateProductCode = async (
  category_id: number
) => {
  // lấy prefix của phân loại
  const categoryResult = await db.query(
    `
    SELECT prefix
    FROM product_categories
    WHERE id = $1
    `,
    [category_id]
  );

  const category = categoryResult.rows[0];

  if (!category || !category.prefix) {
    throw new Error(
      "Phân loại chưa có mã prefix để tạo mã sản phẩm"
    );
  }

  const prefix = category.prefix.toUpperCase();

  // tìm mã cuối cùng cùng prefix
  const productResult = await db.query(
    `
    SELECT code
    FROM products
    WHERE code LIKE $1
    ORDER BY code DESC
    LIMIT 1
    `,
    [`${prefix}%`]
  );

  const lastProduct = productResult.rows[0];

  let nextNumber = 1;

  if (lastProduct?.code) {
    const numberPart = lastProduct.code.replace(prefix, "");
    nextNumber = Number(numberPart) + 1;
  }

  const code =
    prefix + nextNumber.toString().padStart(3, "0");

  return code;
};


// GET ALL
export const getAllProducts = async () => {
  const result = await db.query(`
    SELECT
      p.*,
      c.name AS category_name
    FROM products p
    LEFT JOIN product_categories c
      ON c.id = p.category_id
    ORDER BY p.id DESC
  `);

  return result.rows;
};

// GET BY ID
export const getProductById = async (id: number) => {
  const result = await db.query(
    `
    SELECT
      p.*,
      c.name AS category_name
    FROM products p
    LEFT JOIN product_categories c
      ON c.id = p.category_id
    WHERE p.id = $1
    `,
    [id],
  );

  return result.rows[0];
};

// 🔹 FIND BY CODE
export const findProductByCode = async (code: string) => {
  const result = await db.query(`SELECT * FROM products WHERE code = $1`, [
    code,
  ]);

  return result.rows[0];
};

// 🔹 FIND BY BARCODE
export const findProductByBarcode = async (barcode: string) => {
  const result = await db.query(`SELECT * FROM products WHERE barcode = $1`, [
    barcode,
  ]);

  return result.rows[0];
};

// CREATE
export const createProduct = async (data: ProductInput) => {
  const {
    barcode,
    name,
    description,
    category_id,
    unit,
    sale_price,
    current_price,
    stock_quantity,
    image_url,
    is_active,
  } = data;

  const code = await generateProductCode(data.category_id);

  const result = await db.query(
    `
    INSERT INTO products (
      code,
      barcode,
      name,
      description,
      category_id,
      unit,
      sale_price,
      current_price,
      stock_quantity,
      image_url,
      is_active
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
    `,
    [
      code,
      barcode ?? null,
      name,
      description ?? null,
      category_id ?? null,
      unit ?? "cái",
      sale_price,
      current_price,
      stock_quantity ?? 0,
      image_url ?? null,
      is_active ?? true,
    ],
  );

  return result.rows[0];
};

// UDPATE
export const updateProduct = async (
  id: number,
  data: Partial<ProductInput>
) => {
  const result = await db.query(
    `
   UPDATE products
    SET
      barcode = COALESCE($1, barcode),
      name = COALESCE($2, name),
      description = COALESCE($3, description),
      category_id = COALESCE($4, category_id),
      unit = COALESCE($5, unit),
      sale_price = COALESCE($6, sale_price),
      current_price = COALESCE($7, current_price),
      stock_quantity = COALESCE($8, stock_quantity),
      image_url = COALESCE($9, image_url),
      is_active = COALESCE($10, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *
    `,
    [
      data.barcode,
      data.name,
      data.description,
      data.category_id,
      data.unit,
      data.sale_price,
      data.current_price,
      data.stock_quantity,
      data.image_url,
      data.is_active,
      id,
    ]
  );

  return result.rows[0];
};

// 🔹 DELETE = soft delete
export const deleteProduct = async (id: number) => {
  const result = await db.query(
    `
    UPDATE products
    SET is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};