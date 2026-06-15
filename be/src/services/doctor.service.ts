import { db } from "../config/db.js";

/**
 * 🔹 1. Lấy danh sách booking chờ bác sĩ (CHECKED_IN)
 */
export const getWaitingConsultations = async () => {
  const result = await db.query(`
    SELECT 
      b.*,
      u.name,
      u.phone,
      u.email,
      s.name as service_name

    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN services s ON b.service_id = s.id

    WHERE b.status IN (
      'CHECKED_IN',
      'IN_CONSULTATION',
      'CONSULTED',
      'IN_TREATMENT',
      'COMPLETED'
    )
    AND b.booking_date = CURRENT_DATE
    ORDER BY b.checked_in_at ASC
  `);

  return result.rows;
};

/**
 * 🔹 2. Lấy chi tiết 1 booking + consultation (nếu có)
 */
export const getConsultationDetail = async (bookingId: string) => {
  const result = await db.query(
    `
    SELECT 
      b.*,

      -- user
      u.name,
      u.phone,
      u.email,

      -- customer
      c.note as customer_note,
      c.last_visit_at,
      c.total_visits,

      -- service
      s.name as service_name,

      -- consultation
      bc.id as consultation_id,
      bc.doctor_id,
      bc.diagnosis,
      bc.consultation_note,
      bc.recommended_package_id,
      bc.is_consultation,
      bc.profile_id,
      bc.started_at,
      bc.finished_at

    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN customers c on c.user_id = u.id
    JOIN services s ON b.service_id = s.id
    LEFT JOIN booking_consultations bc 
      ON bc.booking_id = b.id

    WHERE b.id = $1
  `,
    [bookingId],
  );

  const booking = result.rows[0];

  if (!booking) return null;

  const profile = await getProfileByBooking(Number(bookingId));

  if (!profile) {
    return booking;
  }

  const consultation = await getConsultationByProfile(profile.profile_id);

  const sessionResult = await db.query(
    `
  SELECT
    session_no
  FROM customer_service_sessions
  WHERE booking_id = $1
  `,
    [bookingId],
  );

  const currentSession = sessionResult.rows[0];

  const nextInfo = await getNextSessionInfoByBooking(Number(bookingId));

  return {
    ...booking,

    profile_id: profile.profile_id,

    package_id: profile.package_id,

    package_name: profile.package_name,

    package_price: profile.price,

    total_sessions: profile.total_sessions,

    diagnosis: consultation?.diagnosis ?? booking.diagnosis,

    consultation_note:
      consultation?.consultation_note ?? booking.consultation_note,

    current_session_no: currentSession?.session_no ?? null,

    next_session_no: nextInfo?.next_session_no ?? null,

    remaining_sessions: nextInfo?.remaining_sessions ?? null,
  };
};

/**
 * 🔹 3. Bác sĩ nhận khách (CHECKED_IN → IN_CONSULTATION)
 * ⚠️ Có lock để tránh 2 bác sĩ nhận cùng lúc
 */
export const startConsultation = async (
  bookingId: string,
  doctorId: number,
) => {
  // 🔹 update status (lock)
  const booking = await db.query(
    `
    UPDATE bookings
    SET status = 'IN_CONSULTATION',
        updated_at = NOW()
    WHERE id = $1 AND status = 'CHECKED_IN'
    RETURNING *
  `,
    [bookingId],
  );

  if (!booking.rows[0]) return null;

  // 🔹 tạo consultation nếu chưa có
  await db.query(
    `
    INSERT INTO booking_consultations (
      booking_id,
      doctor_id,
      started_at
    )
    VALUES ($1, $2, NOW())
    ON CONFLICT (booking_id) DO NOTHING
  `,
    [bookingId, doctorId],
  );

  return booking.rows[0];
};

/**
 * 🔹 4. Cập nhật thông tin chẩn đoán của bác sĩ
 */
export const updateConsultation = async (bookingId: string, data: any) => {
  const {
    diagnosis,
    consultation_note,
    recommended_package_id,
    is_consultation,
    profile_id,
  } = data;

  const result = await db.query(
    `
    UPDATE booking_consultations
    SET
      diagnosis = COALESCE($1, diagnosis),
      consultation_note = COALESCE($2, consultation_note),
      recommended_package_id = COALESCE($3, recommended_package_id),
      is_consultation = COALESCE($4, is_consultation),
      profile_id = COALESCE($5, profile_id)
    WHERE booking_id = $6
    RETURNING *
  `,
    [
      diagnosis ?? null,
      consultation_note ?? null,
      recommended_package_id ?? null,
      is_consultation ?? null,
      profile_id ?? null,
      bookingId,
    ],
  );

  return result.rows[0];
};

/**
 * 🔹 5. Kết thúc tư vấn (IN_CONSULTATION → IN_TREATMENT hoặc CONSULTED)
 */
export const finishConsultation = async (bookingId: string) => {
  // 🔹 update consultation
  await db.query(
    `
    UPDATE booking_consultations
    SET 
      finished_at = NOW(),
      is_consultation = true
    WHERE booking_id = $1
  `,
    [bookingId],
  );

  // 🔹 update booking status
  const result = await db.query(
    `
    UPDATE bookings
    SET status = 'CONSULTED',
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [bookingId],
  );

  return result.rows[0];
};

/**
 * 🔹 6. Lấy danh sách đang được bác sĩ xử lý
 */
export const getConsultingBookings = async (doctorId: number) => {
  const result = await db.query(
    `
    SELECT 
      b.*,
      u.name,
      u.phone,
      s.name as service_name,
      bc.started_at

    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN services s ON b.service_id = s.id
    JOIN booking_consultations bc 
      ON bc.booking_id = b.id

    WHERE b.status = 'IN_CONSULTATION'
      AND bc.doctor_id = $1

    ORDER BY bc.started_at ASC
  `,
    [doctorId],
  );

  return result.rows;
};

// TƯƠNG TÁC VỚI CUSTOMER-SERVICE

export const createCustomerServiceProfile = async (data: any) => {
  const {
    customer_id,
    service_id,
    package_id,
    doctor_id,
    total_sessions,
    booking_id,
    note,
  } = data;

  const result = await db.query(
    `
    INSERT INTO customer_service_profiles (
      customer_id,
      service_id,
      package_id,
      doctor_id,
      total_sessions,
      booking_id,
      note,
      started_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
    RETURNING *
  `,
    [
      customer_id,
      service_id,
      package_id,
      doctor_id ?? null,
      total_sessions,
      booking_id ?? null,
      note ?? null,
    ],
  );

  const profile = result.rows[0];

  if (booking_id) {
    await db.query(
      `
    UPDATE booking_consultations
    SET profile_id = $1
    WHERE booking_id = $2
    `,
      [profile.id, booking_id],
    );
  }

  return profile;
};

export const updateCustomerServiceProfile = async (id: number, data: any) => {
  const {
    doctor_id,
    technician_id,
    total_sessions,
    used_sessions,
    status,
    note,
  } = data;

  const result = await db.query(
    `
    UPDATE customer_service_profiles
    SET
      doctor_id = COALESCE($1, doctor_id),
      technician_id = COALESCE($2, technician_id),
      total_sessions = COALESCE($3, total_sessions),
      used_sessions = COALESCE($4, used_sessions),
      status = COALESCE($5, status),
      note = COALESCE($6, note)
    WHERE id = $7
    RETURNING *
  `,
    [
      doctor_id ?? null,
      technician_id ?? null,
      total_sessions ?? null,
      used_sessions ?? null,
      status ?? null,
      note ?? null,
      id,
    ],
  );

  return result.rows[0];
};

export const deleteCustomerServiceProfile = async (id: number) => {
  await db.query(
    `
    DELETE FROM customer_service_profiles
    WHERE id = $1
  `,
    [id],
  );
};

export const createServiceSession = async (data: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      profile_id,
      session_no,
      service_date,
      service_time,
      technician_id,
    } = data;

    const profileResult = await client.query(
      `
SELECT
  p.*,
  b.customer_id,
  b.service_id
FROM customer_service_profiles p
JOIN bookings b
  ON b.id = p.booking_id
WHERE p.id = $1
`,
      [profile_id],
    );

    const profile = profileResult.rows[0];

    const bookingResult = await client.query(
      `
INSERT INTO bookings (
  booking_code,
  customer_id,
  service_id,
  booking_date,
  booking_time,
  quantity,
  created_source,
  status
)
VALUES (
  CONCAT(
    'BK',
    EXTRACT(EPOCH FROM NOW())::BIGINT,
    FLOOR(RANDOM()*1000)
  ),
  $1,
  $2,
  $3,
  $4,
  1,
  'STAFF',
  'PENDING'
)
RETURNING *
`,
      [profile.customer_id, profile.service_id, service_date, service_time],
    );

    const newBooking = bookingResult.rows[0];

    const result = await client.query(
      `
INSERT INTO customer_service_sessions (
  profile_id,
  session_no,
  service_date,
  service_time,
  technician_id,
  booking_id,
  status
)
VALUES (
  $1,$2,$3,$4,$5,$6,'scheduled'
)
RETURNING *
`,
      [
        profile_id,
        session_no,
        service_date,
        service_time,
        technician_id ?? null,
        newBooking.id,
      ],
    );

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateServiceSession = async (id: number, data: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const {
      technician_id,
      doctor_note,
      skin_reaction,
      customer_feedback,
      rating,
      status,
      service_date,
      service_time,
    } = data;

    const result = await client.query(
      `
    UPDATE customer_service_sessions
    SET
      technician_id = COALESCE($1, technician_id),
      doctor_note = COALESCE($2, doctor_note),
      skin_reaction = COALESCE($3, skin_reaction),
      customer_feedback = COALESCE($4, customer_feedback),
      rating = COALESCE($5, rating),
      status = COALESCE($6, status),
      service_date = COALESCE($7, service_date),
service_time = COALESCE($8, service_time)
    WHERE id = $9
    RETURNING *
  `,
      [
        technician_id ?? null,
        doctor_note ?? null,
        skin_reaction ?? null,
        customer_feedback ?? null,
        rating ?? null,
        status ?? null,
        service_date ?? null,
        service_time ?? null,
        id,
      ],
    );

    const session = result.rows[0];
    if (service_date || service_time) {
      await client.query(
        `
    UPDATE bookings
    SET
      booking_date = COALESCE($1, booking_date),
      booking_time = COALESCE($2, booking_time),
      updated_at = NOW()
    WHERE id = $3
    `,
        [service_date ?? null, service_time ?? null, session.booking_id],
      );
    }

    await client.query("COMMIT");

    return session;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteServiceSession = async (id: number) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const session = await client.query(
      `
SELECT booking_id
FROM customer_service_sessions
WHERE id = $1
`,
      [id],
    );

    await db.query(
      `
DELETE FROM bookings
WHERE id = $1
`,
      [session.rows[0].booking_id],
    );

    await client.query(
      `
    DELETE FROM customer_service_sessions
    WHERE id = $1
  `,
      [id],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Lấy session cuối cùng của profile
 */
export const getNextSessionInfo = async (profileId: number) => {
  const result = await db.query(
    `
    SELECT
      p.id,
      p.total_sessions,
      p.used_sessions,

      COALESCE(
        MAX(ss.session_no),
        0
      ) as last_session_no

    FROM customer_service_profiles p

    LEFT JOIN customer_service_sessions ss
      ON ss.profile_id = p.id

    WHERE p.id = $1

    GROUP BY
      p.id,
      p.total_sessions,
      p.used_sessions
    `,
    [profileId],
  );

  const row = result.rows[0];

  return {
    profile_id: row.id,
    total_sessions: row.total_sessions,
    used_sessions: row.used_sessions,
    last_session_no: Number(row.last_session_no),

    next_session_no: Number(row.last_session_no) + 1,

    remaining_sessions: row.total_sessions - Number(row.last_session_no),
  };
};

export const getNextSessionInfoByBooking = async (bookingId: number) => {
  const result = await db.query(
    `
SELECT
  css.profile_id,
  css.session_no,

  p.total_sessions

FROM customer_service_sessions css

JOIN customer_service_profiles p
  ON p.id = css.profile_id

WHERE css.booking_id = $1
`,
    [bookingId],
  );
  const row = result.rows[0];

  if (!result.rows.length) {
    return null;
  }

  return {
    profile_id: row.profile_id,

    current_session_no: row.session_no,

    next_session_no: row.session_no + 1,

    total_sessions: row.total_sessions,

    remaining_sessions: row.total_sessions - row.session_no,
  };
};

export const getProfileByBooking = async (bookingId: number) => {
  const result = await db.query(
    `
    SELECT
      p.id as profile_id,
      p.package_id,
      p.total_sessions,
      p.used_sessions,

      sp.name as package_name,
      sp.price,
      sp.total_sessions as package_total_sessions,

      s.id as service_id,
      s.name as service_name

    FROM customer_service_sessions css

    JOIN customer_service_profiles p
      ON p.id = css.profile_id

    JOIN service_packages sp
      ON sp.id = p.package_id

    JOIN services s
      ON s.id = p.service_id

    WHERE css.booking_id = $1
    `,
    [bookingId],
  );

  return result.rows[0];
};

export const getConsultationByProfile = async (profileId: number) => {
  const result = await db.query(
    `
    SELECT
      bc.id,
      bc.booking_id,

      bc.diagnosis,
      bc.consultation_note,

      p.id as profile_id,
      p.package_id,

      sp.name as package_name,
      sp.price,
      sp.total_sessions

    FROM customer_service_profiles p

    JOIN booking_consultations bc
      ON bc.booking_id = p.booking_id

    JOIN service_packages sp
      ON sp.id = p.package_id

    WHERE p.id = $1
    `,
    [profileId],
  );

  return result.rows[0];
};

export const getReExaminationInfo = async (bookingId: number) => {
  const profile = await getProfileByBooking(bookingId);

  if (!profile) {
    return null;
  }

  const consultation = await getConsultationByProfile(profile.profile_id);

  const sessionInfo = await getNextSessionInfoByBooking(bookingId);

  return {
    profile,
    consultation,
    sessionInfo,
  };
};
