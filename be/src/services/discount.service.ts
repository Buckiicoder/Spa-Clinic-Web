import { db } from "../config/db.js";

export type DiscountInput = {
  code: string;
  name: string;
  description?: string | null;

  discount_type: "PERCENT" | "FIXED";
  discount_value: number;

  max_discount_amount?: number | null;

  min_order_amount?: number;

  usage_limit?: number | null;

  usage_limit_per_customer?: number;

  minimum_customer_rank?:
    | "BRONZE"
    | "SILVER"
    | "GOLD"
    | "DIAMOND"
    | "VIP"
    | "SUPER_VIP"
    | null;

  first_visit_only?: boolean;

  start_date: string;
  end_date: string;

  is_active?: boolean;

  service_ids?: number[];

  service_package_ids?: number[];
};

// GET ALL
export const getAllDiscounts = async () => {
  const result = await db.query(`
    SELECT
      d.*,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', s.id,
            'name', s.name
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS services,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sp.id,
            'name', sp.name,
            'price', sp.price,
            'service_id', sp.service_id
          )
        ) FILTER (WHERE sp.id IS NOT NULL),
        '[]'
      ) AS service_packages

    FROM discounts d

    LEFT JOIN discount_services ds
      ON ds.discount_id = d.id

    LEFT JOIN services s
      ON s.id = ds.service_id

    LEFT JOIN discount_service_packages dsp
      ON dsp.discount_id = d.id

    LEFT JOIN service_packages sp
      ON sp.id = dsp.service_package_id

    GROUP BY d.id

    ORDER BY d.id DESC
  `);

  return result.rows;
};

// GET DETAIL
export const getDiscountById = async (id: number) => {
  const result = await db.query(
    `
    SELECT
      d.*,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', s.id,
            'name', s.name
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS services,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sp.id,
            'name', sp.name,
            'price', sp.price,
            'service_id', sp.service_id
          )
        ) FILTER (WHERE sp.id IS NOT NULL),
        '[]'
      ) AS service_packages

    FROM discounts d

    LEFT JOIN discount_services ds
      ON ds.discount_id = d.id

    LEFT JOIN services s
      ON s.id = ds.service_id

    LEFT JOIN discount_service_packages dsp
      ON dsp.discount_id = d.id

    LEFT JOIN service_packages sp
      ON sp.id = dsp.service_package_id

    WHERE d.id = $1

    GROUP BY d.id
    `,
    [id]
  );

  return result.rows[0];
};

// FIND BY CODE
export const findDiscountByCode = async (code: string) => {
  const result = await db.query(
    `
    SELECT *
    FROM discounts
    WHERE code = $1
    `,
    [code]
  );

  return result.rows[0];
};

// CREATE
export const createDiscount = async (
  data: DiscountInput
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const discountResult = await client.query(
      `
      INSERT INTO discounts (
        code,
        name,
        description,
        discount_type,
        discount_value,
        max_discount_amount,
        min_order_amount,
        usage_limit,
        usage_limit_per_customer,
        minimum_customer_rank,
        first_visit_only,
        start_date,
        end_date,
        is_active
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14
      )
      RETURNING *
      `,
      [
        data.code,
        data.name,
        data.description ?? null,
        data.discount_type,
        data.discount_value,
        data.max_discount_amount ?? null,
        data.min_order_amount ?? 0,
        data.usage_limit ?? null,
        data.usage_limit_per_customer ?? 1,
        data.minimum_customer_rank ?? null,
        data.first_visit_only ?? false,
        data.start_date,
        data.end_date,
        data.is_active ?? true,
      ]
    );

    const discount = discountResult.rows[0];

    // INSERT SERVICES
    if (
      data.service_ids &&
      data.service_ids.length > 0
    ) {
      for (const serviceId of data.service_ids) {
        await client.query(
          `
          INSERT INTO discount_services (
            discount_id,
            service_id
          )
          VALUES ($1, $2)
          `,
          [discount.id, serviceId]
        );
      }
    }

    // INSERT SERVICE PACKAGES
    if (
      data.service_package_ids &&
      data.service_package_ids.length > 0
    ) {
      for (const packageId of data.service_package_ids) {
        await client.query(
          `
          INSERT INTO discount_service_packages (
            discount_id,
            service_package_id
          )
          VALUES ($1, $2)
          `,
          [discount.id, packageId]
        );
      }
    }

    await client.query("COMMIT");

    return await getDiscountById(discount.id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// UPDATE
export const updateDiscount = async (
  id: number,
  data: Partial<DiscountInput>
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE discounts
      SET
        code = COALESCE($1, code),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        discount_type = COALESCE($4, discount_type),
        discount_value = COALESCE($5, discount_value),
        max_discount_amount = COALESCE($6, max_discount_amount),
        min_order_amount = COALESCE($7, min_order_amount),
        usage_limit = COALESCE($8, usage_limit),
        usage_limit_per_customer = COALESCE($9, usage_limit_per_customer),
        minimum_customer_rank = COALESCE($10, minimum_customer_rank),
        first_visit_only = COALESCE($11, first_visit_only),
        start_date = COALESCE($12, start_date),
        end_date = COALESCE($13, end_date),
        is_active = COALESCE($14, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
      `,
      [
        data.code,
        data.name,
        data.description,
        data.discount_type,
        data.discount_value,
        data.max_discount_amount,
        data.min_order_amount,
        data.usage_limit,
        data.usage_limit_per_customer,
        data.minimum_customer_rank,
        data.first_visit_only,
        data.start_date,
        data.end_date,
        data.is_active,
        id,
      ]
    );

    // UPDATE SERVICES
    if (data.service_ids) {
      await client.query(
        `
        DELETE FROM discount_services
        WHERE discount_id = $1
        `,
        [id]
      );

      for (const serviceId of data.service_ids) {
        await client.query(
          `
          INSERT INTO discount_services (
            discount_id,
            service_id
          )
          VALUES ($1, $2)
          `,
          [id, serviceId]
        );
      }
    }

    // UPDATE PACKAGES
    if (data.service_package_ids) {
      await client.query(
        `
        DELETE FROM discount_service_packages
        WHERE discount_id = $1
        `,
        [id]
      );

      for (const packageId of data.service_package_ids) {
        await client.query(
          `
          INSERT INTO discount_service_packages (
            discount_id,
            service_package_id
          )
          VALUES ($1, $2)
          `,
          [id, packageId]
        );
      }
    }

    await client.query("COMMIT");

    return await getDiscountById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// DELETE
export const deleteDiscount = async (id: number) => {
  const result = await db.query(
    `
    UPDATE discounts
    SET
      is_active = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};