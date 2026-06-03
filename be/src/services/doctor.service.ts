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

  return result.rows[0];
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
export const updateConsultation = async (
  bookingId: string,
  data: any,
) => {
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

  return result.rows[0];
};

export const updateCustomerServiceProfile = async (
  id: number,
  data: any,
) => {
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
  const {
    profile_id,
    session_no,
    service_date,
    technician_id,
    booking_id,
  } = data;

  const result = await db.query(
    `
    INSERT INTO customer_service_sessions (
      profile_id,
      session_no,
      service_date,
      technician_id,
      booking_id,
      status
    )
    VALUES ($1,$2,$3,$4,$5,'scheduled')
    RETURNING *
  `,
    [
      profile_id,
      session_no,
      service_date,
      technician_id ?? null,
      booking_id ?? null,
    ],
  );

  return result.rows[0];
};

export const updateServiceSession = async (
  id: number,
  data: any,
) => {
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
      technician_id = COALESCE($1, technician_id),
      doctor_note = COALESCE($2, doctor_note),
      skin_reaction = COALESCE($3, skin_reaction),
      customer_feedback = COALESCE($4, customer_feedback),
      rating = COALESCE($5, rating),
      status = COALESCE($6, status)
    WHERE id = $7
    RETURNING *
  `,
    [
      technician_id ?? null,
      doctor_note ?? null,
      skin_reaction ?? null,
      customer_feedback ?? null,
      rating ?? null,
      status ?? null,
      id,
    ],
  );

  return result.rows[0];
};

export const deleteServiceSession = async (id: number) => {
  await db.query(
    `
    DELETE FROM customer_service_sessions
    WHERE id = $1
  `,
    [id],
  );
};