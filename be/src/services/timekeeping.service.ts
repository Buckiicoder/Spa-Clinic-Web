import { db } from "../config/db.js";

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

//
// 🔹 GET AVAILABLE SCHEDULE (lấy lịch mở cho FE đăng ký)
//

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
//

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
    SELECT tk.*, s.name as shift_name, s.start_time, s.end_time, u.name, st.employee_type
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

export const updateTimekeepingStatus = async (id: number, status: string) => {
  const result = await db.query(
    `
    UPDATE timekeeping_daily
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [status, id],
  );

  return result.rows[0];
};

// 🔹 DELETE (hủy đăng ký ca)
export const deleteTimekeeping = async (id: number) => {
  await db.query(`DELETE FROM timekeeping_daily WHERE id = $1`, [id]);
};

//
// 🔹 TIMEKEEPING DETAILS
//

// 🔹 GET detail
export const getTimekeepingDetail = async (timekeeping_id: number) => {
  const result = await db.query(
    `
    SELECT * FROM timekeeping_details
    WHERE timekeeping_id = $1
    `,
    [timekeeping_id],
  );

  return result.rows[0];
};

// 🔹 CREATE / UPDATE detail
export const upsertTimekeepingDetail = async (data: TimekeepingDetailInput) => {
  const {
    timekeeping_id,
    work_minutes,
    ot_minutes,
    break_minutes,
    check_in_lat,
    check_in_lng,
    check_out_lat,
    check_out_lng,
    is_full_work,
  } = data;

  const result = await db.query(
    `
    INSERT INTO timekeeping_details
    (timekeeping_id, work_minutes, ot_minutes, break_minutes,
     check_in_lat, check_in_lng, check_out_lat, check_out_lng, is_full_work)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (timekeeping_id)
    DO UPDATE SET
      work_minutes = COALESCE($2, timekeeping_details.work_minutes),
      ot_minutes = COALESCE($3, timekeeping_details.ot_minutes),
      break_minutes = COALESCE($4, timekeeping_details.break_minutes),
      check_in_lat = COALESCE($5, timekeeping_details.check_in_lat),
      check_in_lng = COALESCE($6, timekeeping_details.check_in_lng),
      check_out_lat = COALESCE($7, timekeeping_details.check_out_lat),
      check_out_lng = COALESCE($8, timekeeping_details.check_out_lng),
      is_full_work = COALESCE($9, timekeeping_details.is_full_work)
    RETURNING *
    `,
    [
      timekeeping_id,
      work_minutes,
      ot_minutes,
      break_minutes,
      check_in_lat,
      check_in_lng,
      check_out_lat,
      check_out_lng,
      is_full_work,
    ],
  );

  return result.rows[0];
};
