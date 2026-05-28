import { Request, Response } from "express";

import * as discountServices from "../services/discount.service.js";

// ================= DISCOUNT =================

// GET ALL DISCOUNTS
export const getDiscounts = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      await discountServices.getAllDiscounts();

    return res.json(data);
  } catch (err) {
    console.error("GET DISCOUNTS ERROR:", err);

    return res.status(500).json({
      message: "Lấy danh sách mã giảm giá thất bại",
    });
  }
};

// GET DETAIL DISCOUNT
export const getDiscountDetail = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const data =
      await discountServices.getDiscountById(id);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy mã giảm giá",
      });
    }

    return res.json(data);
  } catch (err) {
    console.error("GET DISCOUNT DETAIL ERROR:", err);

    return res.status(500).json({
      message: "Lấy chi tiết mã giảm giá thất bại",
    });
  }
};

// CREATE DISCOUNT
export const createDiscount = async (
  req: Request,
  res: Response
) => {
  try {
    const existed =
      await discountServices.findDiscountByCode(
        req.body.code
      );

    if (existed) {
      return res.status(400).json({
        message: "Mã giảm giá đã tồn tại",
      });
    }

    const discount =
      await discountServices.createDiscount(
        req.body
      );

    return res.json(discount);
  } catch (err: any) {
    console.error("CREATE DISCOUNT ERROR:", err);

    return res.status(500).json({
      message: "Tạo mã giảm giá thất bại",
      error: err.message,
    });
  }
};

// UPDATE DISCOUNT
export const updateDiscount = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const existed =
      await discountServices.getDiscountById(id);

    if (!existed) {
      return res.status(404).json({
        message: "Không tìm thấy mã giảm giá",
      });
    }

    if (req.body.code) {
      const duplicate =
        await discountServices.findDiscountByCode(
          req.body.code
        );

      if (
        duplicate &&
        duplicate.id !== id
      ) {
        return res.status(400).json({
          message: "Mã giảm giá đã tồn tại",
        });
      }
    }

    const discount =
      await discountServices.updateDiscount(
        id,
        req.body
      );

    return res.json(discount);
  } catch (err: any) {
    console.error("UPDATE DISCOUNT ERROR:", err);

    return res.status(500).json({
      message: "Cập nhật mã giảm giá thất bại",
      error: err.message,
    });
  }
};

// DELETE DISCOUNT
export const deleteDiscount = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const existed =
      await discountServices.getDiscountById(id);

    if (!existed) {
      return res.status(404).json({
        message: "Không tìm thấy mã giảm giá",
      });
    }

    const discount =
      await discountServices.deleteDiscount(id);

    return res.json({
      message: "Xóa mã giảm giá thành công",
      data: discount,
    });
  } catch (err: any) {
    console.error("DELETE DISCOUNT ERROR:", err);

    return res.status(500).json({
      message: "Xóa mã giảm giá thất bại",
      error: err.message,
    });
  }
};