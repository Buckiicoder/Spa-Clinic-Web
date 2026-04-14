import { db } from "../config/db.js";

export type StaffInput = {
  // 🔹 USERS
  phone?: string;
  email?: string;
  password_hash?: string;
  name?: string;
  avatar?: string;
  dob?: string;
  gender?: string;
  city?: string;
  ward?: string;
  address_detail?: string;
  role?: string;

  // 🔹 STAFFS
  position_id?: number;
  employee_type?: string;
  experience_years?: number;
  note?: string;
};

export const findUserByPhoneOrEmail = async (
  phone?: string,
  email?: string
) => {
  const result = await db.query(
    `
    SELECT * FROM users
    WHERE phone = $1 OR email = $2
    `,
    [phone || null, email || null]
  );

  return result.rows[0];
};


// 🔹 GET ALL STAFF
export const getAllStaffs = async () => {
  const result = await db.query(`
    SELECT 
      s.user_id,
      s.position_id,
      s.employee_type,
      s.experience_years,
      s.note,
      s.is_active,

      u.id,
      u.name,
      u.phone,
      u.email,
      u.avatar,
      u.dob,
      u.gender,
      u.city,
      u.ward,
      u.address_detail,

      p.name as position_name

    FROM staffs s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN positions p ON s.position_id = p.id
    ORDER BY s.id ASC
  `);

  return result.rows;
};

export const getStaffById = async (id: number) => {
  const result = await db.query(
    `
    SELECT 
      s.*,
      u.*,
      p.name as position_name
    FROM staffs s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN positions p ON s.position_id = p.id
    WHERE u.id = $1
    `,
    [id],
  );

  return result.rows[0];
};

// 🔹 CREATE STAFF (2 bước: users -> staffs)
export const createStaff = async (data: StaffInput) => {
  const {
    phone,
    email,
    password_hash,
    name,
    avatar,
    dob,
    gender,
    city,
    ward,
    address_detail,
    role,
    position_id,
    employee_type,
    experience_years,
    note,
  } = data;

  // 🔹 insert user
  const userResult = await db.query(
    `
    INSERT INTO users 
    (phone, email, password_hash, name, avatar, dob, gender, city, ward, address_detail, role)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
    `,
    [
      phone,
      email,
      password_hash,
      name,
      avatar,
      dob,
      gender,
      city,
      ward,
      address_detail,
      role,
    ],
  );

  const user = userResult.rows[0];

  // 🔹 insert staff
  const staffResult = await db.query(
    `
    INSERT INTO staffs
    (user_id, position_id, employee_type, experience_years, note)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [user.id, position_id, employee_type, experience_years, note],
  );

  return {
    user,
    staff: staffResult.rows[0],
  };
};

export const updateStaff = async (id: number, data: StaffInput) => {
  const {
    phone,
    email,
    name,
    avatar,
    dob,
    gender,
    city,
    ward,
    address_detail,

    position_id,
    employee_type,
    experience_years,
    note,
  } = data;

  // 🔹 UPDATE USERS (id = user_id)
  await db.query(
    `
    UPDATE users
    SET phone = COALESCE($1, phone),
        email = COALESCE($2, email),
        name = COALESCE($3, name),
        avatar = COALESCE($4, avatar),
        dob = COALESCE($5, dob),
        gender = COALESCE($6, gender),
        city = COALESCE($7, city),
        ward = COALESCE($8, ward),
        address_detail = COALESCE($9, address_detail),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    `,
    [
      phone ?? null,
      email ?? null,
      name ?? null,
      avatar ?? null,
      dob ?? null,
      gender ?? null,
      city ?? null,
      ward ?? null,
      address_detail ?? null,
      id, // 🔥 id = user_id
    ]
  );

  // 🔹 UPDATE STAFFS (THEO user_id, KHÔNG phải id)
  const result = await db.query(
    `
    UPDATE staffs
    SET position_id = COALESCE($1, position_id),
        employee_type = COALESCE($2, employee_type),
        experience_years = COALESCE($3, experience_years),
        note = COALESCE($4, note)
    WHERE user_id = $5
    RETURNING *
    `,
    [
      position_id ?? null,
      employee_type ?? null,
      experience_years ?? null,
      note ?? null,
      id, // 🔥 dùng user_id
    ]
  );

  return result.rows[0];
};

export const deleteStaff = async (id: number) => {
  // ❗ chỉ cần delete staff → cascade xóa user
  await db.query(`DELETE FROM users WHERE id = $1`, [id]);
};
