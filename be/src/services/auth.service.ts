import { db } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { UserRole } from "../types/user.js";

type RegisterInput = {
  name: string;
  gender: string;
  phone: string | null;
  email: string | null;
  password: string;
  role: UserRole;
};
const checkUserExists = async (email: string | null, phone: string | null) => {
  const result = await db.query(
    "SELECT 1 FROM users WHERE email=$1 OR phone=$2",
    [email, phone],
  );

  if (result.rowCount) {
    throw new Error("Thông tin đã tồn tại trong hệ thống");
  }
};

export const registerService = async (data: RegisterInput) => {
  const { name, gender, phone, email, password, role } = data;

  // ✅ dùng chung
  await checkUserExists(email, phone);

  const hashed = await hashPassword(password);

  const userResult = await db.query(
    `INSERT INTO users(name, phone, email, password_hash, role)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, role`,
    [name, phone, email, hashed, role],
  );

  const userId = userResult.rows[0].id;

  await db.query(`INSERT INTO customers(user_id, sex) VALUES ($1, $2)`, [
    userId,
    gender,
  ]);

  return signToken(userResult.rows[0]);
};

export const createOTPService = async (
  data: RegisterInput & { contact: string },
) => {
  const { name, gender, phone, email, password, contact } = data;

  // ✅ dùng chung
  await checkUserExists(email, phone);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await db.query(
    `INSERT INTO otp_verifications(contact, otp_code, expires_at, temp_data) 
     VALUES ($1, $2, NOW() + INTERVAL '5 minutes', $3)`,
    [contact, otp, JSON.stringify({ name, gender, phone, email, password })],
  );

  return otp;
};

export const verifyOTPService = async (contact: string, otp: string) => {
  const result = await db.query(
    `SELECT * FROM otp_verifications
     WHERE contact=$1 AND otp_code=$2
     ORDER BY id DESC LIMIT 1`,
    [contact, otp],
  );

  if (!result.rowCount) {
    throw new Error("OTP không đúng");
  }

  const record = result.rows[0];

  if (new Date(record.expires_at) < new Date()) {
    throw new Error("OTP đã hết hạn");
  }

  const data = record.temp_data;

  // ⚠️ đảm bảo parse nếu DB trả string
  const parsedData = typeof data === "string" ? JSON.parse(data) : data;

  const token = await registerService({
    ...parsedData,
    role: "CUSTOMER",
  });

  await db.query("DELETE FROM otp_verifications WHERE contact=$1", [contact]);

  return token;
};

// export const customerLoginService = async (email: string,  password: string) => {
//   const result = await db.query("SELECT * FROM users WHERE email=$1 OR phone=$1", [email]);

//   if (!result.rowCount) throw new Error("Invalid credentials");

//   const user = result.rows[0];

//   const match = await comparePassword(password, user.password_hash);

//   if (!match) throw new Error("Invalid credentials");

//   return signToken({
//     id: user.id,
//     role: user.role,
//   });
// };

export const loginService = async (email: string, password: string) => {
  const result = await db.query(
    `SELECT *
     FROM users 
     WHERE email = $1 OR phone = $1`,
    [email],
  );

  if (!result.rowCount) throw new Error("Invalid credentials");

  const user = result.rows[0];

  if (!user.is_active) {
    throw new Error("Account is deactivated");
  }

  const match = await comparePassword(password, user.password_hash);

  if (!match) throw new Error("Invalid credentials");

  return user; // ✅ trả user cho controller xử lý tiếp
};

export const getCustomerById = async (id: number) => {
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar, c.sex, c.total_spending, c.rank
    FROM users u
    LEFT JOIN customers c 
    ON c.user_id = u.id 
    WHERE u.id = $1`,
    [id],
  );

  if (!result.rowCount) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

export const getStaffById = async (id: number) => {
  const result = await db.query(
    `SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.avatar,

        s.id as staff_id,
        s.specialization,
        s.experience_years,
        s.salary,
        s.is_active AS staff_active,
        s.rating,

        p.name AS position

     FROM users u
     LEFT JOIN staffs s ON s.user_id = u.id
     LEFT JOIN positions p ON p.id = s.position_id
     WHERE u.id = $1`,
    [id]
  );

  if (!result.rowCount) throw new Error("User not found");

  const user = result.rows[0];

  // 🔥 check đúng bản chất
  // if (!user.staff_id) {
  //   throw new Error("User is not staff or staff record missing");
  // }

  return user;
};


export const updateAvatarService = async (userId: number, avatar: string) => {
  await db.query("UPDATE users SET avatar = $1 WHERE id = $2", [
    avatar,
    userId,
  ]);
};

export const checkUploadLimit = async (userId: number) => {
  const today = await db.query(
    `
    SELECT COUNT(*) FROM avatar_logs
    WHERE user_id = $1
    AND created_at >= CURRENT_DATE
  `,
    [userId],
  );

  const month = await db.query(
    `
    SELECT COUNT(*) FROM avatar_logs
    WHERE user_id = $1
    AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
  `,
    [userId],
  );

  if (Number(today.rows[0].count) >= 3) {
    throw new Error("Bạn đã đổi ảnh tối đa 3 lần hôm nay");
  }

  if (Number(month.rows[0].count) >= 5) {
    throw new Error("Bạn đã đổi ảnh tối đa 5 lần tháng này");
  }
};

export const updateAvatarLogs = async (userId: number) => {
  await db.query("INSERT INTO avatar_logs (user_id) VALUES ($1)", [userId]);
};

// export const staffLoginService = async (email: string,  password: string) => {
//   const result = await db.query("SELECT * FROM users WHERE email=$1 OR phone=$1", [email]);

//   if (!result.rowCount) throw new Error("Invalid credentials");

//   const user = result.rows[0];

//   const match = await comparePassword(password, user.password_hash);

//   if (!match) throw new Error("Invalid credentials");

//   return signToken({
//     id: user.id,
//     role: user.role,
//   });
// };
