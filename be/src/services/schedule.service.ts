import { db } from "../config/db.js";

export type SchedulePeriodInput = {
  month: number;
  year: number;
  status?: string;
  open_from?: Date | null;
  open_to?: Date | null;
};

export type ScheduleDayInput = {
  period_id: number;
  work_date: string;
  shift_id: number;
  employee_type: "FULLTIME" | "PARTTIME";
  max_employee?: number | null;
  note?: string;
};


//
// 🔹 PERIOD
//

// GET period theo tháng
export const getSchedulePeriod = async (month: number, year: number) => {
  const result = await db.query(
    `SELECT * FROM schedule_periods
     WHERE month = $1 AND year = $2`,
    [month, year]
  );

  return result.rows[0];
};

// 👉 NEW: GET by id
export const getSchedulePeriodById = async (id: number) => {
  const result = await db.query(
    `SELECT * FROM schedule_periods WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

// CREATE
export const createSchedulePeriod = async (
  data: SchedulePeriodInput
) => {
  const { month, year, status, open_from, open_to } = data;

  const result = await db.query(
    `INSERT INTO schedule_periods (month, year, status, open_from, open_to)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [month, year, status || "DRAFT", open_from, open_to]
  );

  return result.rows[0];
};

// UPDATE
export const updateSchedulePeriod = async (
  id: number,
  data: Partial<SchedulePeriodInput>
) => {
  const { status, open_from, open_to } = data;

  const result = await db.query(
    `UPDATE schedule_periods
     SET status = COALESCE($1, status),
         open_from = COALESCE($2, open_from),
         open_to = COALESCE($3, open_to)
     WHERE id = $4
     RETURNING *`,
    [status, open_from, open_to, id]
  );

  return result.rows[0];
};

// 👉 NEW: DELETE period
export const deleteSchedulePeriod = async (id: number) => {
  await db.query(
    `DELETE FROM schedule_periods WHERE id = $1`,
    [id]
  );
};

//
// 🔹 DAYS
//

// GET days
export const getScheduleDays = async (period_id: number) => {
  const result = await db.query(
    `SELECT sd.*, s.name, s.start_time, s.end_time
     FROM schedule_days sd
     JOIN shifts s ON s.id = sd.shift_id
     WHERE sd.period_id = $1
     ORDER BY sd.work_date ASC`,
    [period_id]
  );

  return result.rows;
};


// DELETE ALL days
export const deleteScheduleDaysByPeriod = async (period_id: number) => {
  await db.query(
    `DELETE FROM schedule_days WHERE period_id = $1`,
    [period_id]
  );
};

// 🔹 BULK INSERT
export const createScheduleDays = async (
  period_id: number,
  days: ScheduleDayInput[]
) => {
  if (!days.length) return [];

  const values: any[] = [];
  const placeholders: string[] = [];

  days.forEach((d, index) => {
    const i = index * 6;

    placeholders.push(
      `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6})`
    );

    values.push(
      period_id,
      d.work_date,
      d.shift_id,
      d.employee_type,
      d.max_employee ?? null,
      d.note ?? null
    );
  });

  const result = await db.query(
  `
  INSERT INTO schedule_days
    (period_id, work_date, shift_id, employee_type, max_employee, note)
  VALUES ${placeholders.join(",")}

  ON CONFLICT (period_id, work_date, shift_id, employee_type)
  DO NOTHING

  RETURNING *
  `,
  values
);

  return result.rows;
};

export const getFullSchedule = async (month: number, year: number) => {
  const period = await getSchedulePeriod(month, year);

  if (!period) return null;

  const days = await getScheduleDays(period.id);

  return {
    ...period,
    days,
  };
};

export const deleteScheduleByShift = async (
  period_id: number,
  work_date: string,
  shift_id: number,
  employee_type: "FULLTIME" | "PARTTIME"
) => {
  await db.query(
    `DELETE FROM schedule_days
     WHERE period_id = $1 
     AND work_date = $2
     AND shift_id = $3
     AND employee_type = $4`,
    [period_id, work_date, shift_id, employee_type]
  );
};

