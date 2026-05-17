import { db } from "../config/db.js";

type Service = {
  id: number;
  name: string;
  area: string | null;
  parent_id: number | null;
  description: string | null;
  duration: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ServicePackage = {
  id?: number;
  service_id?: number;
  name: string;
  price: number;
  total_sessions?: number;
  unit: string;
  duration_per_unit?: number;
  is_active?: boolean;
};

type ServiceWithPackages = Service & {
  packages: ServicePackage[];
};

type ServiceTree = Service & {
  children: ServiceTree[];
};

export const getAllServices = async (): Promise<ServiceWithPackages[]> => {
  const result = await db.query(`
    SELECT s.*, 
           COALESCE(
             json_agg(sp.*) FILTER (WHERE sp.id IS NOT NULL), 
             '[]'
           ) as packages
    FROM services s
    LEFT JOIN service_packages sp 
      ON sp.service_id = s.id AND sp.is_active = true
    WHERE s.is_active = true
    GROUP BY s.id
    ORDER BY s.id ASC
  `);

  return result.rows;
};

const buildTreeOptimized = (data: Service[]): ServiceTree[] => {
  const map = new Map<number, ServiceTree>();
  const roots: ServiceTree[] = [];

  for (const item of data) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of data) {
    const node = map.get(item.id)!;

    if (item.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(item.parent_id);
      if (parent) parent.children.push(node);
    }
  }

  return roots;
};

export const getServiceTree = async (): Promise<ServiceTree[]> => {
  const services = await getAllServices();
  return buildTreeOptimized(services);
};

export const getServicesByParent = async (parentId: number | null) => {
  const result = await db.query(
    `
    SELECT *
    FROM services
    WHERE parent_id ${parentId === null ? "IS NULL" : "= $1"}
      AND is_active = true
    ORDER BY id ASC
  `,
    parentId === null ? [] : [parentId],
  );

  return result.rows;
};

export const getServicesByArea = async (area: string) => {
  const result = await db.query(
    `
    SELECT *
    FROM services
    WHERE area = $1 AND is_active = true
    ORDER BY id ASC
  `,
    [area],
  );

  return result.rows;
};

export const getServiceDetail = async (id: number) => {
  const result = await db.query(
    `
    SELECT 
      s.*,
      COALESCE(json_agg(
        DISTINCT jsonb_build_object(
          'id', sp.id,
          'name', sp.name,
          'price', sp.price,
          'total_sessions', sp.total_sessions,
          'unit', sp.unit,
          'duration_per_unit', sp.duration_per_unit,

          'phases', (
  SELECT COALESCE(json_agg(
    jsonb_build_object(
      'id', ph.id,
      'name', ph.name,
      'from_session', ph.from_session,
      'to_session', ph.to_session,
      'objective', ph.objective,

      'sessions', (
        SELECT COALESCE(json_agg(
          jsonb_build_object(
            'id', st.id,
            'session_no', st.session_no,
            'title', st.title,

            'steps', (
              SELECT COALESCE(json_agg(
                jsonb_build_object(
                  'id', step.id,
                  'step_no', step.step_no,
                  'name', step.name,
                  'duration_minutes', step.duration_minutes,

                  'products', (
                    SELECT COALESCE(json_agg(
                      jsonb_build_object(
                        'product_id', p.id,
                        'name', p.name,
                        'quantity', tsp.quantity
                      )
                    ), '[]')

                    FROM treatment_step_products tsp

                    JOIN products p
                      ON p.id = tsp.product_id

                    WHERE tsp.step_id = step.id
                  )

                )
              ), '[]')

              FROM treatment_session_steps step

              WHERE step.session_id = st.id
            )

          )
        ), '[]')

        FROM treatment_sessions st

        WHERE st.phase_id = ph.id
      )

    )
  ), '[]')

  FROM treatment_plan_phases ph

  WHERE ph.package_id = sp.id
)
        )
      ) FILTER (WHERE sp.id IS NOT NULL), '[]') AS packages

    FROM services s
    LEFT JOIN service_packages sp 
      ON sp.service_id = s.id AND sp.is_active = true
    WHERE s.id = $1
    GROUP BY s.id
    `,
    [id],
  );

  return result.rows[0] || null;
};

export const getMiddleServices = async () => {
  const result = await db.query(`
    SELECT s.*
    FROM services s
    WHERE s.is_active = true
      AND s.parent_id IS NOT NULL
      AND s.area IS NULL
    ORDER BY s.id ASC
  `);

  return result.rows;
};

export const createService = async (data: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      area,
      parent_id,
      description,
      duration,
      is_active,
      packages = [],
    } = data;

    // 1. create service
    const serviceRes = await client.query(
      `
      INSERT INTO services (name, area, parent_id, description, duration, is_active)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [name, area, parent_id, description, duration, is_active],
    );

    const service = serviceRes.rows[0];

    // 2. create packages + treatment_plan
    for (const pkg of packages) {
      // create package (link plan_id)
      await client.query(
        `
        INSERT INTO service_packages
        (service_id, name, price, total_sessions, unit, duration_per_unit, is_active)
        VALUES ($1,$2,$3,$4,$5,$6,true)
        `,
        [
          service.id,
          pkg.name,
          pkg.price,
          pkg.total_sessions || 0,
          pkg.unit || "buổi",
          pkg.duration_per_unit || null
          // plan.id,
        ],
      );
    }

    await client.query("COMMIT");

    return await getServiceDetail(service.id);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const updateService = async (id: number, data: any) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { packages = [], ...serviceData } = data;

    // update service
    const fields = [];
    const values = [];
    let index = 1;

    const allowedFields = [
      "name",
      "area",
      "parent_id",
      "description",
      "duration",
      "is_active",
    ];

    for (const key of allowedFields) {
      if (key in serviceData) {
        fields.push(`${key} = $${index}`);
        values.push(serviceData[key]);
        index++;
      }
    }

    if (fields.length > 0) {
      values.push(id);

      await client.query(
        `
        UPDATE services
        SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${index}
      `,
        values,
      );
    }

    // xử lý packages
    const existingRes = await client.query(
      `SELECT id FROM service_packages WHERE service_id = $1`,
      [id],
    );

    const existingIds = existingRes.rows.map((r: any) => r.id);

    const incomingIds = packages.filter((p: any) => p.id).map((p: any) => p.id);

    // delete (soft)
    const toDelete = existingIds.filter(
      (eid: number) => !incomingIds.includes(eid),
    );

    if (toDelete.length > 0) {
      await client.query(
        `UPDATE service_packages SET is_active = false WHERE id = ANY($1)`,
        [toDelete],
      );
    }

    // insert/update
    for (const pkg of packages) {
      if (pkg.id) {
        await client.query(
          `
          UPDATE service_packages
          SET name=$1, price=$2, total_sessions=$3, unit=$4, duration_per_unit=$5, is_active=$6
          WHERE id=$7
        `,
          [
            pkg.name,
            pkg.price,
            pkg.total_sessions,
            pkg.unit,
            pkg.duration_per_unit,
            pkg.is_active ?? true,
            pkg.id,
          ],
        );
      } else {

        await client.query(
          `
  INSERT INTO service_packages
  (service_id, name, price, total_sessions, unit, duration_per_unit, is_active)
  VALUES ($1,$2,$3,$4,$5,$6,true)
`,
          [
            id,
            pkg.name,
            pkg.price,
            pkg.total_sessions,
            pkg.unit,
            pkg.duration_per_unit,
          ],
        );
      }
    }

    await client.query("COMMIT");

    return await getServiceDetail(id);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const deleteService = async (id: number) => {
  await db.query(
    `
    UPDATE services
    SET is_active = false
    WHERE id = $1
  `,
    [id],
  );

  return true;
};
