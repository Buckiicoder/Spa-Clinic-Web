import { Request, Response } from "express";
import * as customerServices from "../services/customer.service.js";

// ================= CUSTOMER =================

// GET ALL
export const getCustomers = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await customerServices.getCustomers({
      search: req.query.search,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),

      rank: req.query.rank || null,
      status: req.query.status || null,

      is_active:
        req.query.is_active !== undefined
          ? req.query.is_active === "true"
          : null,
    });

    return res.json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: "Lấy danh sách khách hàng thất bại",
    });
  }
};

// GET DETAIL
export const getCustomerDetail = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    const data =
      await customerServices.getCustomerDetail(id);

    return res.json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: err.message || "Lấy chi tiết thất bại",
    });
  }
};

// CREATE
export const createCustomer = async (
  req: Request,
  res: Response,
) => {
  try {
    const data =
      await customerServices.createCustomer(req.body);

    return res.status(201).json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: err.message || "Tạo khách thất bại",
    });
  }
};

// UPDATE
export const updateCustomer = async (
  req: Request,
  res: Response,
) => {
  try {
    const user_id = Number(req.params.id);

    const data =
      await customerServices.updateCustomer(
        user_id,
        req.body,
      );

    return res.json(data);
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      message: err.message || "Cập nhật thất bại",
    });
  }
};

export const getMyServiceHistory = async (
  req: Request,
  res: Response,
) => {
  try {
    const user_id = req.user.id;

    const data =
      await customerServices.getCustomerServiceHistory(
        user_id,
      );

    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};