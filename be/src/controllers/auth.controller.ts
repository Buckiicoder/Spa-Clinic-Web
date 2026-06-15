import { Request, Response } from "express";
import {
  loginSchema,
  registerSchema,
  rateSessionSchema,
} from "../validators/auth.schema.js";
import * as authService from "../services/auth.service.js";
import { updateAvatarService } from "../services/auth.service.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { UserRole } from "../types/user.js";
import { signToken } from "../utils/jwt.js";
import { customerCookieOptions, staffCookieOptions } from "../utils/cookie.js";

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

      return res.json({
        message: "OTP đã được gửi tới email",
        contactType: "EMAIL",
      });
    }

    // DEMO SMS OTP
    return res.json({
      message: "OTP đã được gửi tới số điện thoại",
      contactType: "PHONE",
      demoOtp: otp,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { contact, otp } = req.body;

    const token = await authService.verifyOTPService(contact, otp);

    //demo local
    // res.cookie("customerAccessToken", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    // });

    //production
    res.cookie("customerAccessToken", token, customerCookieOptions);

    return res.json({
      message: "Xác thực OTP thành công",
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const customerLogin = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await authService.loginService(data.email, data.password);

    if (user.role !== "CUSTOMER") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    // // demo local
    // res.cookie("customerAccessToken", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    //   maxAge: 1000 * 60 * 60 * 24,
    // });

    //production
    res.cookie("customerAccessToken", token, customerCookieOptions);

    return res.json({ message: "Login success" });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};

export const customerLogout = async (_req: Request, res: Response) => {
  //demo
  // res.clearCookie("customerAccessToken");

  //production
  res.clearCookie("customerAccessToken", customerCookieOptions);
  return res.json({
    message: "Logout success",
  });
};

export const staffLogin = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await authService.loginService(data.email, data.password);

    // 🔥 phân quyền tại controller
    if (user.role !== "STAFF" && user.role !== "MANAGER") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    //demo local
    // res.cookie("staffAccessToken", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    //   maxAge: 1000 * 60 * 60 * 24,
    // });

    //production
    res.cookie("staffAccessToken", token, staffCookieOptions);

    return res.json({ message: "Login success" });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};

export const staffLogout = async (_req: Request, res: Response) => {
  // demo local
  // res.clearCookie("staffAccessToken");

  //production
  res.clearCookie("staffAccessToken", staffCookieOptions);
  return res.json({
    message: "Logout success",
  });
};

export const meCustomer = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await authService.getCustomerById(req.user.id);

  return res.json(user);
};

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

    if (!req.file) {
      return res.status(400).json({ message: "Chưa ảnh nào được chọn" });
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

export const getPendingRatings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const ratings = await authService.getPendingRatings(req.user.id);

    return res.json({
      success: true,
      data: ratings,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getCustomerRatings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const ratings = await authService.getCustomerRatings(req.user.id);

    return res.json({
      success: true,
      data: ratings,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const rateSession = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { sessionId, rating, feedback } = rateSessionSchema.parse(req.body);

    const result = await authService.rateSession({
      sessionId,
      customerId: req.user.id,
      rating,
      feedback,
    });

    return res.json({
      success: true,
      rewardPoints: result.rewardPoints,
      message: "Đánh giá thành công",
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const forgotPassword =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const { contact } = req.body;

      console.log("body: ", req.body);

      console.log("contact: ", contact);

      const otp =
        await authService.createForgotPasswordOTP(
          contact,
        );

      const emailRegex =
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

      if (emailRegex.test(contact)) {
        await sendOTPEmail(contact, otp);

        return res.json({
          message:
            "OTP đã được gửi tới email",
        });
      }

      return res.json({
        message:
          "OTP đã được gửi tới số điện thoại",
        contactType: "PHONE",
        demoOtp: otp,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message,
      });
    }
  };

export const verifyForgotOTP =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const { contact, otp } = req.body;

      await authService.verifyForgotPasswordOTP(
        contact,
        otp,
      );

      return res.json({
        success: true,
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message,
      });
    }
  };

export const resetPassword =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const {
        contact,
        password,
      } = req.body;

      await authService.resetPassword(
        contact,
        password,
      );

      return res.json({
        success: true,
        message:
          "Đổi mật khẩu thành công",
      });
    } catch (err: any) {
      return res.status(400).json({
        message: err.message,
      });
    }
  };