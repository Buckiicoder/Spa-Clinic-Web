import { Router } from "express";

import {
  getCustomerUnpaidProfiles,
  getPaymentProfileDetail,
  getAvailableDiscounts,
  calculateDiscountAmount,
  createPayment,
  getPaymentSummaryByProfile,
  getAllPayments,
  getPaymentBillDetail,
  createVNPayPayment,
  vnpayReturn,
  createZaloPayPayment,
  zalopayCallback,
} from "../controllers/payment.controller.js";

const router = Router();

router.get("/bills", getAllPayments);

router.get("/bills/:payment_id", getPaymentBillDetail);

router.get("/customer/:customer_id/unpaid-profiles", getCustomerUnpaidProfiles);

// GET PAYMENT PROFILE DETAIL
router.get("/profile/:profile_id", getPaymentProfileDetail);

router.get("/summary/:profile_id", getPaymentSummaryByProfile);

// GET AVAILABLE DISCOUNTS
router.get("/available-discounts", getAvailableDiscounts);

// CALCULATE DISCOUNT
router.post("/calculate-discount", calculateDiscountAmount);

// CREATE PAYMENT
router.post("/", createPayment);

// VNPay
router.post("/vnpay/create", createVNPayPayment);

router.get("/vnpay-return", vnpayReturn);

router.post("/zalopay/create", createZaloPayPayment);

router.post("/zalopay/callback", zalopayCallback);

export default router;
