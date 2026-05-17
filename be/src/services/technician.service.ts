import { db } from "../config/db.js";

export const getConsultedToday = async () => {
  const result = await db.query(`
    SELECT 

      -- booking
      b.id as booking_id,
      b.booking_code,
      b.updated_at,

      -- customer
      u.id as customer_id,
      u.name,
      u.phone,

      -- service
      s.name as service_name,

      -- package
      sp.name as package_name,

      -- profile
      p.id as profile_id,
      p.total_sessions,
      p.used_sessions,

      -- session
      ss.id as session_id,
      ss.session_no,
      ss.service_date,
      ss.status,
      ss.technician_id,

      ss.current_step_no,
      ss.started_at,
      ss.paused_at,
      ss.resumed_at,
      ss.transferred_at,

      ss.total_actual_duration_seconds,
      ss.pause_count,

      -- technician
      technician.name as technician_name,

      -- current tracking
      current_tracking.id as tracking_id,

      current_tracking.step_no
        as tracking_step_no,

      current_tracking.step_name
        as current_step_name,

      current_tracking.status
        as current_tracking_status,

      current_tracking.started_at
        as current_step_started_at,

      current_tracking.completed_at
        as current_step_completed_at,

      current_tracking.paused_at
        as current_step_paused_at,

      current_tracking.resumed_at
        as current_step_resumed_at,

      current_tracking.pause_count
        as current_step_pause_count,

      current_tracking.actual_duration_seconds
        as current_step_actual_duration,

      current_tracking.estimated_duration_minutes,

      (
        current_tracking.estimated_duration_minutes * 60
      ) as current_step_estimated_seconds,

      CASE
        WHEN current_tracking.status = 'paused'
          THEN true
        ELSE false
      END as current_step_is_paused,

      -- realtime elapsed
      CASE
        WHEN current_tracking.status = 'in_progress'
          AND current_tracking.started_at IS NOT NULL

        THEN
          current_tracking.actual_duration_seconds
          +
          EXTRACT(EPOCH FROM (
            NOW() - COALESCE(
              current_tracking.resumed_at,
              current_tracking.started_at
            )
          ))

        ELSE current_tracking.actual_duration_seconds
      END as current_step_elapsed_seconds,

      -- realtime remaining
      CASE
        WHEN current_tracking.status = 'in_progress'
          AND current_tracking.started_at IS NOT NULL

        THEN GREATEST(
          (
            current_tracking.estimated_duration_minutes * 60
          )
          -
          (
            current_tracking.actual_duration_seconds
            +
            EXTRACT(EPOCH FROM (
              NOW() - COALESCE(
                current_tracking.resumed_at,
                current_tracking.started_at
              )
            ))
          ),
          0
        )

        ELSE GREATEST(
          (
            current_tracking.estimated_duration_minutes * 60
          )
          -
          current_tracking.actual_duration_seconds,
          0
        )
      END as remaining_seconds,

      -- progress
      COALESCE(
        progress.completed_steps,
        0
      ) as completed_steps,

      COALESCE(
        progress.total_steps,
        0
      ) as total_steps,

      CASE
        WHEN COALESCE(
          progress.total_steps,
          0
        ) = 0
          THEN 0

        ELSE ROUND(
          (
            progress.completed_steps::decimal
            /
            progress.total_steps
          ) * 100,
          0
        )
      END as progress_percent

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

    -- realtime current step
    LEFT JOIN session_step_trackings current_tracking
      ON current_tracking.session_id = ss.id
      AND current_tracking.is_current_step = true

    -- progress
    LEFT JOIN (
      SELECT
        session_id,

        COUNT(*) FILTER (
          WHERE status = 'completed'
        ) as completed_steps,

        COUNT(*) as total_steps

      FROM session_step_trackings

      GROUP BY session_id
    ) progress
      ON progress.session_id = ss.id

    WHERE b.status = 'CONSULTED'

      AND DATE(ss.service_date) = CURRENT_DATE

      AND ss.status IN (
        'scheduled',
        'assigned',
        'in_progress',
        'paused',
        'transfer_pending',
        'done',
        'partial_done'
      )

    ORDER BY
      ss.service_date ASC,
      ss.started_at ASC NULLS LAST,
      ss.id DESC
  `);

  return result.rows;
};


export const getWorkingTechnicians = async () => {
  const result = await db.query(`
    SELECT 
      u.id,
      u.name,
      u.phone,

      busy_session.id as current_session_id,
      busy_session.status as current_session_status,

      busy_session.current_step_no,

      COALESCE(progress.completed_steps, 0)
        as completed_steps,

      COALESCE(progress.total_steps, 0)
        as total_steps,

      CASE
        WHEN COALESCE(progress.total_steps, 0) = 0
          THEN 0
        ELSE ROUND(
          (
            progress.completed_steps::decimal
            / progress.total_steps
          ) * 100,
          0
        )
      END as progress_percent,

      customer.name as current_customer_name,

      CASE
        WHEN busy_session.id IS NOT NULL
          THEN true
        ELSE false
      END as is_busy

    FROM users u

    JOIN timekeeping_daily t 
      ON t.user_id = u.id

    LEFT JOIN customer_service_sessions busy_session
      ON busy_session.technician_id = u.id
      AND busy_session.status IN (
        'assigned',
        'in_progress',
        'paused',
        'transfer_pending'
      )

    LEFT JOIN customer_service_profiles p
      ON p.id = busy_session.profile_id

    LEFT JOIN users customer
      ON customer.id = p.customer_id

    /**
     * 🔥 progress realtime
     */
    LEFT JOIN (
      SELECT
        session_id,

        COUNT(*) FILTER (
          WHERE status = 'completed'
        ) as completed_steps,

        COUNT(*) as total_steps

      FROM session_step_trackings

      GROUP BY session_id
    ) progress
      ON progress.session_id = busy_session.id

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

        status = CASE
          WHEN status = 'transfer_pending'
            THEN 'in_progress'
          ELSE 'assigned'
        END,

        resumed_at = CASE
          WHEN status = 'transfer_pending'
            THEN NOW()
          ELSE resumed_at
        END

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
      AND ss.status IN (
        'assigned',
        'in_progress',
        'paused',
        'transfer_pending',
        'done',
        'partial_done')

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

export const getTechnicianSessionDetail = async (sessionId: number) => {
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
    [session.package_id, session.session_no],
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

    sst.id as tracking_id,
    sst.status as tracking_status,

    sst.started_at,
    sst.completed_at,
    sst.paused_at,

    sst.actual_duration_seconds,
    sst.pause_count,

    pr.id as product_id,
    pr.name as product_name,

    tsp.quantity,
    tsp.usage_note

  FROM treatment_session_steps st

  LEFT JOIN treatment_step_products tsp
    ON tsp.step_id = st.id

  LEFT JOIN products pr
    ON pr.id = tsp.product_id

  LEFT JOIN session_step_trackings sst
    ON sst.session_id = $2
    AND sst.template_step_id = st.id

  WHERE st.session_id = $1

  ORDER BY
    st.step_no ASC,
    pr.name ASC
`,
    [template.template_session_id, sessionId],
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
        tracking_status: row.tracking_status || "pending",

        started_at: row.started_at,
        completed_at: row.completed_at,
        paused_at: row.paused_at,

        actual_duration_seconds: row.actual_duration_seconds,

        pause_count: row.pause_count,
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

  const stepsArray = Array.from(stepMap.values());

  const completedSteps = stepsArray.filter(
    (s: any) => s.tracking_status === "completed",
  ).length;

  const totalSteps = stepsArray.length;

  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return {
    ...session,

    phase: template
      ? {
          phase_id: template.phase_id,
          phase_name: template.phase_name,
        }
      : null,

    steps: stepsArray,

    progress: {
      current_step_no: session.current_step_no,
      completed_steps: completedSteps,
      total_steps: totalSteps,
      progress_percent: progressPercent,
    },
  };
};
