import { Request, Response } from 'express'
import { loginSchema, registerSchema } from '../validators/auth.schema.js'
import * as authService from '../services/auth.service.js'
import { updateAvatarService } from '../services/auth.service.js' 
import { sendOTPEmail } from "../utils/mailer.js";
import { UserRole } from '../types/user.js';
import { signToken } from "../utils/jwt.js";

export const customerRegister = async (req: Request, res: Response) => {
  try {
    const { name, gender, contact, password } = registerSchema.parse(req.body);

    const phoneRegex = /^(03|09)\d{8}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    let phone: string | null = null;
    let email: string | null = null;

    if (phoneRegex.test(contact)) {
      phone = contact;
    } else if (emailRegex.test(contact)) {
      email = contact;
    } else {
      return res.status(400).json({ message: "Contact không hợp lệ" });
    }

    // 👉 gọi service
    const otp = await authService.createOTPService({
      name,
      gender,
      phone,
      email,
      password,
      role: UserRole.CUSTOMER,
      contact,
    });

    console.log("OTP debug: ", otp);
    // 👉 gửi OTP
    if (email) {
      await sendOTPEmail(email, otp);
    } else {
      console.log("OTP gửi tới SĐT:", otp); // fake SMS
    }

    return res.json({
      message: "OTP đã được gửi",
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { contact, otp } = req.body;

    const token = await authService.verifyOTPService(contact, otp);

    res.cookie("customerAccessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.json({
      message: "Xác thực thành công",
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const customerLogin = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await authService.loginService(
      data.email,
      data.password
    );

    if (user.role !== "CUSTOMER") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    res.cookie("customerAccessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json({ message: "Login success" });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};



export const customerLogout = async (_req: Request, res: Response) => {
  res.clearCookie('customerAccessToken')

  return res.json({
    message: 'Logout success'
  })
}

export const staffLogin = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await authService.loginService(
      data.email,
      data.password
    );

    // 🔥 phân quyền tại controller
    if (user.role !== "STAFF" && user.role !== "MANAGER") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    res.cookie("staffAccessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.json({ message: "Login success" });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};


export const staffLogout = async (_req: Request, res: Response) => {
  res.clearCookie('staffAccessToken')

  return res.json({
    message: 'Logout success'
  })
}

export const meCustomer = async (req: Request, res: Response) => {
  if(!req.user) {
    return res.status(401).json({message: 'Unauthorized'})
  }

  const user = await authService.getCustomerById(req.user.id)

  return res.json(user)
}

export const meStaff = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "STAFF" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const staff = await authService.getStaffById(req.user.id);

    return res.json(staff);
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
};


export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if(!req.file) {
      return res.status(400).json({ message: "Chưa ảnh nào được chọn"});
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    // Kiểm tra số lần giới hạn đổi ảnh => đổi => tạo log kiểm tra

    await authService.checkUploadLimit(userId);

    await updateAvatarService(userId, avatarPath);

    await authService.updateAvatarLogs(userId);

    res.json({
      message: "Upload success",
      avatar: avatarPath,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// //staff only
// export const staffLogin = async (req: Request, res: Response) => {
//   try {
//     const data = loginSchema.parse(req.body)
//     const token = await authService.staffLoginService(
//       data.email,
//       data.password
//     )
    
//     /*Set Cookie*/
//     res.cookie('staffAccessToken', token, {
//       httpOnly: true,
//       secure: false,
//       sameSite: 'lax',
//       maxAge: 1000 * 60 * 60 * 24 * 1
//     })

//     return res.json({
//       message: 'Login success'
//     })
//   } catch (err: any) {
//     return res.status(401).json({ message: err.message })
//   }
// }