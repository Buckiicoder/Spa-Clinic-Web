import { Request, Response } from "express";

import * as paymentServices from "../services/payment/payment.service.js";
import { getAllPaymentsSchema } from "../validators/payment.schema.js";
import * as vnpayServices from "../services/payment/vnpay.service.js";
import * as zalopayServices from "../services/payment/zalopay.service.js";
import {
  createVNPaySchema,
  createZaloPaySchema,
} from "../validators/payment.schema.js";

export const getCustomerUnpaidProfiles = async (
  req: Request,
  res: Response,
) => {
  try {
    const customerId = Number(req.params.customer_id);

    const profiles =
      await paymentServices.getCustomerUnpaidProfiles(customerId);

    return res.json(profiles);
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message: error.message || "Lỗi lấy danh sách chưa thanh toán",
    });
  }
};

// GET PAYMENT PROFILE DETAIL
export const getPaymentProfileDetail = async (req: Request, res: Response) => {
  try {
    const profileId = Number(req.params.profile_id);

    const data = await paymentServices.getPaymentProfileDetail(profileId);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy hồ sơ liệu trình",
      });
    }

    return res.json(data);
  } catch (err: any) {
    console.error("GET PAYMENT PROFILE DETAIL ERROR:", err);

    return res.status(500).json({
      message: "Lấy thông tin thanh toán thất bại",
      error: err.message,
    });
  }
};

// GET AVAILABLE DISCOUNTS
export const getAvailableDiscounts = async (req: Request, res: Response) => {
  try {
    const profileId = Number(req.query.profile_id);

    const discounts = await paymentServices.getAvailableDiscounts(profileId);

    return res.json(discounts);
  } catch (err: any) {
    console.error("GET AVAILABLE DISCOUNTS ERROR:", err);

    return res.status(500).json({
      message: "Lấy danh sách mã giảm giá thất bại",
      error: err.message,
    });
  }
};

// CALCULATE DISCOUNT
export const calculateDiscountAmount = async (req: Request, res: Response) => {
  try {
    const { profile_id, discount_id } = req.body;

    const data = await paymentServices.calculatePaymentDiscount(
      profile_id,
      discount_id,
    );

    return res.json(data);
  } catch (err: any) {
    console.error("CALCULATE DISCOUNT ERROR:", err);

    return res.status(500).json({
      message: "Tính toán giảm giá thất bại",
      error: err.message,
    });
  }
};

// CREATE PAYMENT
export const createPayment = async (req: Request, res: Response) => {
  try {
    const payment = await paymentServices.createPayment(req.body);

    return res.json({
      message: "Thanh toán thành công",
      data: payment,
    });
  } catch (err: any) {
    console.error("CREATE PAYMENT ERROR:", err);

    return res.status(500).json({
      message: "Thanh toán thất bại",
      error: err.message,
    });
  }
};

export const createVNPayPayment = async (req: Request, res: Response) => {
  try {
    const data = createVNPaySchema.parse(req.body);

    const ipAddr =
      req.headers["x-forwarded-for"]?.toString() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const result = await vnpayServices.createVNPayPayment({
      profile_id: data.profile_id,
      discount_id: data.discount_id,
      amount: data.amount,
      ipAddr,
    });

    return res.json({
      message: "Tạo giao dịch VNPay thành công",
      paymentUrl: result.paymentUrl,
      payment: result.payment,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const vnpayReturn = async (req: Request, res: Response) => {
  try {
    const result = await vnpayServices.vnpayReturnService(req.query);

    if (result.success) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  } catch (err: any) {
    console.error(err);

    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
};

export const createZaloPayPayment = async (req: Request, res: Response) => {
  try {
    const data = createZaloPaySchema.parse(req.body);

    const result = await zalopayServices.createZaloPayPayment({
      profile_id: data.profile_id,
      discount_id: data.discount_id,
      amount: data.amount,
    });

    return res.json({
      message: "Tạo giao dịch ZaloPay thành công",
      payment: result.payment,
      paymentUrl: result.paymentUrl,
      order_url: result.paymentUrl,
      zaloResponse: result.zaloResponse,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const zalopayCallback = async (req: Request, res: Response) => {
  try {
    const result = await zalopayServices.zalopayCallbackService(req.body);

    return res.json(result);
  } catch (err) {
    return res.json({
      return_code: 0,
      return_message: "failed",
    });
  }
};

export const getPaymentSummaryByProfile = async (
  req: Request,
  res: Response,
) => {
  try {
    const profileId = Number(req.params.profile_id);

    const data = await paymentServices.getPaymentSummaryByProfile(profileId);

    return res.json(data);
  } catch (err: any) {
    console.error("GET PAYMENT SUMMARY ERROR:", err);

    return res.status(500).json({
      message: "Lấy lịch sử thanh toán thất bại",
      error: err.message,
    });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const { day, month, year, status } = getAllPaymentsSchema.parse(req.query);

    const data = await paymentServices.getAllPayments({
      day,
      month,
      year,
      status,
    });

    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message || "Lấy danh sách hóa đơn thất bại",
    });
  }
};

export const getPaymentBillDetail = async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.payment_id);

    const data = await paymentServices.getPaymentBillDetail(paymentId);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy hóa đơn",
      });
    }

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      message: "Lấy chi tiết hóa đơn thất bại",
      error: err.message,
    });
  }
};
