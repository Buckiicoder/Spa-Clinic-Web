import { db } from "../config/db.js";

export const getSessionById = async (sessionId: number) => {
  const result = await db.query(
    `
    SELECT *
    FROM customer_service_sessions
    WHERE id = $1
    LIMIT 1
  `,
    [sessionId],
  );

  return result.rows[0];
};

export const updateSessionToInProgress = async (
  sessionId: number,
  beforeImageUrl?: string,
) => {
  await db.query(
    `
      UPDATE customer_service_sessions
      SET
        status = 'in_progress',

        started_at =
          COALESCE(started_at, NOW()),

        before_image_url =
          COALESCE(
            $2,
            before_image_url
          )

      WHERE id = $1
    `,
    [sessionId, beforeImageUrl],
  );
};

export const getFirstTreatmentStep = async (sessionId: number) => {
  const result = await db.query(
    `
      SELECT
        st.id,
        st.step_no,
        st.name,
        st.duration_minutes

      FROM customer_service_sessions ss

      JOIN customer_service_profiles p
        ON p.id = ss.profile_id

      JOIN treatment_sessions ts
        ON ts.package_id = p.package_id
        AND ts.session_no = ss.session_no

      JOIN treatment_session_steps st
        ON st.session_id = ts.id

      WHERE ss.id = $1

      ORDER BY st.step_no ASC
      LIMIT 1
    `,
    [sessionId],
  );

  return result.rows[0];
};

export const getTrackingByStepNo = async (
  sessionId: number,
  stepNo: number,
) => {
  const result = await db.query(
    `
      SELECT *
      FROM session_step_trackings
      WHERE session_id = $1
        AND step_no = $2
      LIMIT 1
    `,
    [sessionId, stepNo],
  );

  return result.rows[0];
};

export const createTrackingStep = async (
  sessionId: number,
  technicianId: number,
  step: any,
) => {
  const result = await db.query(
    `
    INSERT INTO session_step_trackings (
      session_id,
      template_step_id,
      step_no,
      step_name,
      technician_id,
      status,
      started_at,
      estimated_duration_minutes,
      is_current_step
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      'in_progress',
      NOW(),
      $6,
      true
    )
    RETURNING *
  `,
    [
      sessionId,
      step.id,
      step.step_no,
      step.name,
      technicianId,
      step.duration_minutes,
    ],
  );

  return result.rows[0];
};

export const completeCurrentTrackingStep = async (
  sessionId: number,
  currentStepNo: number,
) => {
  await db.query(
    `
      UPDATE session_step_trackings
      SET
        status = 'completed',
        completed_at = NOW(),
        is_current_step = false,

        actual_duration_seconds =
          actual_duration_seconds +
          EXTRACT(EPOCH FROM (
            NOW() - COALESCE(
              resumed_at,
              started_at
            )
          ))

      WHERE session_id = $1
        AND step_no = $2
    `,
    [sessionId, currentStepNo],
  );
};

export const getNextTreatmentStep = async (
  sessionId: number,
  nextStepNo: number,
) => {
  const result = await db.query(
    `
      SELECT
        st.id,
        st.step_no,
        st.name,
        st.duration_minutes

      FROM customer_service_sessions ss

      JOIN customer_service_profiles p
        ON p.id = ss.profile_id

      JOIN treatment_sessions ts
        ON ts.package_id = p.package_id
        AND ts.session_no = ss.session_no

      JOIN treatment_session_steps st
        ON st.session_id = ts.id

      WHERE ss.id = $1
        AND st.step_no = $2
    `,
    [sessionId, nextStepNo],
  );

  return result.rows[0];
};

export const updateSessionCurrentStep = async (
  sessionId: number,
  stepNo: number,
) => {
  await db.query(
    `
      UPDATE customer_service_sessions
      SET current_step_no = $2
      WHERE id = $1
    `,
    [sessionId, stepNo],
  );
};

export const updateSessionToPaused = async (sessionId: number) => {
  await db.query(
    `
      UPDATE customer_service_sessions
      SET
        status = 'paused',
        paused_at = NOW(),

        pause_expired_at =
          NOW() + interval '3 minute',

        pause_count = pause_count + 1

      WHERE id = $1
    `,
    [sessionId],
  );
};

export const pauseCurrentTrackingStep = async (sessionId: number) => {
  await db.query(
    `
      UPDATE session_step_trackings
      SET
        status = 'paused',
        paused_at = NOW(),

        actual_duration_seconds =
          actual_duration_seconds +
          EXTRACT(EPOCH FROM (
            NOW() - COALESCE(
              resumed_at,
              started_at
            )
          )),

        pause_count = pause_count + 1

      WHERE session_id = $1
        AND is_current_step = true
    `,
    [sessionId],
  );
};

export const resumeTrackingSession = async (sessionId: number) => {
  await db.query(
    `
      UPDATE customer_service_sessions
      SET
        status = 'in_progress',
        resumed_at = NOW(),
        paused_at = NULL,
          pause_expired_at = NULL
      WHERE id = $1
    `,
    [sessionId],
  );

  await db.query(
    `
      UPDATE session_step_trackings
      SET
        status = 'in_progress',
        resumed_at = NOW(),
        paused_at = NULL

      WHERE session_id = $1
        AND is_current_step = true
    `,
    [sessionId],
  );

  return true;
};

export const transferTrackingSession = async (sessionId: number) => {
  await db.query(
    `
      UPDATE customer_service_sessions
      SET
        status = 'transfer_pending',
        transferred_at = NOW(),
        technician_id = NULL
      WHERE id = $1
    `,
    [sessionId],
  );

  return true;
};

export const completeCurrentTrackingForSession = async (sessionId: number) => {
  await db.query(
    `
      UPDATE session_step_trackings
      SET
        status = 'completed',
        completed_at = NOW(),
        is_current_step = false,

        actual_duration_seconds =
          actual_duration_seconds +
          CASE
            WHEN COALESCE(
              resumed_at,
              started_at
            ) IS NOT NULL
            THEN EXTRACT(EPOCH FROM (
              NOW() - COALESCE(
                resumed_at,
                started_at
              )
            ))
            ELSE 0
          END

      WHERE session_id = $1
        AND is_current_step = true
    `,
    [sessionId],
  );
};

export const getSessionTotalDuration = async (sessionId: number) => {
  const result = await db.query(
    `
      SELECT
        COALESCE(
          SUM(actual_duration_seconds),
          0
        ) as total_duration
      FROM session_step_trackings
      WHERE session_id = $1
    `,
    [sessionId],
  );

  return result.rows[0].total_duration;
};

export const getSessionStepSummary = async (sessionId: number) => {
  const result = await db.query(
    `
      SELECT
        css.current_step_no,

        (
          SELECT COUNT(*)
          FROM treatment_session_steps tss

          JOIN treatment_sessions ts
            ON ts.id = tss.session_id

          JOIN customer_service_profiles csp
            ON csp.package_id = ts.package_id

          JOIN customer_service_sessions css2
            ON css2.profile_id = csp.id

          WHERE css2.id = $1
            AND ts.session_no = css.session_no
        ) as total_steps

      FROM customer_service_sessions css

      WHERE css.id = $1
    `,
    [sessionId],
  );

  return result.rows[0];
};

export const completeSessionRecord = async (
  sessionId: number,
  data: any,
  totalDuration: number,
) => {
  const result = await db.query(
    `
      UPDATE customer_service_sessions
      SET
        status = $1::varchar,

        completed_at = NOW(),

        skin_reaction = $2,

        after_image_url = $3,

        total_actual_duration_seconds = $4

      WHERE id = $5

      RETURNING *
    `,
    [
      data.status,
      data.skin_reaction,
      data.after_image_url,
      totalDuration,
      sessionId,
    ],
  );

  return result.rows[0];
};

export const increaseUsedSession = async (sessionId: number) => {
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
};

export const getRealtimeTrackingDetail = async (sessionId: number) => {
  const result = await db.query(
    `
    SELECT
      *
    FROM session_step_trackings
    WHERE session_id = $1
    ORDER BY step_no ASC
  `,
    [sessionId],
  );

  return result.rows;
};

export const isPauseExpired = async (sessionId: number) => {
  const result = await db.query(
    `
    SELECT
      pause_expired_at,
      NOW() > pause_expired_at AS expired
    FROM customer_service_sessions
    WHERE id = $1
    `,
    [sessionId],
  );

  return result.rows[0];
};

export const closeSessionAfterPauseTimeout = async (
  sessionId: number,
  totalDuration: number,
) => {
  const result = await db.query(
    `
      UPDATE customer_service_sessions
      SET
        status = 'partial_done',

        completed_at = NOW(),

        total_actual_duration_seconds = $2

      WHERE id = $1

      RETURNING *
      `,
    [sessionId, totalDuration],
  );

  return result.rows[0];
};
