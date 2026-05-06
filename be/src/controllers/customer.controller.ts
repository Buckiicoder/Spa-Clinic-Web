import { Request, Response } from "express";
import * as customerServices from "../services/customer.service.js";

// ================= CUSTOMER =================

// 🔹 GET ALL CUSTOMERS
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const data = await customerServices.getCustomers();
    return res.json(data);
  } catch {
    return res.status(500).json({ message: "Lấy danh sách khách thất bại" });
  }
};

// 🔹 GET DETAIL CUSTOMER
export const getCustomerDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await customerServices.getCustomerDetail(id);

    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    return res.json(data);
  } catch {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// ================= PROFILE =================

// 🔹 CREATE PROFILE (thêm liệu trình)
export const createCustomerProfile = async (req: Request, res: Response) => {
  try {
    const profile = await customerServices.createCustomerServiceProfile(
      req.body,
    );
    return res.json(profile);
  } catch (err: any) {
    console.error("CREATE PROFILE ERROR:", err);

    return res.status(500).json({
      message: "Tạo liệu trình thất bại",
      error: err.message,
    });
  }
};

// 🔹 GET PROFILES BY CUSTOMER
export const getProfilesByCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = Number(req.params.customerId);
    const data = await customerServices.getProfilesByCustomer(customerId);
    return res.json(data);
  } catch {
    return res.status(500).json({ message: "Lấy liệu trình thất bại" });
  }
};

// ================= SESSION =================

// 🔹 CREATE SESSION (1 buổi)
export const createSession = async (req: Request, res: Response) => {
  try {
    const session = await customerServices.createSession(req.body);
    return res.json(session);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Tạo buổi thất bại" });
  }
};

// 🔹 GET SESSIONS BY PROFILE
export const getSessionsByProfile = async (req: Request, res: Response) => {
  try {
    const profileId = Number(req.params.profileId);
    const data = await customerServices.getSessionsByProfile(profileId);
    return res.json(data);
  } catch {
    return res.status(500).json({ message: "Lấy danh sách buổi thất bại" });
  }
};
