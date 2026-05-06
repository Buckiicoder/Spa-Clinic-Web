import { db } from "../config/db.js";
import * as type from "../types/treatment.js"
// ================= CREATE =================

export const getAllPackages = async () => {
  const result = await db.query(`
    SELECT 
      sp.id,
      sp.name,
      sp.price,
      sp.total_sessions,
      sp.unit,
      sp.is_active,

      s.name as service_name

    FROM service_packages sp
    JOIN services s ON s.id = sp.service_id

    WHERE sp.is_active = true
    ORDER BY sp.id DESC
  `);

  return result.rows;
};

const createPhase = async (client: any, packageId: number, phase: any) => {
  const res = await client.query(
    `
    INSERT INTO treatment_plan_phases
    (package_id, name, from_session, to_session, objective)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id
  `,
    [
      packageId,
      phase.name,
      phase.from_session,
      phase.to_session,
      phase.objective || null,
    ],
  );

  return res.rows[0].id;
};

const createSession = async (
  client: any,
  phaseId: number,
  sessionNo: number,
  packageId: number
) => {
  const res = await client.query(
    `
    INSERT INTO treatment_sessions
    (phase_id, session_no, title, note, package_id)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id
  `,
    [
      phaseId,
      sessionNo,
      `Buổi ${sessionNo}`,
      null,
      packageId,
    ]
  );

  return res.rows[0].id;
};

const createStepProducts = async (
  client: any,
  stepId: number,
  products: type.ProductInput[],
) => {
  for (const p of products) {
    if (!p.product_id) continue;

    await client.query(
      `
      INSERT INTO treatment_step_products
      (step_id, product_id, quantity)
      VALUES ($1,$2,$3)
    `,
      [stepId, p.product_id, p.quantity || 1],
    );
  }
};

const createSteps = async (
  client: any,
  sessionId: number,
  steps: type.StepInput[],
) => {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    const stepRes = await client.query(
      `
      INSERT INTO treatment_session_steps
      (session_id, step_no, name, duration_minutes, instruction)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id
    `,
      [
        sessionId,
        i + 1,
        step.name,
        step.duration || 0,
        null,
      ],
    );

    await createStepProducts(
      client,
      stepRes.rows[0].id,
      step.products || [],
    );
  }
};

const createSessionsFromPhaseRange = async (
  client: any,
  phaseId: number,
  phase: type.PhaseInput,
  packageId: number,
) => {
  for (let i = phase.from_session; i <= phase.to_session; i++) {
    const sessionId = await createSession(client, phaseId, i, packageId);

    await createSteps(
      client,
      sessionId,
      phase.steps_template || [],
    );
  }
};

// ================= CLEAR =================

const clearOldData = async (client: any, packageId: number) => {
  await client.query(`
    DELETE FROM treatment_step_products
    WHERE step_id IN (
      SELECT st.id
      FROM treatment_session_steps st
      JOIN treatment_sessions s ON s.id = st.session_id
      JOIN treatment_plan_phases p ON p.id = s.phase_id
      WHERE p.package_id = $1
    )
  `, [packageId]);

  await client.query(`
    DELETE FROM treatment_session_steps
    WHERE session_id IN (
      SELECT s.id
      FROM treatment_sessions s
      JOIN treatment_plan_phases p ON p.id = s.phase_id
      WHERE p.package_id = $1
    )
  `, [packageId]);

  await client.query(`
    DELETE FROM treatment_sessions
    WHERE phase_id IN (
      SELECT id FROM treatment_plan_phases WHERE package_id = $1
    )
  `, [packageId]);

  await client.query(`
    DELETE FROM treatment_plan_phases
    WHERE package_id = $1
  `, [packageId]);
};

// ================= SAVE =================
export const saveTreatmentByPackage = async (
  packageId: number,
  data: type.SavePayload,
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // check package tồn tại
    const check = await client.query(
      `SELECT id FROM service_packages WHERE id = $1`,
      [packageId],
    );

    if (check.rowCount === 0) {
      throw new Error("Package không tồn tại");
    }

    // clear
    await clearOldData(client, packageId);

    // create lại
    for (const phase of data.phases) {
      const phaseId = await createPhase(client, packageId, phase);

      await createSessionsFromPhaseRange(client, phaseId, phase, packageId);
    }

    await client.query("COMMIT");

    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ================= GET DETAIL =================
export const getTreatmentByPackage = async (packageId: number) => {
  const result = await db.query(
    `
    SELECT 
      sp.id,
      sp.name,
      sp.total_sessions,

      (
        SELECT COALESCE(json_agg(
          jsonb_build_object(
            'id', ph.id,
            'name', ph.name,
            'from_session', ph.from_session,
            'to_session', ph.to_session,

            'sessions', (
              SELECT COALESCE(json_agg(
                jsonb_build_object(
                  'id', s.id,
                  'session_no', s.session_no,
                  'title', s.title,

                  'steps', (
                    SELECT COALESCE(json_agg(
                      jsonb_build_object(
                        'id', st.id,
                        'step_no', st.step_no,
                        'name', st.name,
                        'duration', st.duration_minutes,

                        'products', (
                          SELECT COALESCE(json_agg(
                            jsonb_build_object(
                              'product_id', p.id,
                              'name', p.name,
                              'quantity', tsp.quantity
                            )
                          ), '[]')
                          FROM treatment_step_products tsp
                          JOIN products p ON p.id = tsp.product_id
                          WHERE tsp.step_id = st.id
                        )
                      )
                    ), '[]')
                    FROM treatment_session_steps st
                    WHERE st.session_id = s.id
                  )
                )
              ), '[]')
              FROM treatment_sessions s
              WHERE s.phase_id = ph.id
            )
          )
        ), '[]')
        FROM treatment_plan_phases ph
        WHERE ph.package_id = sp.id
      ) as phases

    FROM service_packages sp
    WHERE sp.id = $1
  `,
    [packageId],
  );

  return result.rows[0] || null;
};

export const searchSteps = async (keyword?: string) => {
  const baseQuery = `
    SELECT DISTINCT ON (st.name)
      st.id,
      st.name,
      st.duration_minutes,
      (
        SELECT COALESCE(json_agg(
          jsonb_build_object(
            'product_id', p.id,
            'name', p.name,
            'quantity', tsp.quantity
          )
        ), '[]')
        FROM treatment_step_products tsp
        JOIN products p ON p.id = tsp.product_id
        WHERE tsp.step_id = st.id
      ) as products
    FROM treatment_session_steps st
  `;

  if (!keyword || keyword.trim() === "") {
    const res = await db.query(baseQuery + ` ORDER BY st.name LIMIT 20`);
    return res.rows;
  }

  const res = await db.query(
    baseQuery + ` WHERE LOWER(st.name) LIKE LOWER($1) ORDER BY st.name LIMIT 20`,
    [`%${keyword}%`]
  );

  return res.rows;
};

export const searchSessions = async (keyword?: string) => {
  const baseQuery = `
    SELECT 
      s.id,
      s.title,
      (
        SELECT COALESCE(json_agg(
          jsonb_build_object(
            'name', st.name,
            'duration', st.duration_minutes,
            'products', (
              SELECT COALESCE(json_agg(
                jsonb_build_object(
                  'product_id', p.id,
                  'name', p.name,
                  'quantity', tsp.quantity
                )
              ), '[]')
              FROM treatment_step_products tsp
              JOIN products p ON p.id = tsp.product_id
              WHERE tsp.step_id = st.id
            )
          )
        ), '[]')
        FROM treatment_session_steps st
        WHERE st.session_id = s.id
      ) as steps
    FROM treatment_sessions s
  `;

  if (!keyword || keyword.trim() === "") {
    const res = await db.query(baseQuery + ` ORDER BY s.id DESC LIMIT 10`);
    return res.rows;
  }

  const res = await db.query(
    baseQuery + ` WHERE LOWER(s.title) LIKE LOWER($1) ORDER BY s.title LIMIT 20`,
    [`%${keyword}%`]
  );

  return res.rows;
};
