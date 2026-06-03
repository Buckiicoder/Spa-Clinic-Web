import { db } from "../config/db.js";

export type InventoryTransactionItemInput = {
  product_id: number;
  quantity: number;
  unit_price: number;
  note?: string | null;
};

export type InventoryTransactionInput = {
  code: string;
  type: "IMPORT" | "EXPORT" | "ADJUST";
  note?: string | null;
  total_extra_cost?: number;
  transaction_date?: string;
  items: InventoryTransactionItemInput[];
};

// 🔹 GET ALL
export const getAllInventoryTransactions = async () => {
  const result = await db.query(`
    SELECT
       t.id,
  t.code,
  t.type,
  t.note,
  t.total_extra_cost,

  t.transaction_date::text AS transaction_date,

  t.created_at,
  t.status,

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
    GROUP BY
      t.id,
      t.code,
      t.type,
      t.note,
      t.total_extra_cost,
      t.transaction_date,
      t.created_at,
      t.status
    ORDER BY t.id DESC
  `);

  return result.rows;
};

// 🔹 GET BY ID
export const getInventoryTransactionById = async (id: number) => {
  const result = await db.query(
    `
    SELECT
       t.id,
  t.code,
  t.type,
  t.note,
  t.total_extra_cost,

  t.transaction_date::text AS transaction_date,

  t.created_at,
  t.status,
  
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
    GROUP BY
      t.id,
      t.code,
      t.type,
      t.note,
      t.total_extra_cost,
      t.transaction_date,
      t.created_at,
      t.status
    `,
    [id],
  );

  return result.rows[0];
};

// 🔹 FIND BY CODE
export const findInventoryTransactionByCode = async (code: string) => {
  const result = await db.query(
    `SELECT * FROM inventory_transactions WHERE code = $1`,
    [code],
  );

  return result.rows[0];
};

const applyInventoryEffect = async (
  client: any,
  type: string,
  productId: number,
  quantity: number,
) => {
  if (type === "IMPORT") {
    await client.query(
      `
      UPDATE products
      SET stock_quantity = stock_quantity + $1
      WHERE id = $2
      `,
      [quantity, productId],
    );
  }

  if (type === "EXPORT") {
    await client.query(
      `
      UPDATE products
      SET stock_quantity = stock_quantity - $1
      WHERE id = $2
      `,
      [quantity, productId],
    );
  }
};

// 🔹 CREATE
export const createInventoryTransaction = async (
  data: InventoryTransactionInput,
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const transactionResult = await client.query(
      `
      INSERT INTO inventory_transactions (
        code,
        type,
        status,
        note,
        total_extra_cost,
        transaction_date
      )
      VALUES ($1, $2, 'DRAFT', $3, $4, COALESCE($5, CURRENT_TIMESTAMP))
      RETURNING *
      `,
      [
        data.code,
        data.type,
        data.note || null,
        data.total_extra_cost || 0,
        data.transaction_date || null,
      ],
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
        ],
      );
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

export const updateInventoryTransaction = async (
  id: number,
  data: InventoryTransactionInput,
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const transactionResult = await client.query(
      `
      SELECT *
      FROM inventory_transactions
      WHERE id = $1
      FOR UPDATE
      `,
      [id],
    );

    const transaction = transactionResult.rows[0];

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "DRAFT") {
      throw new Error("Only DRAFT transaction can be updated");
    }

    await client.query(
      `
      UPDATE inventory_transactions
      SET
        note = $1,
        total_extra_cost = $2
      WHERE id = $3
      `,
      [data.note || null, data.total_extra_cost || 0, id],
    );

    await client.query(
      `
      DELETE FROM inventory_transaction_items
      WHERE transaction_id = $1
      `,
      [id],
    );

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
        VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [
          id,
          item.product_id,
          item.quantity,
          item.unit_price,
          total_price,
          item.note || null,
        ],
      );
    }

    await client.query("COMMIT");

    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const confirmInventoryTransaction = async (id: number) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const transactionResult = await client.query(
      `
      SELECT *
      FROM inventory_transactions
      WHERE id = $1
      FOR UPDATE
      `,
      [id],
    );

    const transaction = transactionResult.rows[0];

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "DRAFT") {
      throw new Error("Transaction already confirmed");
    }

    const itemsResult = await client.query(
      `
      SELECT *
      FROM inventory_transaction_items
      WHERE transaction_id = $1
      `,
      [id],
    );

    for (const item of itemsResult.rows) {
      await applyInventoryEffect(
        client,
        transaction.type,
        item.product_id,
        item.quantity,
      );
    }

    await client.query(
      `
      UPDATE inventory_transactions
      SET status = 'CONFIRMED'
      WHERE id = $1
      `,
      [id],
    );

    await client.query("COMMIT");

    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// 🔹 DELETE
export const cancelInventoryTransaction = async (id: number) => {
  const result = await db.query(
    `
    UPDATE inventory_transactions
    SET status = 'CANCELLED'
    WHERE id = $1
      AND status = 'DRAFT'
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};

// 🔹 CHECK PRODUCT
export const getProductById = async (id: number) => {
  const result = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);

  return result.rows[0];
};
