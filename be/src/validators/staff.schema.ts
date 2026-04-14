import { z } from "zod";

// 🔹 regex phone VN
const phoneRegex = /^[0-9]{10,11}$/;

// =====================================================
// 🔹 CREATE
// =====================================================
export const createStaffSchema = z
  .object({
    // USERS
    phone: z.string().regex(phoneRegex, "SĐT không hợp lệ"),

    email: z.string().email("Email không hợp lệ").optional(),

    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),

    confirm_password: z.string(),

    name: z.string().min(1, "Tên không được để trống"),

    avatar: z.string().optional(),

    dob: z.string().optional(),

    gender: z.enum(["male", "female", "other"]),

    city: z.string().optional(),
    ward: z.string().optional(),
    address_detail: z.string().optional(),

    // STAFF
    position_id: z.number({
      required_error: "Chưa chọn chức danh",
    }),

    employee_type: z.enum(["FULLTIME", "PARTTIME"]),

    experience_years: z
      .number()
      .min(0, "Kinh nghiệm không hợp lệ")
      .max(50, "Kinh nghiệm quá lớn")
      .optional(),

    note: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu không khớp",
    path: ["confirm_password"],
  });

// =====================================================
// 🔹 UPDATE
// =====================================================
export const updateStaffSchema = z.object({
  // USERS
  phone: z.string().regex(phoneRegex).optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),

  city: z.string().optional(),
  ward: z.string().optional(),
  address_detail: z.string().optional(),

  // STAFF
  position_id: z.number().optional(),
  employee_type: z.enum(["FULLTIME", "PARTTIME"]).optional(),

  experience_years: z.number().min(0).max(50).optional(),

  note: z.string().optional(),
});
