import { db } from "../config/db.js";

export const searchCustomers = async (phone?: string, email?: string) => {
  let query = `
    SELECT id, name, phone, email
    FROM users
    WHERE role = 'CUSTOMER'
  `;

  const params: any[] = [];

  if (phone) {
    params.push(`%${phone}%`);
    query += ` AND phone ILIKE $${params.length}`;
  }

  if (email) {
    params.push(`%${email}%`);
    query += ` AND email ILIKE $${params.length}`;
  }

  query += ` ORDER BY created_at DESC LIMIT 5`;

  const result = await db.query(query, params);

  return result.rows;
};

export const findUserByContact = async (
  phone?: string | null,
  email?: string | null,
) => {
  const result = await db.query(
    `SELECT * FROM users WHERE phone = $1 OR email = $2 LIMIT 1`,
    [phone || null, email || null],
  );
  return result.rows[0];
};

export const createGuestUser = async (
  name: string,
  phone?: string | null,
  email?: string | null,
) => {
  const result = await db.query(
    `INSERT INTO users (name, phone, email, role, is_verified) 
    VALUES ($1, $2, $3, 'CUSTOMER', false)
    RETURNING *`,
    [name, phone, email || null],
  );
  return result.rows[0];
};

export const upsertCustomer = async (user_id: number, data: any) => {
  const { source, customer_note, customer_status, referrer_id } = data;

  await db.query(
    `
    INSERT INTO customers (user_id, source, note, status, referrer_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id) DO UPDATE
    SET 
      source = $2,
      note = $3,
      status = $4,
      referrer_id = $5
  `,
    [
      user_id,
      source ?? null,
      customer_note ?? null,
      customer_status ?? null,
      referrer_id ?? null,
    ],
  );
};

export const getBookings = async () => {
  const result = await db.query(`
    SELECT
      b.*,

      u.name,
      u.phone,
      u.email,

      s.name AS service_name,

      COALESCE(
        payment_summary.unpaid_profiles,
        0
      ) AS unpaid_profiles,

      COALESCE(
        payment_summary.has_unpaid_payment,
        false
      ) AS has_unpaid_payment

    FROM bookings b

    INNER JOIN users u
      ON u.id = b.customer_id

    INNER JOIN services s
      ON s.id = b.service_id

    LEFT JOIN (
      SELECT
        booking_profiles.booking_id,

        COUNT(*) FILTER (
          WHERE
            booking_profiles.is_unpaid = true
        )::INTEGER AS unpaid_profiles,

        BOOL_OR(
          booking_profiles.is_unpaid = true
        ) AS has_unpaid_payment

      FROM (
        SELECT DISTINCT
          csp.id AS profile_id,

          csp.booking_id,

          CASE
            -- chưa có payment
            WHEN p.id IS NULL THEN true

            -- còn nợ
            WHEN p.remaining_amount > 0 THEN true

            ELSE false
          END AS is_unpaid

        FROM customer_service_profiles csp

        LEFT JOIN payment_items pi
          ON pi.profile_id = csp.id

        LEFT JOIN payments p
          ON p.id = pi.payment_id
      ) booking_profiles

      GROUP BY booking_profiles.booking_id
    ) payment_summary
      ON payment_summary.booking_id = b.id

    ORDER BY b.created_at DESC
  `);

  return result.rows;
};

export const getBookingById = async (
  id: string
) => {
  const result = await db.query(
    `
    SELECT
      b.*,

      u.name,
      u.phone,
      u.email,

      s.name AS service_name,

      c.source,
      c.note AS customer_note,
      c.status AS customer_status,
      c.referrer_id,

      c.total_visits,
      c.last_visit_at,
      c.first_visit_at,

      COALESCE(
        payment_summary.unpaid_profiles,
        0
      ) AS unpaid_profiles,

      COALESCE(
        payment_summary.has_unpaid_payment,
        false
      ) AS has_unpaid_payment

    FROM bookings b

    INNER JOIN users u
      ON u.id = b.customer_id

    INNER JOIN services s
      ON s.id = b.service_id

    LEFT JOIN customers c
      ON c.user_id = u.id

    LEFT JOIN (
      SELECT
        csp.booking_id,

        COUNT(*) FILTER (
          WHERE
            p.id IS NULL
            OR p.remaining_amount > 0
        )::INTEGER AS unpaid_profiles,

        BOOL_OR(
          p.id IS NULL
          OR p.remaining_amount > 0
        ) AS has_unpaid_payment

      FROM customer_service_profiles csp

      LEFT JOIN payment_items pi
        ON pi.profile_id = csp.id

      LEFT JOIN payments p
        ON p.id = pi.payment_id

      GROUP BY csp.booking_id
    ) payment_summary
      ON payment_summary.booking_id = b.id

    WHERE b.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

export const createBooking = async (data: any) => {
  const {
    customer_id,
    service_id,
    booking_date,
    booking_time,
    quantity,
    created_by,
    note,
    created_source,
    conversation_id,
  } = data;

  const result = await db.query(
    `
    INSERT INTO bookings (
      booking_code,
      customer_id,
      service_id,
      booking_date,
      booking_time,
      quantity,
      created_by,
      note,
      created_source, 
      conversation_id
    )
    VALUES (
      CONCAT('BK', EXTRACT(EPOCH FROM NOW())::BIGINT, FLOOR(RANDOM() * 1000)),
      $1,$2,$3,$4,$5,$6,$7,$8,$9
    )
    RETURNING *
  `,
    [
      customer_id,
      service_id,
      booking_date,
      booking_time,
      quantity,
      created_by ?? null,
      note ?? null,
      created_source ?? "USER",
      conversation_id ?? null,
    ],
  );

  return result.rows[0];
};

export const updateBooking = async (id: string, data: any) => {
  const { note } = data;

  const result = await db.query(
    `
    UPDATE bookings
    SET
      note = COALESCE($1, note),
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `,
    [note ?? null, id],
  );

  return result.rows[0];
};

export const updateCustomerVisit = async (user_id: number) => {
  await db.query(
    `
    INSERT INTO customers (user_id)
    VALUES ($1)
    ON CONFLICT (user_id) DO NOTHING
  `,
    [user_id],
  );

  await db.query(
    `
    UPDATE customers
    SET 
      total_visits = COALESCE(total_visits,0) + 1,
      last_visit_at = NOW(),
      first_visit_at = COALESCE(first_visit_at, NOW())
    WHERE user_id = $1
  `,
    [user_id],
  );
};

export const checkInBooking = async (id: string, staff_id: number) => {
  const result = await db.query(
    `
    UPDATE bookings
    SET
      status = 'CHECKED_IN',
      confirmed_by = $1,
      checked_in_at = NOW(),
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `,
    [staff_id, id],
  );

  return result.rows[0];
};

export const deleteBooking = async (id: string) => {
  await db.query(
    `
    DELETE FROM bookings
    WHERE id = $1
  `,
    [id],
  );
};