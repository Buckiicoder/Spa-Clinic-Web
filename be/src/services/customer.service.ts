import { db } from "../config/db.js";

// ✅ GET ALL CUSTOMERS
export const getCustomers = async ({
  search = "",
  page = 1,
  limit = 20,
  rank = null,
  status = null,
  is_active = null,
}: any = {}) => {
  const offset = (page - 1) * limit;

  const result = await db.query(
    `
  SELECT
    u.id,
    u.name,
    u.phone,
    u.email,
    u.avatar,
    u.gender,
    u.dob,
    u.city,

    u.is_active,
    u.created_at,

    c.total_spending,
    c.rank,
    c.status,
    c.source,
    c.total_visits,
    c.first_visit_at,
    c.last_visit_at,
    c.loyalty_points,

    COALESCE(profile_count.total_profiles, 0)
      AS total_profiles

  FROM customers c

  INNER JOIN users u
    ON u.id = c.user_id

  LEFT JOIN (
    SELECT
      customer_id,
      COUNT(*) AS total_profiles
    FROM customer_service_profiles
    GROUP BY customer_id
  ) profile_count
    ON profile_count.customer_id = u.id

  WHERE u.role = 'CUSTOMER'

    AND (
      $1 = ''
      OR u.name ILIKE '%' || $1 || '%'
      OR u.phone ILIKE '%' || $1 || '%'
      OR u.email ILIKE '%' || $1 || '%'
    )

    AND (
      $2::varchar IS NULL
      OR c.rank = $2
    )

    AND (
      $3::varchar IS NULL
      OR c.status = $3
    )

    AND (
      $4::boolean IS NULL
      OR u.is_active = $4
    )

  ORDER BY u.created_at DESC

  LIMIT $5 OFFSET $6
  `,
    [search, rank, status, is_active, limit, offset],
  );

  // total count
  const totalResult = await db.query(
    `
    SELECT COUNT(*)::int AS total

    FROM customers c

INNER JOIN users u
  ON u.id = c.user_id

      WHERE (
        $1 = ''
        OR u.name ILIKE '%' || $1 || '%'
        OR u.phone ILIKE '%' || $1 || '%'
        OR u.email ILIKE '%' || $1 || '%'
      )

      AND (
        $2::varchar IS NULL
        OR c.rank = $2
      )

      AND (
        $3::varchar IS NULL
        OR c.status = $3
      )

      AND (
        $4::boolean IS NULL
        OR u.is_active = $4
      )
    `,
    [search, rank, status, is_active],
  );
  // console.log("limit:", limit);
  // console.log("rows:", result.rows.length);
  // console.log("total:", totalResult.rows[0].total);
  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: totalResult.rows[0].total,
    },
  };
};

export const getCustomerDetail = async (user_id: number) => {
  // CUSTOMER INFO
  const customerResult = await db.query(
    `
    SELECT
      u.id,
      u.name,
      u.phone,
      u.email,
      u.avatar,
      u.gender,
      u.dob,
      u.city,
      u.ward,
      u.address_detail,
      u.is_active,
      u.is_verified,
      u.created_at,
      u.updated_at,

      c.total_spending,
      c.rank,
      c.status,
      c.source,
      c.note,
      c.total_visits,
      c.first_visit_at,
      c.last_visit_at,
      c.loyalty_points,
      c.referrer_id

    FROM users u

    LEFT JOIN customers c
      ON c.user_id = u.id

    WHERE
      u.id = $1
      AND u.role = 'CUSTOMER'
    `,
    [user_id],
  );

  const customer = customerResult.rows[0];

  if (!customer) {
    throw new Error("Khách hàng không tồn tại");
  }

  // CUSTOMER SERVICE PROFILES
  const profilesResult = await db.query(
    `
  SELECT
    csp.id,
    csp.customer_id,

    csp.total_sessions,
    csp.used_sessions,

    csp.status,
    csp.started_at,
    csp.completed_at,

    csp.note,
    csp.created_at,

    -- SERVICE
    s.id AS service_id,
    s.name AS service_name,
    s.area AS service_area,

    -- PACKAGE
    sp.id AS package_id,
    sp.name AS package_name,
    sp.price AS package_price,
    sp.total_sessions AS package_total_sessions,
    sp.unit,

    -- DOCTOR
    doctor.id AS doctor_id,
    doctor.name AS doctor_name,

    -- TECHNICIAN
    technician.id AS technician_id,
    technician.name AS technician_name,

    -- PAYMENTS
    COALESCE(
      JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
          'payment_id', p.id,
          'payment_code', p.payment_code,

          'subtotal_amount', p.subtotal_amount,
          'discount_amount', p.discount_amount,
          'final_amount', p.final_amount,

          'paid_amount', p.paid_amount,
          'remaining_amount', p.remaining_amount,

          'status', p.status,
          'note', p.note,
          'created_at', p.created_at,

          'payment_items',
          (
            SELECT COALESCE(
              JSON_AGG(
                JSONB_BUILD_OBJECT(
                  'payment_item_id', pi2.id,
                  'profile_id', pi2.profile_id,
                  'item_type', pi2.item_type,
                  'item_name', pi2.item_name,
                  'quantity', pi2.quantity,
                  'unit_price', pi2.unit_price,
                  'subtotal_amount', pi2.subtotal_amount,
                  'discount_amount', pi2.discount_amount,
                  'final_amount', pi2.final_amount
                )
              ),
              '[]'::json
            )
            FROM payment_items pi2
            WHERE pi2.payment_id = p.id
          ),

          'transactions',
          (
            SELECT COALESCE(
              JSON_AGG(
                JSONB_BUILD_OBJECT(
                  'transaction_id', pt.id,
                  'transaction_code', pt.transaction_code,
                  'payment_method', pt.payment_method,
                  'gateway_provider', pt.gateway_provider,
                  'amount', pt.amount,
                  'status', pt.status,
                  'paid_at', pt.paid_at,
                  'note', pt.note
                )
              ),
              '[]'::json
            )
            FROM payment_transactions pt
            WHERE pt.payment_id = p.id
          )
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::json
    ) AS payments

  FROM customer_service_profiles csp

  LEFT JOIN services s
    ON s.id = csp.service_id

  LEFT JOIN service_packages sp
    ON sp.id = csp.package_id

  LEFT JOIN users doctor
    ON doctor.id = csp.doctor_id

  LEFT JOIN users technician
    ON technician.id = csp.technician_id

  LEFT JOIN payment_items pi
    ON pi.profile_id = csp.id

  LEFT JOIN payments p
    ON p.id = pi.payment_id

  WHERE csp.customer_id = $1

  GROUP BY
    csp.id,
    s.id,
    sp.id,
    doctor.id,
    technician.id

  ORDER BY csp.created_at DESC
  `,
    [user_id],
  );

  const profiles = profilesResult.rows;

  //
  // =========================
  // PAYMENTS
  // GROUP TRANSACTIONS
  // =========================
  //

  const paymentsResult = await db.query(
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

      -- ITEMS
      JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
          'payment_item_id', pi.id,
          'profile_id', pi.profile_id,
          'service_id', pi.service_id,
          'package_id', pi.package_id,
          'item_type', pi.item_type,
          'item_name', pi.item_name,
          'quantity', pi.quantity,
          'unit_price', pi.unit_price,
          'subtotal_amount', pi.subtotal_amount,
          'discount_amount', pi.discount_amount,
          'final_amount', pi.final_amount
        )
      ) FILTER (
        WHERE pi.id IS NOT NULL
      ) AS payment_items,

      -- TRANSACTIONS
      JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
          'transaction_id', pt.id,
          'transaction_code', pt.transaction_code,
          'payment_method', pt.payment_method,
          'gateway_provider', pt.gateway_provider,
          'amount', pt.amount,
          'status', pt.status,
          'paid_at', pt.paid_at,
          'note', pt.note
        )
      ) FILTER (
        WHERE pt.id IS NOT NULL
      ) AS transactions

    FROM payments p

    LEFT JOIN payment_items pi
      ON pi.payment_id = p.id

    LEFT JOIN payment_transactions pt
      ON pt.payment_id = p.id

    WHERE p.customer_id = $1

    GROUP BY p.id

    ORDER BY p.created_at DESC
    `,
    [user_id],
  );

  return {
    customer,
    profiles,
    payments: paymentsResult.rows,
  };
};

export const createCustomer = async (data: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      phone,
      email,
      gender,
      dob,
      city,
      ward,
      address_detail,
      avatar,

      source,
      note,
      status,
    } = data;

    //
    // =========================
    // CHECK DUPLICATE
    // =========================
    //

    if (phone) {
      const phoneCheck = await client.query(
        `
        SELECT id
        FROM users
        WHERE phone = $1
        LIMIT 1
        `,
        [phone],
      );

      if ((phoneCheck.rowCount || 0) > 0) {
        throw new Error("Số điện thoại đã tồn tại");
      }
    }

    if (email) {
      const emailCheck = await client.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        LIMIT 1
        `,
        [email],
      );

      if ((emailCheck.rowCount || 0) > 0) {
        throw new Error("Email đã tồn tại");
      }
    }

    //
    // =========================
    // CREATE USER
    // =========================
    //

    const userResult = await client.query(
      `
      INSERT INTO users (
        name,
        phone,
        email,
        gender,
        dob,
        city,
        ward,
        address_detail,
        avatar,
        role
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,
        'CUSTOMER'
      )
      RETURNING *
      `,
      [name, phone, email, gender, dob, city, ward, address_detail, avatar],
    );

    const user = userResult.rows[0];

    //
    // =========================
    // CREATE CUSTOMER
    // =========================
    //

    const customerResult = await client.query(
      `
      INSERT INTO customers (
        user_id,
        source,
        note,
        status
      )
      VALUES (
        $1,$2,$3,$4
      )
      RETURNING *
      `,
      [user.id, source || null, note || null, status || "active"],
    );

    await client.query("COMMIT");

    return {
      user,
      customer: customerResult.rows[0],
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const updateCustomer = async (user_id: number, data: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      phone,
      email,
      gender,
      dob,
      city,
      ward,
      address_detail,
      avatar,
      is_active,

      source,
      note,
      status,
      referrer_id,
    } = data;

    //
    // =========================
    // DUPLICATE PHONE
    // =========================
    //

    if (phone) {
      const phoneCheck = await client.query(
        `
        SELECT id
        FROM users
        WHERE
          phone = $1
          AND id <> $2
        LIMIT 1
        `,
        [phone, user_id],
      );

      if ((phoneCheck.rowCount || 0) > 0) {
        throw new Error("Số điện thoại đã tồn tại");
      }
    }

    //
    // =========================
    // DUPLICATE EMAIL
    // =========================
    //

    if (email) {
      const emailCheck = await client.query(
        `
        SELECT id
        FROM users
        WHERE
          email = $1
          AND id <> $2
        LIMIT 1
        `,
        [email, user_id],
      );

      if ((emailCheck.rowCount || 0) > 0) {
        throw new Error("Email đã tồn tại");
      }
    }

    //
    // =========================
    // UPDATE USERS
    // =========================
    //

    await client.query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),

        gender = COALESCE($4, gender),
        dob = COALESCE($5, dob),

        city = COALESCE($6, city),
        ward = COALESCE($7, ward),
        address_detail = COALESCE($8, address_detail),

        avatar = COALESCE($9, avatar),

        is_active = COALESCE($10, is_active),

        updated_at = NOW()

      WHERE id = $11
      `,
      [
        name,
        phone,
        email,

        gender,
        dob,

        city,
        ward,
        address_detail,

        avatar,

        is_active,

        user_id,
      ],
    );

    //
    // =========================
    // ENSURE CUSTOMER
    // =========================
    //

    await client.query(
      `
      INSERT INTO customers (user_id)
      VALUES ($1)
      ON CONFLICT (user_id)
      DO NOTHING
      `,
      [user_id],
    );

    //
    // =========================
    // VALIDATE REFERRER
    // customers.id
    // =========================
    //

    if (referrer_id) {
      const refCheck = await client.query(
        `
        SELECT id
        FROM customers
        WHERE id = $1
        `,
        [referrer_id],
      );

      if (refCheck.rowCount === 0) {
        throw new Error("Người giới thiệu không tồn tại");
      }
    }

    //
    // =========================
    // UPDATE CUSTOMERS
    // =========================
    //

    const customerResult = await client.query(
      `
      UPDATE customers
      SET
        source = COALESCE($1, source),
        note = COALESCE($2, note),
        status = COALESCE($3, status),
        referrer_id = COALESCE($4, referrer_id)

      WHERE user_id = $5

      RETURNING *
      `,
      [source, note, status, referrer_id, user_id],
    );

    await client.query("COMMIT");

    return customerResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getCustomerServiceHistory = async (user_id: number) => {
  //
  // =========================
  // CUSTOMER BASIC INFO
  // =========================
  //

  const customerResult = await db.query(
    `
    SELECT
      u.id,
      u.name,
      u.phone,
      u.email,
      u.avatar,
      u.gender,
      u.dob,
      u.city,
      u.ward,
      u.address_detail,
      u.is_active,
      u.is_verified,
      u.created_at,
      u.updated_at,

      c.total_spending,
      c.rank,
      c.status,
      c.source,
      c.note,
      c.total_visits,
      c.first_visit_at,
      c.last_visit_at,
      c.loyalty_points,
      c.referrer_id

    FROM users u

    LEFT JOIN customers c
      ON c.user_id = u.id

    WHERE
      u.id = $1
      AND u.role = 'CUSTOMER'

    LIMIT 1
    `,
    [user_id],
  );

  const customer = customerResult.rows[0];

  if (!customer) {
    throw new Error("Khách hàng không tồn tại");
  }

  //
  // =========================
  // SERVICE PACKAGES
  // =========================
  //

  const profilesResult = await db.query(
    `
    SELECT
  csp.id,

  csp.total_sessions,
  csp.used_sessions,

  csp.status,
  csp.started_at,
  csp.completed_at,

  csp.created_at,

  -- SERVICE
  s.id AS service_id,
  s.name AS service_name,

  -- PACKAGE
  sp.id AS package_id,
  sp.name AS package_name,
  sp.price AS package_price,
  sp.total_sessions AS package_total_sessions,
  sp.unit,

  -- DOCTOR
  csp.doctor_id,
  doctor_user.name AS doctor_name,

  -- LATEST TECHNICIAN
  latest_session.technician_id,
  technician_user.name AS latest_technician_name,

  -- PAYMENT SUMMARY
  COALESCE(
    SUM(p.paid_amount),
    0
  ) AS total_paid,

  COALESCE(
    SUM(p.remaining_amount),
    0
  ) AS total_remaining,

  JSON_AGG(
    DISTINCT JSONB_BUILD_OBJECT(
      'payment_id', p.id,
      'payment_code', p.payment_code,

      'status', p.status,

      'final_amount', p.final_amount,
      'paid_amount', p.paid_amount,
      'remaining_amount', p.remaining_amount
    )
  )
  FILTER (
    WHERE p.id IS NOT NULL
  ) AS payments

FROM customer_service_profiles csp

LEFT JOIN services s
  ON s.id = csp.service_id

LEFT JOIN service_packages sp
  ON sp.id = csp.package_id

-- DOCTOR
LEFT JOIN users doctor_user
  ON doctor_user.id = csp.doctor_id

-- LATEST SESSION
LEFT JOIN LATERAL (
  SELECT
    css.*
  FROM customer_service_sessions css
  WHERE css.profile_id = csp.id
  ORDER BY css.session_no DESC
  LIMIT 1
) latest_session
ON TRUE

LEFT JOIN staffs tech_staff
  ON tech_staff.id = latest_session.technician_id

LEFT JOIN users technician_user
  ON technician_user.id = tech_staff.user_id

-- PAYMENT
LEFT JOIN payment_items pi
  ON pi.profile_id = csp.id

LEFT JOIN payments p
  ON p.id = pi.payment_id

WHERE csp.customer_id = $1

GROUP BY
  csp.id,
  s.id,
  sp.id,
  doctor_user.name,
  latest_session.technician_id,
  technician_user.name

ORDER BY csp.created_at DESC
    `,
    [user_id],
  );

  const profiles = await Promise.all(
    profilesResult.rows.map(async (profile) => {
      const transactionsResult = await db.query(
        `
      SELECT
        pt.id,

        pt.transaction_code,

        pt.payment_method,

        pt.gateway_provider,

        pt.amount,

        pt.status,

        pt.paid_at,

        p.id AS payment_id,

        p.payment_code

      FROM payment_transactions pt

      INNER JOIN payments p
        ON p.id = pt.payment_id

      INNER JOIN payment_items pi
        ON pi.payment_id = p.id

      WHERE pi.profile_id = $1

      ORDER BY pt.paid_at DESC
      `,
        [profile.id],
      );

      const sessionsResult = await db.query(
        `
  SELECT
    css.id,

    css.profile_id,
    css.session_no,

    css.service_date,
    css.service_time,

    css.status,

    css.started_at,
    css.completed_at,

    css.doctor_note,
    css.skin_reaction,
    css.customer_feedback,
    css.rating,

    css.booking_id,

    css.technician_id,
    tech_user.name AS technician_name

  FROM customer_service_sessions css

  LEFT JOIN staffs tech
    ON tech.id = css.technician_id

  LEFT JOIN users tech_user
    ON tech_user.id = tech.user_id

  WHERE css.profile_id = $1

  ORDER BY css.session_no ASC
  `,
        [profile.id],
      );

      const nextSession =
        sessionsResult.rows.find(
          (s) =>
            new Date(s.service_date) >=
            new Date(new Date().toISOString().split("T")[0]),
        ) || null;

      return {
        ...profile,
        transactions: transactionsResult.rows,
        sessions: sessionsResult.rows,
        next_session: nextSession,
      };
    }),
  );

  return {
    customer,
    profiles,
    total_spending: customer.total_spending || 0,
  };
};


export const rescheduleCustomerSession = async ({
  user_id,
  session_id,
  service_date,
  service_time,
}: {
  user_id: number;
  session_id: number;
  service_date: string;
  service_time: string;
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    //
    // 1. Lấy session
    //
    const sessionResult = await client.query(
      `
      SELECT
        css.id,
        css.profile_id,
        css.session_no,
        css.service_date,
        css.service_time,
        css.booking_id,

        csp.customer_id

      FROM customer_service_sessions css

      INNER JOIN customer_service_profiles csp
        ON csp.id = css.profile_id

      WHERE css.id = $1

      LIMIT 1
      `,
      [session_id],
    );

    const session = sessionResult.rows[0];

    if (!session) {
      throw new Error("Không tìm thấy buổi điều trị");
    }

    //
    // 2. Verify đúng khách hàng
    //
    if (Number(session.customer_id) !== Number(user_id)) {
      throw new Error("Bạn không có quyền chỉnh sửa lịch này");
    }

    //
    // 3. Validate ngày cũ
    //
    const oldDate = new Date(session.service_date);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    //
    // Không cho sửa lịch đã qua
    //
    if (oldDate < today) {
      throw new Error(
        "Không thể thay đổi lịch của buổi đã diễn ra",
      );
    }

    //
    // 4. Validate ngày mới
    //
    const newDate = new Date(service_date);

    if (isNaN(newDate.getTime())) {
      throw new Error("Ngày điều trị không hợp lệ");
    }

    //
    // Không được đổi về trước ngày cũ
    //
    if (newDate < oldDate) {
      throw new Error(
        "Chỉ được dời lịch về sau, không được đổi lịch sớm hơn",
      );
    }

    //
    // Tối đa +7 ngày
    //
    const diffDays =
      (newDate.getTime() - oldDate.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      throw new Error(
        "Chỉ được dời lịch tối đa 7 ngày kể từ lịch hiện tại",
      );
    }

    //
    // 5. Update SESSION
    //
    await client.query(
      `
      UPDATE customer_service_sessions
      SET
        service_date = $1,
        service_time = $2
      WHERE id = $3
      `,
      [
        service_date,
        service_time,
        session_id,
      ],
    );

    //
    // 6. Update BOOKING nếu có
    //
    if (session.booking_id) {
      await client.query(
        `
        UPDATE bookings
        SET
          booking_date = $1,
          booking_time = $2,
          updated_at = NOW()
        WHERE id = $3
        `,
        [
          service_date,
          service_time,
          session.booking_id,
        ],
      );
    }

    //
    // 7. Lấy dữ liệu mới
    //
    const updatedResult = await client.query(
      `
      SELECT
        css.id,
        css.profile_id,
        css.session_no,
        css.service_date,
        css.service_time,
        css.booking_id
      FROM customer_service_sessions css
      WHERE css.id = $1
      `,
      [session_id],
    );

    await client.query("COMMIT");

    return {
      message: "Đổi lịch thành công",
      session: updatedResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};