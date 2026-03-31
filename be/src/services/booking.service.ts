import { db } from "../config/db.js";

export const findUserByContact = async (phone?: string | null, email?: string | null) => {
  const result = await db.query(
    `SELECT * FROM users WHERE phone = $1 OR email = $2 LIMIT 1`,
    [phone || null, email || null],
  );
  return result.rows[0];
};

export const createGuestUser = async (
  name: string,
  phone?: string | null,
  email?: string | null,
) => {
  const result = await db.query(
    `INSERT INTO users (name, phone, email, role, is_verified) 
    VALUES ($1, $2, $3, 'CUSTOMER', false)
    RETURNING *`,
    [name, phone, email || null],
  );
  return result.rows[0];
};

export const createBooking = async (data: any) => {
  const { customer_id, service_id, booking_date, booking_time, quantity } =
    data;

  const result = await db.query(
    `INSERT INTO bookings (booking_code, customer_id, service_id, booking_date, booking_time, quantity)
    VALUES (CONCAT('BK', FLOOR(RANDOM() * 1000000)),
    $1, $2, $3, $4, $5)
    RETURNING *`,
    [customer_id, service_id, booking_date, booking_time, quantity],
  );

  return await getBookingById(result.rows[0].id);
};

const BOOKING_WITH_RELATIONS = `
  SELECT b.*, u.name, u.phone, u.email, s.name as service_name
  FROM bookings b
  JOIN users u ON b.customer_id = u.id
  JOIN services s ON b.service_id = s.id
`;

export const getBookings = async () => {
  const result = await db.query(`
    ${BOOKING_WITH_RELATIONS}
    ORDER BY b.created_at DESC
  `);

  return result.rows;
};

export const getBookingById = async (id: string) => {
  const result = await db.query(`
    ${BOOKING_WITH_RELATIONS}
    WHERE b.id = $1`,
    [id],
  );

  return result.rows[0];
};

export const confirmBooking = async (id: string) => {
  await db.query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`, [
    id,
  ]);
  return await getBookingById(id);
};

export const deleteBooking = async (id: string) => {
  await db.query(`DELETE FROM bookings WHERE id = $1`, [id]);
};
