import { db } from "../config/db.js";

// TOP LOW STOCK PRODUCTS
export const getLowStockProducts = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      p.id,
      p.code,
      p.name,
      p.stock_quantity,
      p.sale_price,
      pc.name AS category_name,
      p.image_url

    FROM products p

    LEFT JOIN product_categories pc
      ON pc.id = p.category_id

    WHERE p.is_active = true
    AND stock_quantity < 11

    ORDER BY p.stock_quantity ASC, p.id DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

// TOP ATTENDANCE STAFF
export const getTopAttendanceStaffs = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      u.id AS user_id,
      u.name,
      s.employee_type,
      p.name AS position_name,

      COUNT(td.id) AS total_work_days,

      COALESCE(
        SUM(tkd.work_minutes),
        0
      ) AS total_work_minutes

    FROM staffs s

    INNER JOIN users u
      ON u.id = s.user_id

    LEFT JOIN positions p
      ON p.id = s.position_id

    LEFT JOIN timekeeping_daily td
      ON td.user_id = s.user_id
      AND td.status = 'COMPLETED'

    LEFT JOIN timekeeping_details tkd
      ON tkd.timekeeping_id = td.id

    WHERE s.is_active = true

    GROUP BY
      u.id,
      u.name,
      s.employee_type,
      p.name

    ORDER BY
      total_work_days DESC,
      total_work_minutes DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

// STAFF LATE CHECKIN
export const getLateStaffs = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      u.id AS user_id,
      u.name,

      COUNT(td.id) AS late_count,

      MAX(td.check_in_time) AS latest_check_in

    FROM staffs s

    INNER JOIN users u
      ON u.id = s.user_id

    INNER JOIN timekeeping_daily td
      ON td.user_id = s.user_id

    INNER JOIN shifts sh
      ON sh.id = td.shift_id

    WHERE
      td.check_in_time IS NOT NULL
      AND (
        td.check_in_time::time >
        sh.start_time
      )

    GROUP BY
      u.id,
      u.name

    ORDER BY late_count DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};


// DOCTOR REVENUE

// DOCTOR SALES
export const getTopDoctorRevenue = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      u.id AS doctor_id,
      u.name,

      COUNT(DISTINCT csp.id) AS total_profiles,

      COALESCE(
        SUM(pi.final_amount),
        0
      ) AS total_revenue

    FROM customer_service_profiles csp

    INNER JOIN users u
      ON u.id = csp.doctor_id

    INNER JOIN payment_items pi
      ON pi.profile_id = csp.id

    INNER JOIN payments p
      ON p.id = pi.payment_id

    WHERE
      p.status IN ('paid', 'partial_paid')

    GROUP BY
      u.id,
      u.name

    ORDER BY total_revenue DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

//
// ======================================================
// TECHNICIAN REVENUE
// ======================================================
//

// TECHNICIAN REALTIME REVENUE
// 12k / hour
export const getTopTechnicianRevenue = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      u.id AS user_id,
      u.name,

      COUNT(css.id) AS total_sessions,

      ROUND(
        COALESCE(
          SUM(
            css.total_actual_duration_seconds
          ) / 3600.0,
          0
        ),
        2
      ) AS total_work_hours,

      ROUND(
        (
          COALESCE(
            SUM(
              css.total_actual_duration_seconds
            ) / 3600.0,
            0
          ) * 12000
        ),
        0
      ) AS realtime_salary

    FROM customer_service_sessions css

    INNER JOIN staffs s
      ON s.user_id = css.technician_id

    INNER JOIN users u
      ON u.id = s.user_id

    GROUP BY
      u.id,
      u.name

    ORDER BY realtime_salary DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

//
// ======================================================
// CUSTOMER STATISTICS
// ======================================================
//

// VIP CUSTOMERS
// tiêu nhiều nhất
export const getTopVipCustomers = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      u.id,
      u.name,
      u.phone,

      COUNT(DISTINCT p.id) AS total_payments,

      COALESCE(
        SUM(p.paid_amount),
        0
      ) AS total_spent

    FROM payments p

    INNER JOIN users u
      ON u.id = p.customer_id

    WHERE p.status IN (
      'paid',
      'partial_paid'
    )

    GROUP BY
      u.id,
      u.name,
      u.phone

    ORDER BY total_spent DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

// LOYAL CUSTOMERS
// đặt nhiều dịch vụ nhất
export const getTopLoyalCustomers = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      u.id,
      u.name,
      u.phone,

      COUNT(csp.id) AS total_services,

      COALESCE(
        SUM(pi.final_amount),
        0
      ) AS total_spent

    FROM customer_service_profiles csp

    INNER JOIN users u
      ON u.id = csp.customer_id

    INNER JOIN payment_items pi
      ON pi.profile_id = csp.id

    INNER JOIN payments p
      ON p.id = pi.payment_id

    WHERE p.status IN (
      'paid',
      'partial_paid'
    )

    GROUP BY
      u.id,
      u.name,
      u.phone

    ORDER BY total_services DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

//
// ======================================================
// SERVICE STATISTICS
// ======================================================
//

// MOST BOOKED SERVICES
export const getTopBookedServices = async (
  limit = 10
) => {
  const result = await db.query(
    `
    SELECT
      s.id,
      s.name,

      COUNT(csp.id) AS total_bookings

    FROM customer_service_profiles csp

    INNER JOIN services s
      ON s.id = csp.service_id

    WHERE
      s.parent_id IS NOT NULL
      AND s.area IS NULL

    GROUP BY
      s.id,
      s.name

    ORDER BY total_bookings DESC

    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

// LEAST BOOKED SERVICES
export const getLeastBookedServices =
  async (limit = 10) => {
    const result = await db.query(
      `
      SELECT
        s.id,
        s.name,

        COUNT(csp.id) AS total_bookings

      FROM services s

      LEFT JOIN customer_service_profiles csp
        ON csp.service_id = s.id

      WHERE
        s.parent_id IS NOT NULL
        AND s.area IS NULL

      GROUP BY
        s.id,
        s.name

      ORDER BY total_bookings ASC

      LIMIT $1
      `,
      [limit]
    );

    return result.rows;
  };

// MOST BOOKED PACKAGES
export const getTopBookedPackages =
  async (limit = 10) => {
    const result = await db.query(
      `
      SELECT
        sp.id,
        sp.name,

        COUNT(csp.id) AS total_bookings

      FROM customer_service_profiles csp

      INNER JOIN service_packages sp
        ON sp.id = csp.package_id

      GROUP BY
        sp.id,
        sp.name

      ORDER BY total_bookings DESC

      LIMIT $1
      `,
      [limit]
    );

    return result.rows;
  };

// LEAST BOOKED PACKAGES
export const getLeastBookedPackages =
  async (limit = 10) => {
    const result = await db.query(
      `
      SELECT
        sp.id,
        sp.name,

        COUNT(csp.id) AS total_bookings

      FROM service_packages sp

      LEFT JOIN customer_service_profiles csp
        ON csp.package_id = sp.id

      GROUP BY
        sp.id,
        sp.name

      ORDER BY total_bookings ASC

      LIMIT $1
      `,
      [limit]
    );

    return result.rows;
  };

//
// ======================================================
// REVENUE STATISTICS
// ======================================================
//

export const getRevenueStatistics =
  async () => {
    const result = await db.query(
      `
      SELECT

        -- TODAY
        COALESCE(
          SUM(
            CASE
              WHEN DATE(created_at) = CURRENT_DATE
              THEN paid_amount
              ELSE 0
            END
          ),
          0
        ) AS today_revenue,

        -- MONTH
        COALESCE(
          SUM(
            CASE
              WHEN
                EXTRACT(
                  MONTH FROM created_at
                ) = EXTRACT(
                  MONTH FROM CURRENT_DATE
                )
                AND
                EXTRACT(
                  YEAR FROM created_at
                ) = EXTRACT(
                  YEAR FROM CURRENT_DATE
                )
              THEN paid_amount
              ELSE 0
            END
          ),
          0
        ) AS month_revenue,

        -- YEAR
        COALESCE(
          SUM(
            CASE
              WHEN
                EXTRACT(
                  YEAR FROM created_at
                ) = EXTRACT(
                  YEAR FROM CURRENT_DATE
                )
              THEN paid_amount
              ELSE 0
            END
          ),
          0
        ) AS year_revenue

      FROM payments

      WHERE status IN (
        'paid',
        'partial_paid'
      )
      `
    );

    return result.rows[0];
  };

// ======================================================
// WEEKLY REVENUE BY DATE RANGE
// ======================================================

export const getRevenueByDateRange = async (
  startDate: string,
  endDate: string,
) => {
  const result = await db.query(
    `
    WITH date_series AS (
      SELECT generate_series(
        $1::date,
        $2::date,
        interval '1 day'
      )::date AS revenue_date
    )

    SELECT
      ds.revenue_date,

      COALESCE(
        SUM(p.paid_amount),
        0
      ) AS revenue

    FROM date_series ds

    LEFT JOIN payments p
      ON DATE(p.created_at) = ds.revenue_date
      AND p.status IN (
        'paid',
        'partial_paid'
      )

    GROUP BY ds.revenue_date

    ORDER BY ds.revenue_date
    `,
    [startDate, endDate],
  );

  return result.rows;
};

//
// ======================================================
// DASHBOARD OVERVIEW
// ======================================================
//

export const getDashboardOverview =
  async () => {
    const [
      lowStockProducts,

      topAttendanceStaffs,
      lateStaffs,

      topDoctorRevenue,
      topTechnicianRevenue,

      topVipCustomers,
      topLoyalCustomers,

      topBookedServices,
      leastBookedServices,

      topBookedPackages,
      leastBookedPackages,

      revenueStatistics,
    ] = await Promise.all([
      getLowStockProducts(),

      getTopAttendanceStaffs(),
      getLateStaffs(),

      getTopDoctorRevenue(),
      getTopTechnicianRevenue(),

      getTopVipCustomers(),
      getTopLoyalCustomers(),

      getTopBookedServices(),
      getLeastBookedServices(),

      getTopBookedPackages(),
      getLeastBookedPackages(),

      getRevenueStatistics(),
    ]);

    return {
      products: {
        low_stock_products:
          lowStockProducts,
      },

      staffs: {
        top_attendance_staffs:
          topAttendanceStaffs,

        late_staffs:
          lateStaffs,

        top_doctor_revenue:
          topDoctorRevenue,

        top_technician_revenue:
          topTechnicianRevenue,
      },

      customers: {
        vip_customers:
          topVipCustomers,

        loyal_customers:
          topLoyalCustomers,
      },

      services: {
        top_booked_services:
          topBookedServices,

        least_booked_services:
          leastBookedServices,

        top_booked_packages:
          topBookedPackages,

        least_booked_packages:
          leastBookedPackages,
      },

      revenues: revenueStatistics,
    };
  };