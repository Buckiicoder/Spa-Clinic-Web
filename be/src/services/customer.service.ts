import { db } from "../config/db.js";

// ✅ Lấy tất cả khách hàng
export const getCustomers = async () => {
  const result = await db.query(`
    SELECT DISTINCT ON (u.id)
      u.id,
      u.name,
      u.phone,
      u.email,

      c.total_spending,
      c.rank,
      c.status,
      c.source,
      c.total_visits,
      c.last_visit_at

    FROM users u
    LEFT JOIN customers c ON c.user_id = u.id
    JOIN bookings b ON b.customer_id = u.id

    WHERE u.role = 'CUSTOMER'
      AND b.status IN ('CHECKED_IN','CONSULTING','IN_PROGRESS')
      AND DATE(b.checked_in_at) = CURRENT_DATE

    ORDER BY u.id, b.checked_in_at DESC
  `);

  return result.rows;
};

// ✅ Lấy chi tiết khách hàng
export const getCustomerDetail = async (id: number) => {
  const result = await db.query(
    `
    SELECT 
      u.*,

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
    LEFT JOIN customers c ON c.user_id = u.id
    WHERE u.id = $1
  `,
    [id],
  );

  return result.rows[0];
};

export const checkInCustomer = async (booking_id: number) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. update booking
    const bookingRes = await client.query(
      `
      UPDATE bookings
      SET 
        status = 'CHECKED_IN',
        checked_in_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [booking_id],
    );

    const booking = bookingRes.rows[0];

    // 2. update customer visit
    await client.query(
      `
      UPDATE customers
      SET 
        total_visits = COALESCE(total_visits,0) + 1,
        last_visit_at = NOW(),
        first_visit_at = COALESCE(first_visit_at, NOW())
      WHERE user_id = $1
    `,
      [booking.customer_id],
    );

    await client.query("COMMIT");

    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const updateCustomer = async (user_id: number, data: any) => {
  const client = await db.connect();

  const { source, note, status, referrer_id } = data;

  try {
    await client.query("BEGIN");

    // 🔹 1. đảm bảo có record trong customers
    await client.query(
      `
      INSERT INTO customers (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `,
      [user_id],
    );

    

    // 🔹 2. validate referrer (nếu có)
    if (referrer_id) {
      const refCheck = await client.query(
        `SELECT id FROM customers WHERE id = $1`,
        [referrer_id],
      );

      if (refCheck.rowCount === 0) {
        throw new Error("Referrer không tồn tại");
      }
    }

    // 🔹 3. update đúng field nội bộ
    const result = await client.query(
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

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// CUSTOMER SERVICE PROFILE (LIỆU TRÌNH)

// ✅ Tạo liệu trình + auto tạo sessions
export const createCustomerServiceProfile = async (data: any) => {
  const {
    customer_id,
    service_id,
    package_id,
    doctor_id,
    total_sessions,
    note,
  } = data;

  if (!customer_id || !service_id || !package_id) {
    throw new Error("Thiếu dữ liệu bắt buộc");
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 🔹 tạo profile
    const profileResult = await client.query(
      `
      INSERT INTO customer_service_profiles
      (customer_id, service_id, package_id, doctor_id, total_sessions, note, started_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
      RETURNING *
    `,
      [customer_id, service_id, package_id, doctor_id, total_sessions, note],
    );

    const profile = profileResult.rows[0];

    // 🔹 auto tạo sessions
    for (let i = 1; i <= total_sessions; i++) {
      await client.query(
        `
        INSERT INTO customer_service_sessions
        (profile_id, session_no, service_date, status)
        VALUES ($1, $2, NOW(), 'scheduled')
      `,
        [profile.id, i],
      );
    }

    await client.query("COMMIT");

    return profile;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ✅ Lấy danh sách liệu trình của khách
export const getProfilesByCustomer = async (customer_id: number) => {
  const result = await db.query(
    `
    SELECT 
      p.*,
      s.name as service_name,
      sp.name as package_name
    FROM customer_service_profiles p
    JOIN services s ON p.service_id = s.id
    JOIN service_packages sp ON p.package_id = sp.id
    WHERE p.customer_id = $1
    ORDER BY p.created_at DESC
  `,
    [customer_id],
  );

  return result.rows;
};

// ✅ Lấy chi tiết 1 liệu trình
export const getProfileDetail = async (profile_id: number) => {
  const result = await db.query(
    `
    SELECT 
      p.*,
      s.name as service_name,
      sp.name as package_name
    FROM customer_service_profiles p
    JOIN services s ON p.service_id = s.id
    JOIN service_packages sp ON p.package_id = sp.id
    WHERE p.id = $1
  `,
    [profile_id],
  );

  return result.rows[0];
};

// ✅ Lấy sessions theo profile
export const getSessionsByProfile = async (profile_id: number) => {
  const result = await db.query(
    `
    SELECT *
    FROM customer_service_sessions
    WHERE profile_id = $1
    ORDER BY session_no ASC
  `,
    [profile_id],
  );

  return result.rows;
};

// ✅ cập nhật trạng thái buổi
export const updateSession = async (id: number, data: any) => {
  const {
    technician_id,
    doctor_note,
    skin_reaction,
    customer_feedback,
    rating,
    status,
  } = data;

  const result = await db.query(
    `
    UPDATE customer_service_sessions
    SET 
      technician_id = $1,
      doctor_note = $2,
      skin_reaction = $3,
      customer_feedback = $4,
      rating = $5,
      status = $6
    WHERE id = $7
    RETURNING *
  `,
    [
      technician_id,
      doctor_note,
      skin_reaction,
      customer_feedback,
      rating,
      status,
      id,
    ],
  );

  // nếu status = done → tăng used_sessions
  if (status === "done") {
    await db.query(
      `
    UPDATE customer_service_profiles
    SET used_sessions = used_sessions + 1
    WHERE id = (
      SELECT profile_id 
      FROM customer_service_sessions 
      WHERE id = $1
    )
  `,
      [id],
    );
  }

  return result.rows[0];
};

// ✅ hoàn thành liệu trình
export const completeProfile = async (profile_id: number) => {
  await db.query(
    `
    UPDATE customer_service_profiles
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = $1
    AND used_sessions >= total_sessions
  `,
    [profile_id],
  );

  return await getProfileDetail(profile_id);
};

// ✅ tạo 1 session thủ công
export const createSession = async (data: any) => {
  const { profile_id, session_no, service_date } = data;

  const result = await db.query(
    `
    INSERT INTO customer_service_sessions
    (profile_id, session_no, service_date, status)
    VALUES ($1, $2, $3, 'scheduled')
    RETURNING *
  `,
    [profile_id, session_no, service_date],
  );

  return result.rows[0];
};
