import { db } from "../../config/db.js";

export const getAllStaffSalaries = async () => {
  const result = await db.query(`
    SELECT
      ss.*,

      st.name as template_name,

      p.name as position_name,

      u.name as staff_name

    FROM staff_salary_configs ss

    JOIN staffs s
      ON s.user_id = ss.staff_id

    JOIN users u
      ON u.id = s.user_id

    LEFT JOIN positions p
      ON p.id = s.position_id

    LEFT JOIN salary_templates st
      ON st.id = ss.template_id

    ORDER BY ss.created_at DESC
  `);

  return result.rows;
};

export const getStaffSalaryDetail = async (staff_id: number) => {
  const result = await db.query(
    `
    SELECT
      ss.*,

      st.name as template_name,
      p.name as position_name,
      u.name as staff_name,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sa.id,
            'name', sa.name,
            'amount_type', sa.amount_type,
            'amount_value', sa.amount_value,
            'apply_type', sa.apply_type
          )
        ) FILTER (WHERE sa.id IS NOT NULL),
        '[]'
      ) as allowances,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sd.id,
            'name', sd.name,
            'amount_type', sd.amount_type,
            'amount_value', sd.amount_value,
            'unit_type', sd.unit_type,
            'condition_text', sd.condition_text
          )
        ) FILTER (WHERE sd.id IS NOT NULL),
        '[]'
      ) as deductions

    FROM staff_salary_configs ss

    JOIN staffs s
      ON s.user_id = ss.staff_id

    JOIN users u
      ON u.id = s.user_id

    LEFT JOIN positions p
      ON p.id = s.position_id

    LEFT JOIN salary_templates st
      ON st.id = ss.template_id

    LEFT JOIN staff_allowances ssa
      ON ssa.staff_id = ss.staff_id

    LEFT JOIN salary_allowances sa
      ON sa.id = ssa.allowance_id

    LEFT JOIN staff_deductions ssd
      ON ssd.staff_id = ss.staff_id

    LEFT JOIN salary_deductions sd
      ON sd.id = ssd.deduction_id

    WHERE ss.staff_id = $1

    GROUP BY
      ss.id,
      st.id,
      p.id,
      u.id
    `,
    [staff_id],
  );

  return result.rows[0];
};

export const assignStaffSalaryWithRelations = async (data: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      staff_id,
      allowance_ids = [],
      deduction_ids = [],
      ...salaryData
    } = data;

    // 1. delete old config
    await client.query(
      `DELETE FROM staff_salary_configs WHERE staff_id = $1`,
      [staff_id],
    );

    // 2. insert salary config
    const result = await client.query(
      `
      INSERT INTO staff_salary_configs
      (
        staff_id,
        template_id,
        employee_type,
        pay_period,
        salary_amount,
        salary_unit,
        has_commission,
        commission_revenue_type,
        commission_calculation_type,
        commission_value,
        commission_unit,
        minimum_revenue_target,
        effective_from,
        effective_to,
        note,
        is_active
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
      RETURNING *
      `,
      [
        staff_id,
        salaryData.template_id,
        salaryData.employee_type,
        salaryData.pay_period,
        salaryData.salary_amount,
        salaryData.salary_unit,
        salaryData.has_commission,
        salaryData.commission_revenue_type,
        salaryData.commission_calculation_type,
        salaryData.commission_value,
        salaryData.commission_unit,
        salaryData.minimum_revenue_target,
        salaryData.effective_from,
        salaryData.effective_to,
        salaryData.note,
        salaryData.is_active,
      ],
    );

    // 3. batch delete old relations (OPTIMIZED)
    await client.query(`DELETE FROM staff_allowances WHERE staff_id = $1`, [
      staff_id,
    ]);

    await client.query(`DELETE FROM staff_deductions WHERE staff_id = $1`, [
      staff_id,
    ]);

    // 4. batch insert allowances
    if (allowance_ids.length > 0) {
      const allowanceValues = allowance_ids
        .map((_: any, i: number) => `($1, $${i + 2})`)
        .join(",");

      await client.query(
        `
        INSERT INTO staff_allowances (staff_id, allowance_id)
        VALUES ${allowanceValues}
        `,
        [staff_id, ...allowance_ids],
      );
    }

    // 5. batch insert deductions
    if (deduction_ids.length > 0) {
      const deductionValues = deduction_ids
        .map((_: any, i: number) => `($1, $${i + 2})`)
        .join(",");

      await client.query(
        `
        INSERT INTO staff_deductions (staff_id, deduction_id)
        VALUES ${deductionValues}
        `,
        [staff_id, ...deduction_ids],
      );
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};