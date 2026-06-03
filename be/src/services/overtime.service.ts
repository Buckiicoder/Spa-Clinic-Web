import { db } from "../config/db.js";

export const getOvertimeRequests = async (filters?: {
  keyword?: string;

  status?: string;

  work_date?: string;

  from_date?: string;

  to_date?: string;

  user_id?: number;
}) => {
  const {
    keyword = "",

    status,

    work_date,

    from_date,

    to_date,

    user_id,
  } = filters || {};

  const conditions: string[] = [];

  const values: any[] = [];

  // ====================================================
  // KEYWORD
  // ====================================================

  if (keyword) {
    values.push(`%${keyword}%`);

    conditions.push(`
      (
        u.name ILIKE $${values.length}
        OR u.email ILIKE $${values.length}
      )
    `);
  }

  // ====================================================
  // STATUS
  // ====================================================

  if (status) {
    values.push(status);

    conditions.push(`
      otr.status = $${values.length}
    `);
  }

  // ====================================================
  // WORK DATE
  // ====================================================

  if (work_date) {
    values.push(work_date);

    conditions.push(`
      otr.work_date = $${values.length}
    `);
  }

  // ====================================================
  // FROM DATE
  // ====================================================

  if (from_date) {
    values.push(from_date);

    conditions.push(`
      otr.work_date >= $${values.length}
    `);
  }

  // ====================================================
  // TO DATE
  // ====================================================

  if (to_date) {
    values.push(to_date);

    conditions.push(`
      otr.work_date <= $${values.length}
    `);
  }

  // ====================================================
  // USER
  // ====================================================

  if (user_id) {
    values.push(user_id);

    conditions.push(`
      otr.user_id = $${values.length}
    `);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query(
    `
    SELECT
      otr.*,

      u.name,
      u.email,
      u.avatar,

      approver.name AS approved_by_name,

      s.name AS shift_name,

      tk.check_in_time,
      tk.check_out_time,

      td.work_minutes,
      td.ot_minutes

    FROM overtime_requests otr

    INNER JOIN users u
      ON u.id = otr.user_id

    LEFT JOIN users approver
      ON approver.id = otr.approved_by

    LEFT JOIN timekeeping_daily tk
      ON tk.id = otr.timekeeping_id

    LEFT JOIN timekeeping_details td
      ON td.timekeeping_id = tk.id

    LEFT JOIN shifts s
      ON s.id = tk.shift_id

    ${whereClause}

    ORDER BY
      otr.created_at DESC
  `,
    values,
  );

  return result.rows;
};

export const getOvertimeRequestDetail = async (id: number) => {
  const result = await db.query(
    `
    SELECT
      otr.*,

      u.name,
      u.email,
      u.avatar,

      approver.name AS approved_by_name,

      s.name AS shift_name,

      tk.check_in_time,
      tk.check_out_time,

      td.work_minutes,
      td.ot_minutes

    FROM overtime_requests otr

    INNER JOIN users u
      ON u.id = otr.user_id

    LEFT JOIN users approver
      ON approver.id = otr.approved_by

    LEFT JOIN timekeeping_daily tk
      ON tk.id = otr.timekeeping_id

    LEFT JOIN timekeeping_details td
      ON td.timekeeping_id = tk.id

    LEFT JOIN shifts s
      ON s.id = tk.shift_id

    WHERE otr.id = $1

    LIMIT 1
  `,
    [id],
  );

  return result.rows[0];
};

export const getMyOvertimeRequests = async (userId: number) => {
  const result = await db.query(
    `
    SELECT
      otr.*,

      approver.name AS approved_by_name,

      s.name AS shift_name

    FROM overtime_requests otr

    LEFT JOIN users approver
      ON approver.id = otr.approved_by

    LEFT JOIN timekeeping_daily tk
      ON tk.id = otr.timekeeping_id

    LEFT JOIN shifts s
      ON s.id = tk.shift_id

    WHERE otr.user_id = $1

    ORDER BY
      otr.created_at DESC
  `,
    [userId],
  );

  return result.rows;
};

export const createOvertimeRequest = async (data: {
  user_id: number;

  timekeeping_id: number;

  work_date: string;

  requested_minutes: number;

  requested_start_time?: string | null;

  requested_end_time?: string | null;

  reason?: string | null;
}) => {
  const {
    user_id,
    timekeeping_id,
    work_date,
    requested_minutes,

    requested_start_time,
    requested_end_time,

    reason,
  } = data;

  // ====================================================
  // CHECK EXISTING REQUEST
  // ====================================================

  const existing = await db.query(
    `
    SELECT id
    FROM overtime_requests
    WHERE
      timekeeping_id = $1
      AND status IN ('PENDING', 'APPROVED')
    LIMIT 1
  `,
    [timekeeping_id],
  );

  if (existing.rows.length > 0) {
    throw new Error("Ca làm này đã có yêu cầu OT");
  }

  // ====================================================
  // CREATE
  // ====================================================
  const normalizeDate = (value: string) => {
    return value.slice(0, 10);
  };

  const normalizedDate = normalizeDate(work_date);

  const startTimestamp = requested_start_time
    ? `${normalizedDate} ${requested_start_time}:00`
    : null;

  const endTimestamp = requested_end_time
    ? `${normalizedDate} ${requested_end_time}:00`
    : null;

  const result = await db.query(
    `
  INSERT INTO overtime_requests
  (
    user_id,
    timekeeping_id,
    work_date,

    requested_minutes,

    requested_start_time,
    requested_end_time,

    reason,

    status
  )
  VALUES
  (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    'PENDING'
  )
  RETURNING *
`,
    [
      user_id,
      timekeeping_id,
      work_date,

      requested_minutes,

      startTimestamp,
      endTimestamp,

      reason || null,
    ],
  );

  return result.rows[0];
};

export const approveOvertimeRequest = async (
  id: number,

  approvedBy: number,

  approvedMinutes: number,
) => {
  // ====================================================
  // GET REQUEST
  // ====================================================

  const requestResult = await db.query(
    `
    SELECT *
    FROM overtime_requests
    WHERE id = $1
    LIMIT 1
  `,
    [id],
  );

  const request = requestResult.rows[0];

  if (!request) {
    throw new Error("Không tìm thấy yêu cầu OT");
  }

  if (request.status !== "PENDING") {
    throw new Error("Yêu cầu OT đã được xử lý");
  }

  // ====================================================
  // UPDATE REQUEST
  // ====================================================

  const result = await db.query(
    `
    UPDATE overtime_requests
    SET
      status = 'APPROVED',

      approved_minutes = $1,

      approved_by = $2,

      approved_at = CURRENT_TIMESTAMP

    WHERE id = $3

    RETURNING *
  `,
    [approvedMinutes, approvedBy, id],
  );

  // ====================================================
  // UPDATE TIMEKEEPING DETAIL
  // ====================================================

  await db.query(
    `
    UPDATE timekeeping_details
    SET
      ot_minutes = $1
    WHERE timekeeping_id = $2
  `,
    [approvedMinutes, request.timekeeping_id],
  );

  return result.rows[0];
};

export const rejectOvertimeRequest = async (
  id: number,

  approvedBy: number,

  rejectReason?: string | null,
) => {
  const result = await db.query(
    `
    UPDATE overtime_requests
    SET
      status = 'REJECTED',

      approved_by = $1,

      approved_at = CURRENT_TIMESTAMP,

      reject_reason = $2

    WHERE id = $3

    RETURNING *
  `,
    [approvedBy, rejectReason || null, id],
  );

  if (!result.rows[0]) {
    throw new Error("Không tìm thấy yêu cầu OT");
  }

  return result.rows[0];
};

export const cancelOvertimeRequest = async (
  id: number,

  userId: number,
) => {
  const result = await db.query(
    `
    UPDATE overtime_requests
    SET
      status = 'CANCELLED'
    WHERE
      id = $1
      AND user_id = $2
      AND status = 'PENDING'
    RETURNING *
  `,
    [id, userId],
  );

  if (!result.rows[0]) {
    throw new Error("Không thể hủy yêu cầu OT");
  }

  return result.rows[0];
};

export const deleteOvertimeRequest = async (id: number) => {
  const result = await db.query(
    `
    DELETE FROM overtime_requests
    WHERE id = $1
    RETURNING *
  `,
    [id],
  );

  if (!result.rows[0]) {
    throw new Error("Không tìm thấy yêu cầu OT");
  }

  return result.rows[0];
};

export const syncApprovedOtToTimekeeping = async (timekeepingId: number) => {
  const otResult = await db.query(
    `
      SELECT
        COALESCE(
          SUM(approved_minutes),
          0
        ) AS total_ot
      FROM overtime_requests
      WHERE
        timekeeping_id = $1
        AND status = 'APPROVED'
    `,
    [timekeepingId],
  );

  const totalOt = Number(otResult.rows[0]?.total_ot || 0);

  // UPDATE DETAIL
  const result = await db.query(
    `
      UPDATE timekeeping_details
      SET
        ot_minutes = $1
      WHERE timekeeping_id = $2
      RETURNING *
    `,
    [totalOt, timekeepingId],
  );

  return result.rows[0];
};

export const getTimekeepingDailyView = async (
  date: string, // YYYY-MM-DD
  status?: string,
) => {
  const params: any[] = [date];

  let statusCondition = "";

  if (status && status.trim() !== "") {
    params.push(status);
    statusCondition = `AND tk.status = $${params.length}`;
  }
  const result = await db.query(
    `
    SELECT 
      tk.id,
      tk.user_id,
      u.name as user_name,
      st.employee_type,
      tk.shift_id,
      s.name as shift_name,
      s.start_time,
      s.end_time,

      tk.status,
      tk.check_in_time,
      tk.check_out_time,

      td.ot_minutes,
      td.work_minutes,

      CASE
  WHEN otr.id IS NOT NULL THEN
    json_build_object(
      'id', otr.id,
      'work_date', otr.work_date,
      'status', otr.status,
      'requested_minutes', otr.requested_minutes,
      'approved_minutes', otr.approved_minutes,
      'requested_start_time', otr.requested_start_time,
      'requested_end_time', otr.requested_end_time,
      'reason', otr.reason,
      'created_at', otr.created_at
    )
  ELSE NULL
END as overtime_request

    FROM timekeeping_daily tk
    JOIN users u ON u.id = tk.user_id
    JOIN staffs st ON st.user_id = u.id
    JOIN shifts s ON s.id = tk.shift_id
    LEFT JOIN timekeeping_details td ON td.timekeeping_id = tk.id
    LEFT JOIN overtime_requests otr
      ON otr.timekeeping_id = tk.id
      AND otr.status = 'PENDING'

    WHERE tk.work_date = $1
    ${statusCondition}

    ORDER BY tk.shift_id ASC, u.name ASC
    `,
    params,
  );

  return result.rows;
};

export const getApprovedOtRequestByTimekeeping = async (
  timekeepingId: number,
) => {
  const result = await db.query(
    `
    SELECT *
    FROM overtime_requests
    WHERE
      timekeeping_id = $1
      AND status = 'APPROVED'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [timekeepingId],
  );

  return result.rows[0] || null;
};

export const completeApprovedOt = async (
  id: number,
  data: {
    actual_ot_minutes: number;
    approved_end_time?: string | null;
    shift_end_time?: string | null;
    is_locked?: boolean;
  },
) => {
  const result = await db.query(
    `
    UPDATE overtime_requests
    SET
      actual_ot_minutes = $1,

      approved_end_time = COALESCE($2, approved_end_time),

      shift_end_time = COALESCE($3, shift_end_time),

      is_locked = COALESCE($4, is_locked)

    WHERE id = $5

    RETURNING *
    `,
    [
      data.actual_ot_minutes,

      data.approved_end_time || null,

      data.shift_end_time || null,

      data.is_locked ?? true,

      id,
    ],
  );

  return result.rows[0];
};
