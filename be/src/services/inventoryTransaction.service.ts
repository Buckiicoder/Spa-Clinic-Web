import { db } from "../config/db.js";

export type InventoryTransactionItemInput = {
  product_id: number;
  quantity: number;
  unit_price: number;
  note?: string;
};

export type InventoryTransactionInput = {
  code: string;
  type: "IMPORT" | "EXPORT" | "ADJUST";
  note?: string;
  total_extra_cost?: number;
  transaction_date?: string;
  items: InventoryTransactionItemInput[];
};

// 🔹 GET ALL
export const getAllInventoryTransactions = async () => {
  const result = await db.query(`
    SELECT
      t.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'product_id', i.product_id,
            'product_name', p.name,
            'quantity', i.quantity,
            'unit_price', i.unit_price,
            'total_price', i.total_price,
            'note', i.note
          )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'
      ) AS items
    FROM inventory_transactions t
    LEFT JOIN inventory_transaction_items i
      ON i.transaction_id = t.id
    LEFT JOIN products p
      ON p.id = i.product_id
    GROUP BY t.id
    ORDER BY t.id DESC
  `);

  return result.rows;
};

// 🔹 GET BY ID
export const getInventoryTransactionById = async (id: number) => {
  const result = await db.query(
    `
    SELECT
      t.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'product_id', i.product_id,
            'product_name', p.name,
            'quantity', i.quantity,
            'unit_price', i.unit_price,
            'total_price', i.total_price,
            'note', i.note
          )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'
      ) AS items
    FROM inventory_transactions t
    LEFT JOIN inventory_transaction_items i
      ON i.transaction_id = t.id
    LEFT JOIN products p
      ON p.id = i.product_id
    WHERE t.id = $1
    GROUP BY t.id
    `,
    [id]
  );

  return result.rows[0];
};

// 🔹 FIND BY CODE
export const findInventoryTransactionByCode = async (code: string) => {
  const result = await db.query(
    `SELECT * FROM inventory_transactions WHERE code = $1`,
    [code]
  );

  return result.rows[0];
};

// 🔹 CREATE
export const createInventoryTransaction = async (
  data: InventoryTransactionInput
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const transactionResult = await client.query(
      `
      INSERT INTO inventory_transactions (
        code,
        type,
        note,
        total_extra_cost,
        transaction_date
      )
      VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_TIMESTAMP))
      RETURNING *
      `,
      [
        data.code,
        data.type,
        data.note || null,
        data.total_extra_cost || 0,
        data.transaction_date || null,
      ]
    );

    const transaction = transactionResult.rows[0];

    for (const item of data.items) {
      const total_price = item.quantity * item.unit_price;

      await client.query(
        `
        INSERT INTO inventory_transaction_items (
          transaction_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          note
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          transaction.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          total_price,
          item.note || null,
        ]
      );

      // IMPORT => tăng kho
      if (data.type === "IMPORT") {
        await client.query(
          `
          UPDATE products
          SET stock_quantity = stock_quantity + $1
          WHERE id = $2
          `,
          [item.quantity, item.product_id]
        );
      }

      // EXPORT => giảm kho
      if (data.type === "EXPORT") {
        await client.query(
          `
          UPDATE products
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
          `,
          [item.quantity, item.product_id]
        );
      }

      // ADJUST => set trực tiếp số lượng
      if (data.type === "ADJUST") {
        await client.query(
          `
          UPDATE products
          SET stock_quantity = $1
          WHERE id = $2
          `,
          [item.quantity, item.product_id]
        );
      }
    }

    await client.query("COMMIT");

    return transaction;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// 🔹 DELETE
export const deleteInventoryTransaction = async (id: number) => {
  await db.query(
    `DELETE FROM inventory_transactions WHERE id = $1`,
    [id]
  );
};

// 🔹 CHECK PRODUCT
export const getProductById = async (id: number) => {
  const result = await db.query(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};
