import { db } from "../config/db.js";
import { getApprovedOtRequestByTimekeeping } from "./overtime.service.js";

export type TimekeepingInput = {
  user_id: number;
  shift_id: number;
  work_date: string;
  status?: string;
};

export type TimekeepingDetailInput = {
  timekeeping_id: number;
  work_minutes?: number;
  ot_minutes?: number;
  break_minutes?: number;
  check_in_lat?: number;
  check_in_lng?: number;
  check_out_lat?: number;
  check_out_lng?: number;
  is_full_work?: boolean;
};

// 🔹 GET AVAILABLE SCHEDULE (lấy lịch mở cho FE đăng ký)

export const getAvailableSchedule = async (month: number, year: number) => {
  const result = await db.query(
    `
    SELECT 
      sp.id as period_id,
      sp.month,
      sp.year,
      sp.status,
      sp.open_from,
      sp.open_to,

      sd.id as schedule_day_id,
      sd.work_date,
      sd.shift_id,
      sd.employee_type,
      sd.max_employee,

      s.name as shift_name,
      s.start_time,
      s.end_time

    FROM schedule_periods sp
    JOIN schedule_days sd ON sd.period_id = sp.id
    JOIN shifts s ON s.id = sd.shift_id

    WHERE sp.month = $1 AND sp.year = $2
    ORDER BY sd.work_date ASC
    `,
    [month, year],
  );

  return result.rows;
};

//
// 🔹 TIMEKEEPING DAILY

// 🔹 GET theo user + tháng
export const getTimekeepingByUser = async (
  month: number,
  year: number,
  user_id?: number,
) => {
  const params: any[] = [month, year];

  let userCondition = "";

  if (user_id) {
    params.push(user_id);
    userCondition = `AND tk.user_id = $3`;
  }

  const result = await db.query(
    `
    SELECT 
      tk.id,
      tk.user_id,
      tk.shift_id,

      TO_CHAR(tk.work_date, 'YYYY-MM-DD') AS work_date,

      tk.check_in_time,
      tk.check_out_time,
      tk.break_start_time,
      tk.break_end_time,
      tk.created_at,
      tk.reject_reason,
      tk.status,
    s.name as shift_name, s.start_time, s.end_time, u.name, st.employee_type

    FROM timekeeping_daily tk
    JOIN shifts s ON s.id = tk.shift_id
    JOIN users u ON u.id = tk.user_id
    JOIN staffs st ON st.user_id = u.id
    WHERE EXTRACT(MONTH FROM tk.work_date) = $1
      AND EXTRACT(YEAR FROM tk.work_date) = $2
      ${userCondition}
    ORDER BY tk.work_date ASC, tk.shift_id ASC
    `,
    params,
  );

  return result.rows;
};

export const getTimekeepingById = async (id: number) => {
  const result = await db.query(
    `
    SELECT
      tk.*,
      s.name AS shift_name,
      s.start_time,
      s.end_time,
      td.work_minutes,
      td.break_minutes,
      td.ot_minutes,
      td.check_in_lat,
      td.check_in_lng,
      td.check_out_lat,
      td.check_out_lng,
      td.is_full_work
    FROM timekeeping_daily tk
    JOIN shifts s ON s.id = tk.shift_id
    LEFT JOIN timekeeping_details td ON td.timekeeping_id = tk.id
    WHERE tk.id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const createTimekeepingBulk = async (records: TimekeepingInput[]) => {
  if (!records.length) return [];

  const values: any[] = [];
  const placeholders: string[] = [];

  records.forEach((r, index) => {
    const i = index * 4;

    placeholders.push(`($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`);

    values.push(
      Number(r.user_id),
      Number(r.shift_id),
      r.work_date,
      r.status || "SCHEDULED",
    );
  });

  console.log("SQL VALUES", values);

  const result = await db.query(
    `
    INSERT INTO timekeeping_daily
      (user_id, shift_id, work_date, status)
    VALUES
      ${placeholders.join(",")}
    ON CONFLICT (user_id, work_date, shift_id)
    DO UPDATE SET
      status = EXCLUDED.status,
      shift_id = EXCLUDED.shift_id
    RETURNING *
    `,
    values,
  );

  return result.rows;
};

// 🔹 UPDATE (checkin / checkout / status)
export const updateTimekeeping = async (
  id: number,
  data: Partial<{
    check_in_time: string;
    check_out_time: string;
    break_start_time: string;
    break_end_time: string;
    status: string;
    reject_reason: string;
  }>,
) => {
  const {
    check_in_time,
    check_out_time,
    break_start_time,
    break_end_time,
    status,
    reject_reason,
  } = data;

  const result = await db.query(
    `
    UPDATE timekeeping_daily
    SET 
      check_in_time = COALESCE($1, check_in_time),
      check_out_time = COALESCE($2, check_out_time),
      break_start_time = COALESCE($3, break_start_time),
      break_end_time = COALESCE($4, break_end_time),
      status = COALESCE($5, status),
      reject_reason = COALESCE($6, reject_reason)
    WHERE id = $7
    RETURNING *
    `,
    [
      check_in_time,
      check_out_time,
      break_start_time,
      break_end_time,
      status,
      reject_reason,
      id,
    ],
  );

  return result.rows[0];
};

export const updateTimekeepingAndReturn = async (
  id: number,
  dailyData: Partial<{
    check_in_time: string | null;
    check_out_time: string | null;
    break_start_time: string | null;
    break_end_time: string | null;
    status: string;
    reject_reason: string | null;
  }> = {},
  detailData: Partial<TimekeepingDetailInput> = {},
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // update timekeeping_daily
    const dailyResult = await client.query(
      `
      UPDATE timekeeping_daily
      SET
        check_in_time = COALESCE($1, check_in_time),
        check_out_time = COALESCE($2, check_out_time),
        break_start_time = COALESCE($3, break_start_time),
        break_end_time = COALESCE($4, break_end_time),
        status = COALESCE($5, status),
        reject_reason = COALESCE($6, reject_reason)
      WHERE id = $7
      RETURNING *
      `,
      [
        dailyData.check_in_time,
        dailyData.check_out_time,
        dailyData.break_start_time,
        dailyData.break_end_time,
        dailyData.status,
        dailyData.reject_reason,
        id,
      ],
    );

    if (!dailyResult.rows[0]) {
      throw new Error("Không tìm thấy bản ghi chấm công");
    }

    // update detail nếu có dữ liệu
    const hasDetailData = Object.values(detailData).some(
      (value) => value !== undefined,
    );
    if (hasDetailData) {
      await client.query(
        `
        INSERT INTO timekeeping_details (
          timekeeping_id,
          work_minutes,
          ot_minutes,
          break_minutes,
          check_in_lat,
          check_in_lng,
          check_out_lat,
          check_out_lng,
          is_full_work
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (timekeeping_id)
        DO UPDATE SET
          work_minutes = COALESCE(EXCLUDED.work_minutes, timekeeping_details.work_minutes),
          ot_minutes = COALESCE(EXCLUDED.ot_minutes, timekeeping_details.ot_minutes),
          break_minutes = COALESCE(EXCLUDED.break_minutes, timekeeping_details.break_minutes),
          check_in_lat = COALESCE(EXCLUDED.check_in_lat, timekeeping_details.check_in_lat),
          check_in_lng = COALESCE(EXCLUDED.check_in_lng, timekeeping_details.check_in_lng),
          check_out_lat = COALESCE(EXCLUDED.check_out_lat, timekeeping_details.check_out_lat),
          check_out_lng = COALESCE(EXCLUDED.check_out_lng, timekeeping_details.check_out_lng),
          is_full_work = COALESCE(EXCLUDED.is_full_work, timekeeping_details.is_full_work)
        `,
        [
          id,
          detailData.work_minutes ?? null,
          detailData.ot_minutes ?? null,
          detailData.break_minutes ?? null,
          detailData.check_in_lat ?? null,
          detailData.check_in_lng ?? null,
          detailData.check_out_lat ?? null,
          detailData.check_out_lng ?? null,
          detailData.is_full_work ?? null,
        ],
      );
    }

    const fullResult = await client.query(
      `
      SELECT
        tk.*,
        s.name AS shift_name,
        s.start_time,
        s.end_time,
        td.work_minutes,
        td.break_minutes,
        td.ot_minutes,
        td.check_in_lat,
        td.check_in_lng,
        td.check_out_lat,
        td.check_out_lng,
        td.is_full_work
      FROM timekeeping_daily tk
      JOIN shifts s ON s.id = tk.shift_id
      LEFT JOIN timekeeping_details td ON td.timekeeping_id = tk.id
      WHERE tk.id = $1
      `,
      [id],
    );

    await client.query("COMMIT");

    return fullResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// 🔹 DELETE (hủy đăng ký ca)
export const deleteTimekeeping = async (id: number) => {
  await db.query(`DELETE FROM timekeeping_daily WHERE id = $1`, [id]);
};

export const getTimekeepingByDate = async (
  user_id: number,
  work_date: string,
) => {
  const result = await db.query(
    `
    SELECT
      tk.id,
      tk.user_id,
      tk.shift_id,

      TO_CHAR(tk.work_date, 'YYYY-MM-DD') AS work_date,

      tk.status,
      tk.check_in_time,
      tk.check_out_time,
      tk.break_start_time,
      tk.break_end_time,

      s.name AS shift_name,
      s.start_time,
      s.end_time,

      td.work_minutes,
      td.break_minutes,
      td.ot_minutes,
      td.check_in_lat,
      td.check_in_lng,
      td.check_out_lat,
      td.check_out_lng,
      td.is_full_work,

      ot.id AS overtime_id,
      ot.status AS overtime_status,
      ot.requested_minutes,
      ot.approved_minutes,
      ot.actual_ot_minutes,
      ot.requested_start_time,
      ot.requested_end_time,
      ot.approved_start_time,
      ot.approved_end_time,
      ot.reason,
      ot.reject_reason,
      ot.is_locked

    FROM timekeeping_daily tk

    JOIN shifts s
      ON s.id = tk.shift_id

    LEFT JOIN timekeeping_details td
      ON td.timekeeping_id = tk.id

    LEFT JOIN overtime_requests ot
      ON ot.timekeeping_id = tk.id

    WHERE
      tk.user_id = $1
      AND tk.work_date = $2

    ORDER BY tk.shift_id
    `,
    [user_id, work_date],
  );

  return result.rows;
};

export const calculateCheckoutData = async (
  timekeepingId: number,
  checkoutTime: Date,
) => {
  const current = await getTimekeepingById(timekeepingId);

  if (!current) {
    throw new Error("Không tìm thấy ca làm");
  }

  const totalMinutes = Math.max(
    0,
    Math.round(
      (checkoutTime.getTime() - new Date(current.check_in_time).getTime()) /
        60000,
    ),
  );

  const totalBreakMinutes = Number(current.break_minutes || 0);

  const workedAfterBreak = Math.max(totalMinutes - totalBreakMinutes, 0);

  const workDate =
  typeof current.work_date === "string"
    ? current.work_date.split("T")[0]
    : current.work_date.toISOString().split("T")[0];

  const shiftStart = new Date(`${workDate}T${current.start_time}`);

  const shiftEnd = new Date(`${workDate}T${current.end_time}`);

  const shiftMinutes = Math.max(
    0,
    Math.round((shiftEnd.getTime() - shiftStart.getTime()) / 60000),
  );

  const approvedOt = await getApprovedOtRequestByTimekeeping(timekeepingId);

  let actualOtMinutes = 0;

  if (approvedOt && checkoutTime > shiftEnd) {
    actualOtMinutes = Math.round(
      (checkoutTime.getTime() - shiftEnd.getTime()) / 60000,
    );

    actualOtMinutes = Math.min(
      actualOtMinutes,
      Number(approvedOt.approved_minutes ?? approvedOt.requested_minutes ?? 0),
    );
  }

  const workMinutes = Math.min(workedAfterBreak, shiftMinutes);

  return {
    current,
    approvedOt,
    shiftEnd,

    workMinutes,

    breakMinutes: totalBreakMinutes,

    actualOtMinutes,

    isFullWork: workMinutes >= shiftMinutes,
  };
};

export const getNeedAutoCheckout = async () => {
  const result = await db.query(`
        SELECT
    tk.*,

    CASE
        WHEN ot.id IS NOT NULL
        THEN (
            tk.work_date::timestamp
            +
            ot.approved_end_time::time
        )

        ELSE (
            tk.work_date::timestamp
            +
            s.end_time
        )
    END AS final_checkout

FROM timekeeping_daily tk

JOIN shifts s
    ON s.id = tk.shift_id

LEFT JOIN overtime_requests ot
    ON ot.timekeeping_id = tk.id
    AND ot.status = 'APPROVED'

WHERE
    tk.check_out_time IS NULL
    AND tk.status IN ('WORKING','BREAK')

    AND NOW() >=
    (
      CASE
        WHEN ot.id IS NOT NULL
        THEN (
            tk.work_date::timestamp
            +
            ot.approved_end_time::time
        )

        ELSE (
            tk.work_date::timestamp
            +
            s.end_time
        )
      END
      + INTERVAL '1 hour'
    )
      `);

  return result.rows.filter(
    (x) =>
      new Date() >=
      new Date(new Date(x.final_checkout).getTime() + 60 * 60 * 1000),
  );
};
