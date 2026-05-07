import { db } from "../config/db.js";

/**
 * ============================================
 * 🔹 1. LẤY KHÁCH ĐÃ KHÁM XONG TRONG NGÀY
 * ============================================
 */
export const getConsultedToday = async () => {
  const result = await db.query(`
    SELECT DISTINCT ON (p.id)

      b.id as booking_id,
      b.booking_code,
      b.updated_at,

      u.id as customer_id,
      u.name,
      u.phone,

      s.name as service_name,

      sp.name as package_name,

      p.id as profile_id,
      p.total_sessions,
      p.used_sessions,

      ss.id as session_id,
      ss.session_no,
      ss.service_date,
      ss.status,
      ss.technician_id,

      technician.name as technician_name

    FROM bookings b

    JOIN users u 
      ON b.customer_id = u.id

    JOIN services s 
      ON b.service_id = s.id

    JOIN customer_service_profiles p 
      ON p.booking_id = b.id

    JOIN customer_service_sessions ss 
      ON ss.profile_id = p.id

    LEFT JOIN users technician
      ON technician.id = ss.technician_id

    JOIN service_packages sp
      ON sp.id = p.package_id

    WHERE b.status = 'CONSULTED'
      AND DATE(ss.service_date) = CURRENT_DATE
      AND ss.status IN (
        'scheduled',
        'assigned',
        'in_progress'
      )
    ORDER BY p.id, ss.session_no ASC
  `);

  return result.rows;
};

/**
 * ============================================
 * 🔹 2. LẤY DANH SÁCH KTV ĐANG LÀM
 * ============================================
 */
export const getWorkingTechnicians = async () => {
  const result = await db.query(`
    SELECT 
    u.id,
    u.name,
    u.phone,

    busy_session.id as current_session_id,
    busy_session.status as current_session_status,

    customer.name as current_customer_name,

    CASE
      WHEN busy_session.id IS NOT NULL THEN true
      ELSE false
    END as is_busy

  FROM users u

  JOIN timekeeping_daily t 
    ON t.user_id = u.id

  LEFT JOIN customer_service_sessions busy_session
    ON busy_session.technician_id = u.id
    AND busy_session.status IN ('assigned', 'in_progress')

  LEFT JOIN customer_service_profiles p
    ON p.id = busy_session.profile_id

  LEFT JOIN users customer
    ON customer.id = p.customer_id

  WHERE t.status = 'WORKING'
    AND DATE(t.work_date) = CURRENT_DATE

  ORDER BY u.name ASC
`);

  return result.rows;
};

/**
 * ============================================
 * 🔹 3. QUẢN LÝ GÁN KTV CHO SESSION
 * ============================================
 */
export const assignTechnicianToSession = async (
  sessionId: number,
  technicianId: number,
  managerId: number,
) => {
  const result = await db.query(
    `
    UPDATE customer_service_sessions
    SET 
      technician_id = $1,
      manager_id = $2,
      status = 'assigned'
    WHERE id = $3
    RETURNING *
  `,
    [technicianId, managerId, sessionId],
  );

  return result.rows[0];
};

/**
 * ============================================
 * 🔹 4. LẤY DANH SÁCH SESSION CỦA KTV
 * ============================================
 */
export const getMyAssignedSessions = async (technicianId: number) => {
  const result = await db.query(
    `
    SELECT 
      ss.*,
      p.id as profile_id,

      u.name as customer_name,
      u.phone,

      s.name as service_name

    FROM customer_service_sessions ss
    JOIN customer_service_profiles p 
      ON ss.profile_id = p.id

    JOIN users u ON p.customer_id = u.id
    JOIN services s ON p.service_id = s.id

    WHERE ss.technician_id = $1
      AND ss.status IN ('assigned', 'in_progress')

    ORDER BY ss.service_date ASC
  `,
    [technicianId],
  );

  return result.rows;
};

/**
 * ============================================
 * 🔹 5. LẤY FULL CHI TIẾT 1 SESSION (QUAN TRỌNG)
 * ============================================
 */
export const getSessionDetail = async (sessionId: number) => {
  const result = await db.query(
    `
    SELECT 
      ss.*,

      -- profile
      p.total_sessions,
      p.used_sessions,
      p.status as profile_status,

      -- customer
      u.name,
      u.phone,
      u.email,

      -- booking
      b.booking_code,
      b.booking_date,

      -- service
      s.name as service_name,

      -- package
      sp.name as package_name

    FROM customer_service_sessions ss

    JOIN customer_service_profiles p 
      ON ss.profile_id = p.id

    JOIN users u ON p.customer_id = u.id
    JOIN bookings b ON ss.booking_id = b.id
    JOIN services s ON p.service_id = s.id
    JOIN service_packages sp ON p.package_id = sp.id

    WHERE ss.id = $1
  `,
    [sessionId],
  );

  return result.rows[0];
};

/**
 * ============================================
 * 🔹 6. LẤY LỊCH SỬ CÁC BUỔI (SESSION HISTORY)
 * ============================================
 */
export const getSessionHistory = async (profileId: number) => {
  const result = await db.query(
    `
    SELECT 
      session_no,
      service_date,
      status,
      doctor_note,
      skin_reaction,
      customer_feedback,
      rating

    FROM customer_service_sessions
    WHERE profile_id = $1
    ORDER BY session_no ASC
  `,
    [profileId],
  );

  return result.rows;
};

/**
 * ============================================
 * 🔹 8. KTV BẮT ĐẦU LÀM SESSION
 * ============================================
 */
export const startSession = async (sessionId: number) => {
  const result = await db.query(
    `
    UPDATE customer_service_sessions
    SET status = 'in_progress'
    WHERE id = $1
    RETURNING *
  `,
    [sessionId],
  );

  return result.rows[0];
};

/**
 * ============================================
 * 🔹 9. HOÀN THÀNH SESSION
 * ============================================
 */
export const completeSession = async (sessionId: number, data: any) => {
  const { doctor_note, skin_reaction, customer_feedback, rating } = data;

  const result = await db.query(
    `
    UPDATE customer_service_sessions
    SET 
      status = 'done',
      doctor_note = $1,
      skin_reaction = $2,
      customer_feedback = $3,
      rating = $4
    WHERE id = $5
    RETURNING *
  `,
    [
      doctor_note ?? null,
      skin_reaction ?? null,
      customer_feedback ?? null,
      rating ?? null,
      sessionId,
    ],
  );

  // 🔥 update used_sessions
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
    [sessionId],
  );

  return result.rows[0];
};

export const getTechnicianSessionDetail = async (
  sessionId: number,
) => {
  /**
   * 🔥 1. session info
   */
  const sessionResult = await db.query(
    `
    SELECT
      ss.*,

      p.id as profile_id,
      p.package_id,
      p.total_sessions,
      p.used_sessions,

      customer.id as customer_id,
      customer.name as customer_name,
      customer.phone,

      s.name as service_name,
      sp.name as package_name

    FROM customer_service_sessions ss

    JOIN customer_service_profiles p
      ON p.id = ss.profile_id

    JOIN users customer
      ON customer.id = p.customer_id

    JOIN services s
      ON s.id = p.service_id

    JOIN service_packages sp
      ON sp.id = p.package_id

    WHERE ss.id = $1
  `,
    [sessionId],
  );

  const session = sessionResult.rows[0];

  if (!session) return null;

  /**
   * 🔥 2. tìm template session
   */
  const templateResult = await db.query(
    `
    SELECT
      ts.id as template_session_id,
      ts.session_no,
      tp.id as phase_id,
      tp.name as phase_name

    FROM treatment_sessions ts

    JOIN treatment_plan_phases tp
      ON tp.id = ts.phase_id

    WHERE ts.package_id = $1
      AND ts.session_no = $2

    LIMIT 1
  `,
    [
      session.package_id,
      session.session_no,
    ],
  );

  const template = templateResult.rows[0];

  if (!template) {
  return {
    ...session,
    phase: null,
    steps: [],
  };
}

  /**
   * 🔥 3. steps + products
   */
const stepResult = await db.query(
  `
  SELECT
    st.id as step_id,
    st.step_no,
    st.name as step_name,
    st.duration_minutes,
    st.instruction,

    pr.id as product_id,
    pr.name as product_name,

    tsp.quantity,
    tsp.usage_note

  FROM treatment_session_steps st

  LEFT JOIN treatment_step_products tsp
    ON tsp.step_id = st.id

  LEFT JOIN products pr
    ON pr.id = tsp.product_id

  WHERE st.session_id = $1

  ORDER BY
    st.step_no ASC,
    pr.name ASC
`,
  [template.template_session_id],
);

  /**
   * 🔥 group products theo step
   */
  const stepMap = new Map();

  for (const row of stepResult.rows) {
    if (!stepMap.has(row.step_id)) {
      stepMap.set(row.step_id, {
        step_id: row.step_id,
        step_no: row.step_no,
        step_name: row.step_name,
        instruction: row.instruction,
duration_minutes: row.duration_minutes,
        products: [],
      });
    }

    if (row.product_id) {
      stepMap.get(row.step_id).products.push({
        product_id: row.product_id,
        product_name: row.product_name,
        brand: row.brand,
        quantity: row.quantity,
        usage_note: row.usage_note,
      });
    }
  }

  return {
    ...session,

    phase: template
      ? {
          phase_id: template.phase_id,
          phase_name: template.phase_name,
        }
      : null,

    steps: Array.from(stepMap.values()),
  };
};