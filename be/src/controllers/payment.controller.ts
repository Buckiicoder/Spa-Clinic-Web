import { Request, Response } from "express";

import * as paymentServices from "../services/payment.service.js";

export const getCustomerUnpaidProfiles =
  async (req: Request, res: Response) => {
    try {
      const customerId = Number(
        req.params.customer_id
      );

      const profiles =
        await paymentServices.getCustomerUnpaidProfiles(
          customerId
        );

      return res.json(profiles);
    } catch (error: any) {
      console.log(error);

      return res.status(500).json({
        message:
          error.message ||
          "Lỗi lấy danh sách chưa thanh toán",
      });
    }
  };

// GET PAYMENT PROFILE DETAIL
export const getPaymentProfileDetail = async (
  req: Request,
  res: Response
) => {
  try {
    const profileId = Number(
      req.params.profile_id
    );

    const data =
      await paymentServices.getPaymentProfileDetail(
        profileId
      );

    if (!data) {
      return res.status(404).json({
        message:
          "Không tìm thấy hồ sơ liệu trình",
      });
    }

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET PAYMENT PROFILE DETAIL ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy thông tin thanh toán thất bại",
      error: err.message,
    });
  }
};

// GET AVAILABLE DISCOUNTS
export const getAvailableDiscounts =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const profileId = Number(
  req.query.profile_id
);

const discounts =
  await paymentServices.getAvailableDiscounts(
    profileId
  );

      return res.json(discounts);
    } catch (err: any) {
      console.error(
        "GET AVAILABLE DISCOUNTS ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Lấy danh sách mã giảm giá thất bại",
        error: err.message,
      });
    }
  };

// CALCULATE DISCOUNT
export const calculateDiscountAmount =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
  profile_id,
  discount_id,
} = req.body;

const data =
  await paymentServices.calculatePaymentDiscount(
    profile_id,
    discount_id
  );

      return res.json(data);
    } catch (err: any) {
      console.error(
        "CALCULATE DISCOUNT ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Tính toán giảm giá thất bại",
        error: err.message,
      });
    }
  };

// CREATE PAYMENT
export const createPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const payment =
      await paymentServices.createPayment(
        req.body
      );

    return res.json({
      message:
        "Thanh toán thành công",
      data: payment,
    });
  } catch (err: any) {
    console.error(
      "CREATE PAYMENT ERROR:",
      err
    );

    return res.status(500).json({
      message: "Thanh toán thất bại",
      error: err.message,
    });
  }
};

export const getPaymentSummaryByProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const profileId = Number(req.params.profile_id);

    const data =
      await paymentServices.getPaymentSummaryByProfile(
        profileId
      );

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET PAYMENT SUMMARY ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy lịch sử thanh toán thất bại",
      error: err.message,
    });
  }
};