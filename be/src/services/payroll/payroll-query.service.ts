import { db } from "../../config/db.js";
import { PoolClient } from "pg";
import dayjs from "dayjs";

export const getStaffSalaryConfig = async (
  staff_id: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT
      ssc.*,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sa.id,
            'name', sa.name,
            'amount_type', sa.amount_type,
            'amount_value', sa.amount_value,
            'apply_type', sa.apply_type,
            'note', sa.note
          )
        ) FILTER (WHERE sa.id IS NOT NULL),
        '[]'
      ) AS allowances,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sd.id,
            'name', sd.name,
            'amount_type', sd.amount_type,
            'amount_value', sd.amount_value,
            'unit_type', sd.unit_type,
            'condition_text', sd.condition_text,
            'note', sd.note
          )
        ) FILTER (WHERE sd.id IS NOT NULL),
        '[]'
      ) AS deductions

    FROM staff_salary_configs ssc

    LEFT JOIN staff_allowances ssa
      ON ssa.staff_id = ssc.staff_id

    LEFT JOIN salary_allowances sa
      ON sa.id = ssa.allowance_id

    LEFT JOIN staff_deductions ssd
      ON ssd.staff_id = ssc.staff_id

    LEFT JOIN salary_deductions sd
      ON sd.id = ssd.deduction_id

    WHERE ssc.staff_id = $1
      AND ssc.is_active = true

    GROUP BY ssc.id
    `,
    [staff_id],
  );

  return result.rows[0];
};

export const getStaffTimekeepingSummary = async (
  staff_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT
  COUNT(DISTINCT tk.work_date)
    AS attendance_days,

  COUNT(DISTINCT tk.work_date)
    FILTER (
      WHERE td.is_full_work = true
    ) AS full_work_days,

  COALESCE(SUM(td.work_minutes), 0)
    AS total_work_minutes,

  COALESCE(SUM(td.ot_minutes), 0)
    AS total_ot_minutes,

  ROUND(
    COALESCE(SUM(td.work_minutes), 0) / 60.0,
    2
  ) AS total_work_hours,

  ROUND(
    COALESCE(SUM(td.ot_minutes), 0) / 60.0,
    2
  ) AS total_ot_hours,

      ROUND(
        COALESCE(
          SUM(
            EXTRACT(
              EPOCH FROM (
                sh.end_time::time
                - sh.start_time::time
              )
            ) / 3600
          ),
          0
        ),
        2
      ) AS standard_work_hours
    
    FROM staffs s

    INNER JOIN users u
      ON u.id = s.user_id

    INNER JOIN timekeeping_daily tk
      ON tk.user_id = s.user_id

    INNER JOIN timekeeping_details td
      ON td.timekeeping_id = tk.id

    INNER JOIN shifts sh
      ON sh.id = tk.shift_id

    WHERE s.user_id = $1
      AND tk.status = 'COMPLETED'
      AND EXTRACT(MONTH FROM tk.work_date) = $2
      AND EXTRACT(YEAR FROM tk.work_date) = $3
    `,
    
    [staff_id, month, year],
  );
  return result.rows[0];
};

export const getExistingPayroll = async (
  staff_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT *
    FROM payrolls
    WHERE staff_id = $1
      AND month = $2
      AND year = $3
    `,
    [staff_id, month, year],
  );

  return result.rows[0];
};

// ======================================================
// GET PERSONAL REVENUE
// TODO: IMPLEMENT LATER
// ======================================================

export const getPersonalRevenue = async (
  staff_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT
      COALESCE(
        SUM(pi.final_amount),
        0
      ) AS total_revenue

    FROM customer_service_profiles csp

    INNER JOIN payment_items pi
      ON pi.profile_id = csp.id

    INNER JOIN payments p
      ON p.id = pi.payment_id

    WHERE csp.doctor_id = $1
      AND p.status IN ('paid', 'partial_paid')
      AND EXTRACT(MONTH FROM p.created_at) = $2
      AND EXTRACT(YEAR FROM p.created_at) = $3
    `,
    [staff_id, month, year],
  );

  return result.rows[0];
};

export const getBranchRevenue = async (
  branch_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  return {
    total_revenue: 0,
  };
};

// ======================================================
// GET STAFF ALLOWANCES
// ======================================================

export const getStaffAllowances = async (
  staff_id: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT
      sa.id,
      sa.name,
      UPPER(sa.amount_type) AS amount_type,
      sa.amount_value,
      UPPER(sa.apply_type) AS apply_type,

      sa.note

    FROM staff_allowances ssa

    INNER JOIN salary_allowances sa
      ON sa.id = ssa.allowance_id

    WHERE ssa.staff_id = $1

    ORDER BY sa.id ASC
    `,
    [staff_id],
  );

  return result.rows;
};

export const getStaffDeductions = async (
  staff_id: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT
      sd.id,
      sd.name,
      UPPER(sd.amount_type) AS amount_type,
      sd.amount_value,
      UPPER(sd.unit_type) AS unit_type,
      sd.condition_text,
      sd.note

    FROM staff_deductions ssd

    INNER JOIN salary_deductions sd
      ON sd.id = ssd.deduction_id

    WHERE ssd.staff_id = $1

    ORDER BY sd.id ASC
    `,
    [staff_id],
  );

  return result.rows;
};

export const getPayrollByStaffMonthYear = async (
  staff_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT *
    FROM payrolls
    WHERE staff_id = $1
      AND month = $2
      AND year = $3
    LIMIT 1
    `,
    [staff_id, month, year],
  );

  return result.rows[0];
};

export const getStaffAttendanceSummary = async (
  staff_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  const data = await getStaffTimekeepingSummary(staff_id, month, year, client);

  return {
    attendance_days: Number(data?.attendance_days || 0),

    full_work_days: Number(data?.full_work_days || 0),

    actual_work_hours: Number(data?.total_work_hours || 0),

    total_ot_hours: Number(data?.total_ot_hours || 0),

    total_work_minutes: Number(data?.total_work_minutes || 0),

    total_ot_minutes: Number(data?.total_ot_minutes || 0),
  };
};

export const getStandardWorkDaysOfMonth = (month: number, year: number) => {
  const totalDays = new Date(year, month, 0).getDate();

  let sundayCount = 0;

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);

    if (date.getDay() === 0) {
      sundayCount++;
    }
  }

  return totalDays - sundayCount;
};

export const getPayrolls = async (
  filters?: {
    keyword?: string;

    employee_type?: string;

    salary_unit?: string;

    month?: number;

    year?: number;
  },

  client?: PoolClient,
) => {
  const executor = client || db;

  const {
    keyword = "",
    employee_type,
    salary_unit,
    month,
    year,
  } = filters || {};

  const conditions: string[] = [];

  const values: any[] = [];

  // SEARCH
  if (keyword) {
    values.push(`%${keyword}%`);

    conditions.push(`
      (
        u.name ILIKE $${values.length}
        OR u.phone ILIKE $${values.length}
        OR u.email ILIKE $${values.length}
      )
    `);
  }

  // EMPLOYEE TYPE
  if (employee_type) {
    values.push(employee_type);

    conditions.push(`
      p.employee_type = $${values.length}
    `);
  }

  // SALARY UNIT
  if (salary_unit) {
    values.push(salary_unit);

    conditions.push(`
      p.salary_unit = $${values.length}
    `);
  }

  // MONTH
  if (month) {
    values.push(month);

    conditions.push(`
      p.month = $${values.length}
    `);
  }

  // YEAR
  if (year) {
    values.push(year);

    conditions.push(`
      p.year = $${values.length}
    `);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await executor.query(
    `
    SELECT
      p.*,

      s.user_id AS staff_user_id,

      u.name as staff_name,

      u.phone,

      u.email,

      positions.name AS position_name

    FROM payrolls p

    INNER JOIN staffs s
      ON s.user_id = p.staff_id

    INNER JOIN users u
      ON u.id = s.user_id

    LEFT JOIN positions
      ON positions.id = s.position_id

    ${whereClause}

    ORDER BY p.net_salary DESC
    `,
    values,
  );

  return result.rows;
};

export const getDoctorCommissionRevenue = async (
  staff_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT
      COALESCE(
        SUM(
          CASE
            WHEN p.final_amount <= 0 THEN 0

            ELSE
              (
                pi.final_amount
                / p.final_amount
              ) * p.paid_amount
          END
        ),
        0
      ) AS actual_revenue

    FROM customer_service_profiles csp

    INNER JOIN payment_items pi
      ON pi.profile_id = csp.id

    INNER JOIN payments p
      ON p.id = pi.payment_id

    WHERE csp.doctor_id = $1

      AND p.status IN ('partial_paid', 'paid')

      AND EXTRACT(MONTH FROM p.created_at) = $2

      AND EXTRACT(YEAR FROM p.created_at) = $3
    `,
    [staff_id, month, year],
  );

  return {
    actual_revenue: Number(
      result.rows[0]?.actual_revenue || 0,
    ),
  };
};

export const getTechnicianWorkSummary = async (
  staff_id: number,
  month: number,
  year: number,
  client?: PoolClient,
) => {
  const executor = client || db;

const result = await executor.query(
  `
  SELECT
    COUNT(DISTINCT css.id)
      AS total_sessions,

    COALESCE(
      SUM(
        CASE
          -- STEP HOÀN THÀNH
          WHEN sst.status = 'completed'
          THEN COALESCE(
            sst.estimated_duration_minutes,
            0
          )

          -- STEP CHƯA HOÀN THÀNH
          ELSE COALESCE(
            sst.actual_duration_seconds,
            0
          ) / 60.0
        END
      ),
      0
    ) AS total_work_minutes

  FROM customer_service_sessions css

  INNER JOIN session_step_trackings sst
    ON sst.session_id = css.id

  WHERE
    sst.technician_id = $1

    AND css.status != 'cancelled'

    AND EXTRACT(
      MONTH FROM css.service_date
    ) = $2

    AND EXTRACT(
      YEAR FROM css.service_date
    ) = $3
  `,
  [staff_id, month, year],
);

const totalMinutes = Number(
  result.rows[0]?.total_work_minutes || 0,
);

const totalHours = totalMinutes / 60;

return {
  total_sessions: Number(
    result.rows[0]?.total_sessions || 0,
  ),

  total_duration_seconds: Math.round(
    totalMinutes * 60,
  ),

  total_work_minutes: Number(
    totalMinutes.toFixed(2),
  ),

  total_work_hours: Number(
    totalHours.toFixed(2),
  ),
};
};

export const getAllActiveStaffs = async (
  client?: PoolClient,
) => {
  const executor = client || db;

  const result = await executor.query(
    `
    SELECT
      s.user_id as id
    FROM staffs s
    WHERE s.is_active = true
    ORDER BY s.id ASC
    `,
  );

  return result.rows;
};