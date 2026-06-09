import { db } from "../../config/db.js";

export type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "MOMO"
  | "VNPAY"
  | "ZALOPAY"
  | "CARD";

export interface CreatePaymentInput {
  customer_id: number;

  profile_id: number;

  discount_id?: number;

  payment_methods: {
    payment_method: PaymentMethod;
    amount: number;
    transaction_code?: string;
  }[];

  note?: string;
}

export const getCustomerUnpaidProfiles = async (customerId: number) => {
  const result = await db.query(
    `
    SELECT
      csp.id AS profile_id,

      csp.booking_id,

      csp.customer_id,

      csp.service_id,

      csp.package_id,

      csp.total_sessions,

      csp.used_sessions,

      csp.status,

      csp.started_at,

      csp.completed_at,

      csp.created_at,

      s.name AS service_name,

      sp.name AS package_name,

      sp.price AS package_price,

      p.id AS payment_id,

      p.payment_code,

      p.final_amount,

      p.paid_amount,

      p.remaining_amount,

      p.status AS payment_status,

      -- CUSTOMER
      u.name AS full_name,

      u.avatar,

      u.phone,

      u.email,

      c.id AS customer_record_id,

      c.rank,

      c.total_spending,

      c.total_visits,

      c.first_visit_at

    FROM customer_service_profiles csp

    INNER JOIN services s
      ON s.id = csp.service_id

    INNER JOIN service_packages sp
      ON sp.id = csp.package_id

    INNER JOIN users u
      ON u.id = csp.customer_id

    LEFT JOIN customers c
      ON c.user_id = u.id

    LEFT JOIN LATERAL (
      SELECT p.*
      FROM payment_items pi
      INNER JOIN payments p
        ON p.id = pi.payment_id
      WHERE pi.profile_id = csp.id
      ORDER BY
        CASE
          WHEN p.remaining_amount > 0 THEN 0
          ELSE 1
        END,
        p.created_at DESC
      LIMIT 1
    ) p ON true

    WHERE csp.customer_id = $1

    AND (
      p.id IS NULL
      OR p.remaining_amount > 0
    )

    ORDER BY csp.created_at DESC
    `,
    [customerId],
  );

  const rows = result.rows;

  return {
    customer:
      rows.length > 0
        ? {
            customer_id: rows[0].customer_id,
            full_name: rows[0].full_name,
            avatar: rows[0].avatar,
            phone: rows[0].phone,
            email: rows[0].email,
            rank: rows[0].rank,
            total_spending: rows[0].total_spending,
            total_visits: rows[0].total_visits,
            first_visit_at: rows[0].first_visit_at,
          }
        : null,

    profiles: rows,
  };
};

export const getPaymentProfileDetail = async (profileId: number) => {
  const result = await db.query(
    `
    SELECT
      csp.id AS profile_id,

      csp.customer_id,

      csp.service_id,

      csp.package_id,

      csp.total_sessions,

      csp.used_sessions,

      csp.status,

      sp.name AS package_name,

      sp.price AS package_price,

      s.name AS service_name,

      cu.id AS customer_record_id,

      cu.rank,

      cu.total_spending,

      cu.total_visits,

      cu.first_visit_at

    FROM customer_service_profiles csp

    INNER JOIN service_packages sp
      ON sp.id = csp.package_id

    INNER JOIN services s
      ON s.id = csp.service_id

    LEFT JOIN customers cu
      ON cu.user_id = csp.customer_id

    WHERE csp.id = $1
    `,
    [profileId],
  );

  return result.rows[0];
};

export const getPendingPaymentByProfile = async (profileId: number) => {
  const result = await db.query(
    `
    SELECT p.*
    FROM payments p

    INNER JOIN payment_items pi
      ON pi.payment_id = p.id

    WHERE
      pi.profile_id = $1
      AND p.remaining_amount > 0
      AND p.status IN ('pending', 'partial_paid')

    ORDER BY p.created_at DESC
    LIMIT 1
    `,
    [profileId],
  );

  return result.rows[0];
};

export const updatePaymentAmounts = async (
  client: any,
  paymentId: number,
  paidAmount: number,
) => {
  const paymentResult = await client.query(
    `
    SELECT *
    FROM payments
    WHERE id = $1
    `,
    [paymentId],
  );

  const payment = paymentResult.rows[0];

  if (!payment) {
    throw new Error("Không tìm thấy thanh toán");
  }

  const newPaidAmount = Number(payment.paid_amount) + paidAmount;

  const newRemainingAmount = Number(payment.final_amount) - newPaidAmount;

  if (newRemainingAmount < 0) {
    throw new Error("Số tiền thanh toán vượt quá công nợ");
  }

  const updated = await client.query(
    `
    UPDATE payments
    SET
      paid_amount = $1,
      remaining_amount = $2,
      status = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
    [
      newPaidAmount,
      newRemainingAmount,
      newRemainingAmount <= 0 ? "paid" : "partial_paid",
      paymentId,
    ],
  );

  return updated.rows[0];
};

export const getAvailableDiscounts = async (profileId: number) => {
  const profile = await getPaymentProfileDetail(profileId);

  if (!profile) {
    throw new Error("Không tìm thấy hồ sơ liệu trình");
  }

  const pendingPayment = await getPendingPaymentByProfile(profileId);

  // Nếu đã có payment dùng discount trước đó
  // thì không cho dùng tiếp
  if (pendingPayment?.discount_id) {
    return {
      profile,
      discounts: [],
    };
  }

  const result = await db.query(
    `
    SELECT DISTINCT d.*

    FROM discounts d

    WHERE
      d.is_active = true

      AND NOW() >= d.start_date
      AND NOW() <= d.end_date

      -- usage limit
      AND (
        d.usage_limit IS NULL
        OR d.used_count < d.usage_limit
      )

      -- rank
      AND (
        d.minimum_customer_rank IS NULL
        OR TRIM(d.minimum_customer_rank) = TRIM($1)
      )

      -- first visit
      AND (
        d.first_visit_only = false
        OR $2 <= 1
      )

      -- service condition
      AND (
        NOT EXISTS (
          SELECT 1
          FROM discount_services ds
          WHERE ds.discount_id = d.id
        )

        OR EXISTS (
          SELECT 1
          FROM discount_services ds
          WHERE
            ds.discount_id = d.id
            AND ds.service_id = $3
        )
      )

      -- package condition
      AND (
        NOT EXISTS (
          SELECT 1
          FROM discount_service_packages dsp
          WHERE dsp.discount_id = d.id
        )

        OR EXISTS (
          SELECT 1
          FROM discount_service_packages dsp
          WHERE
            dsp.discount_id = d.id
            AND dsp.service_package_id = $4
        )
      )

      AND (
        d.min_order_amount IS NULL
        OR $5 >= d.min_order_amount
      )
    `,
    [
      profile.rank,
      profile.total_visits,
      profile.service_id,
      profile.package_id,
      Number(profile.package_price),
    ],
  );

  const discounts = [];

  for (const discount of result.rows) {
    const usageResult = await db.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM discount_usages
      WHERE
        discount_id = $1
        AND customer_id = $2
      `,
      [discount.id, profile.customer_id],
    );

    const usedCount = usageResult.rows[0].total;

    const limitPerCustomer = Number(discount.usage_limit_per_customer || 1);

    if (usedCount < limitPerCustomer) {
      discounts.push(discount);
    }
  }

  return {
    profile,
    discounts,
  };
};

export const calculateDiscountAmount = ({
  subtotal,
  discount,
}: {
  subtotal: number;
  discount: any;
}) => {
  let discountAmount = 0;

  if (discount.discount_type === "PERCENT") {
    discountAmount = subtotal * (Number(discount.discount_value) / 100);

    if (
      discount.max_discount_amount &&
      discountAmount > discount.max_discount_amount
    ) {
      discountAmount = Number(discount.max_discount_amount);
    }
  } else {
    discountAmount = Number(discount.discount_value);
  }

  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  return discountAmount;
};

export const calculatePaymentDiscount = async (
  profileId: number,
  discountId?: number,
) => {
  const profile = await getPaymentProfileDetail(profileId);

  if (!profile) {
    throw new Error("Không tìm thấy hồ sơ liệu trình");
  }

  const pendingPayment = await getPendingPaymentByProfile(profileId);

  if (pendingPayment?.discount_id) {
    return {
      subtotal_amount: Number(pendingPayment.subtotal_amount),
      discount_amount: Number(pendingPayment.discount_amount),
      final_amount: Number(pendingPayment.remaining_amount),
      discount: {
        id: pendingPayment.discount_id,
      },
    };
  }

  const subtotal = pendingPayment
    ? Number(pendingPayment.remaining_amount)
    : Number(profile.package_price);

  if (!discountId) {
    return {
      subtotal_amount: subtotal,

      discount_amount: 0,

      final_amount: subtotal,

      discount: null,
    };
  }

  const availableDiscounts = await getAvailableDiscounts(profileId);

  const discount = availableDiscounts.discounts.find(
    (d: any) => d.id === discountId,
  );

  if (!discount) {
    throw new Error("Mã giảm giá không hợp lệ");
  }

  const discountAmount = calculateDiscountAmount({
    subtotal,
    discount,
  });

  return {
    subtotal_amount: subtotal,

    discount_amount: discountAmount,

    final_amount: subtotal - discountAmount,

    discount,
  };
};

export const createPayment = async (data: CreatePaymentInput) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const profile = await getPaymentProfileDetail(data.profile_id);

    const existingPayment = await getPendingPaymentByProfile(data.profile_id);

    if (!profile) {
      throw new Error("Không tìm thấy hồ sơ");
    }

    if (!data.payment_methods || data.payment_methods.length === 0) {
      throw new Error("Vui lòng chọn phương thức thanh toán");
    }

    for (const method of data.payment_methods) {
      if (Number(method.amount) <= 0) {
        throw new Error("Số tiền thanh toán phải lớn hơn 0");
      }
    }

    let subtotal = Number(profile.package_price);

    let discountAmount = 0;

    let finalAmount = subtotal;

    let discount: any = null;

    if (existingPayment) {
      subtotal = Number(existingPayment.final_amount);

      discountAmount = Number(existingPayment.discount_amount);

      finalAmount = Number(existingPayment.remaining_amount);

      if (existingPayment.discount_id) {
        const discountResult = await client.query(
          `
      SELECT *
      FROM discounts
      WHERE id = $1
      `,
          [existingPayment.discount_id],
        );

        discount = discountResult.rows[0];
      }
    }

    // APPLY DISCOUNT
    if (data.discount_id) {
      const availableDiscounts = await getAvailableDiscounts(data.profile_id);

      discount = availableDiscounts.discounts.find(
        (d: any) => d.id === data.discount_id,
      );

      if (!discount) {
        throw new Error("Mã giảm giá không hợp lệ");
      }

      await client.query(
        `
        SELECT *
        FROM discounts
        WHERE id = $1
        FOR UPDATE
        `,
        [discount.id],
      );

      discountAmount = calculateDiscountAmount({
        subtotal,
        discount,
      });
    }

    if (!existingPayment && data.discount_id) {
      finalAmount = subtotal - discountAmount;
    }

    const payAmount = data.payment_methods.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    if (payAmount <= 0) {
      throw new Error("Số tiền thanh toán không hợp lệ");
    }

    if (payAmount > finalAmount) {
      throw new Error("Số tiền thanh toán vượt quá công nợ");
    }

    let payment: any;

    if (!existingPayment) {
      const remainingAmount = finalAmount - payAmount;

      const paymentResult = await client.query(
        `
    INSERT INTO payments (
      payment_code,
      customer_id,
      subtotal_amount,
      discount_amount,
      final_amount,
      paid_amount,
      remaining_amount,
      discount_id,
      note,
      status
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10
    )
    RETURNING *
    `,
        [
          `PAY${Date.now()}`,
          profile.customer_id,
          subtotal,
          discountAmount,
          finalAmount,
          payAmount,
          remainingAmount,
          discount?.id || null,
          data.note || null,
          remainingAmount <= 0 ? "paid" : "partial_paid",
        ],
      );

      payment = paymentResult.rows[0];

      // PAYMENT ITEM
      await client.query(
        `
    INSERT INTO payment_items (
      payment_id,
      profile_id,
      service_id,
      package_id,
      item_type,
      item_name,
      quantity,
      unit_price,
      subtotal_amount,
      discount_amount,
      final_amount
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,$11
    )
    `,
        [
          payment.id,
          profile.profile_id,
          profile.service_id,
          profile.package_id,
          "service_package",
          profile.package_name,
          1,
          subtotal,
          subtotal,
          discountAmount,
          finalAmount,
        ],
      );
    } else {
      payment = await updatePaymentAmounts(
        client,
        existingPayment.id,
        payAmount,
      );
    }

    // PAYMENT TRANSACTIONS
    for (const method of data.payment_methods) {
      await client.query(
        `
        INSERT INTO payment_transactions (
          payment_id,
  transaction_code,
  payment_method,
  gateway_provider,
  amount,
  status,
  note,
  raw_response
        )
        VALUES (
         $1,$2,$3,$4,
  $5,$6,$7,$8
        )
        `,
        [
          payment.id,
          method.transaction_code || null,
          method.payment_method.toLowerCase(),
          method.payment_method.toLowerCase(),
          method.amount,
          "success",
          data.note || null,
          null,
        ],
      );
    }

    // DISCOUNT USAGE
    if (discount && !existingPayment) {
      await client.query(
        `
        INSERT INTO discount_usages (
          discount_id,
          payment_id,
          customer_id,
          discount_code,
          discount_amount
        )
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          discount.id,
          payment.id,
          profile.customer_id,
          discount.code,
          discountAmount,
        ],
      );

      await client.query(
        `
        UPDATE discounts
        SET used_count = used_count + 1
        WHERE id = $1
        `,
        [discount.id],
      );
    }

    await client.query("COMMIT");

    return payment;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getPaymentSummaryByProfile = async (profileId: number) => {
  const result = await db.query(
    `
    SELECT
      p.*,
      json_agg(
        json_build_object(
          'id', pt.id,
          'payment_method', pt.payment_method,
          'amount', pt.amount,
          'paid_at', pt.paid_at,
          'transaction_code', pt.transaction_code
        )
      ) AS transactions

    FROM payments p

    INNER JOIN payment_items pi
      ON pi.payment_id = p.id

    LEFT JOIN payment_transactions pt
      ON pt.payment_id = p.id

    WHERE pi.profile_id = $1

    GROUP BY p.id

    ORDER BY p.created_at DESC
    LIMIT 1
    `,
    [profileId],
  );

  return result.rows[0];
};

export const getAllPayments = async ({
  day,
  month,
  year,
  status,
}: {
  day?: number;
  month: number;
  year: number;
  status?: string;
}) => {
  const conditions: string[] = [];
const values: any[] = [];

if (day) {
  values.push(day);

  conditions.push(
    `EXTRACT(DAY FROM p.created_at) = $${values.length}`,
  );
}

values.push(month);

conditions.push(
  `EXTRACT(MONTH FROM p.created_at) = $${values.length}`,
);

values.push(year);

conditions.push(
  `EXTRACT(YEAR FROM p.created_at) = $${values.length}`,
);

if (status) {
  values.push(status);

  conditions.push(
    `p.status = $${values.length}`,
  );
}

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `
    SELECT
  p.id,
  p.payment_code,

  p.customer_id,

  p.subtotal_amount,
  p.discount_amount,
  p.final_amount,
  p.paid_amount,
  p.remaining_amount,

  p.status,

  p.created_at,
  p.updated_at,

  u.name AS customer_name,
  u.phone,
  u.email,

  (
    SELECT COUNT(*)
    FROM payment_items pi2
    WHERE pi2.payment_id = p.id
  )::INTEGER AS total_items,

  (
    SELECT COUNT(*)
    FROM payment_transactions pt
    WHERE pt.payment_id = p.id
  )::INTEGER AS total_transactions,

  STRING_AGG(
    DISTINCT s.name,
    ', '
  ) AS service_names,

  STRING_AGG(
    DISTINCT sp.name,
    ', '
  ) AS package_names

FROM payments p

INNER JOIN users u
  ON u.id = p.customer_id

LEFT JOIN payment_items pi
  ON pi.payment_id = p.id

LEFT JOIN services s
  ON s.id = pi.service_id

LEFT JOIN service_packages sp
  ON sp.id = pi.package_id

${whereClause}

GROUP BY
  p.id,
  u.id

ORDER BY p.created_at DESC
    `,
    values,
  );

  return result.rows;
};

export const getPaymentBillDetail = async (paymentId: number) => {
  const result = await db.query(
    `
    SELECT
      p.id,
      p.payment_code,

      p.customer_id,

      p.subtotal_amount,
      p.discount_amount,
      p.final_amount,

      p.paid_amount,
      p.remaining_amount,

      p.status,
      p.note,

      p.created_at,
      p.updated_at,

      -- CUSTOMER
      u.name AS customer_name,
      u.phone,
      u.email,
      u.avatar,

      c.rank,
      c.loyalty_points,
      c.total_spending,
      c.total_visits,
      c.first_visit_at,

      -- DISCOUNT
      d.id AS discount_id,
      d.code AS discount_code,
      d.name AS discount_name,
      d.discount_type,
      d.discount_value,

      -- PAYMENT ITEMS
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'payment_item_id', pi.id,

            'profile_id', csp.id,

            'service_id', s.id,
            'service_name', s.name,

            'package_id', sp.id,
            'package_name', sp.name,

            'item_type', pi.item_type,
            'item_name', pi.item_name,

            'quantity', pi.quantity,

            'unit_price', pi.unit_price,
            'subtotal_amount', pi.subtotal_amount,
            'discount_amount', pi.discount_amount,
            'final_amount', pi.final_amount,

            -- PROFILE
            'total_sessions', csp.total_sessions,
            'used_sessions', csp.used_sessions,
            'profile_status', csp.status,

            'started_at', csp.started_at,
            'completed_at', csp.completed_at,
            'profile_created_at', csp.created_at
          )
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) AS items,

      -- TRANSACTIONS
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'transaction_id', pt.id,

            'payment_method', pt.payment_method,

            'gateway_provider', pt.gateway_provider,

            'transaction_code', pt.transaction_code,

            'amount', pt.amount,

            'status', pt.status,

            'paid_at', pt.paid_at,

            'note', pt.note
          )
        ) FILTER (WHERE pt.id IS NOT NULL),
        '[]'
      ) AS transactions

    FROM payments p

    INNER JOIN users u
      ON u.id = p.customer_id

    LEFT JOIN customers c
      ON c.user_id = u.id

    LEFT JOIN discounts d
      ON d.id = p.discount_id

    LEFT JOIN payment_items pi
      ON pi.payment_id = p.id

    LEFT JOIN customer_service_profiles csp
      ON csp.id = pi.profile_id

    LEFT JOIN services s
      ON s.id = pi.service_id

    LEFT JOIN service_packages sp
      ON sp.id = pi.package_id

    LEFT JOIN payment_transactions pt
      ON pt.payment_id = p.id

    WHERE p.id = $1

    GROUP BY
      p.id,

      u.id,

      c.id,

      d.id
    `,
    [paymentId],
  );

  return result.rows[0];
};

