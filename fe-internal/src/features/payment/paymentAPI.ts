import { api } from "../../services/api";

export const fetchCustomerUnpaidProfilesAPI = (customer_id: number) =>
  api.get(`/payment/customer/${customer_id}/unpaid-profiles`);

export const fetchPaymentProfileDetailAPI = (profile_id: number) =>
  api.get(`/payment/profile/${profile_id}`);

export const fetchAvailableDiscountsAPI = (profile_id: number) =>
  api.get(`/payment/available-discounts`, {
    params: {
      profile_id,
    },
  });

export const fetchPaymentSummaryByProfileAPI = (profile_id: number) =>
  api.get(`/payment/summary/${profile_id}`);

// ============================================
// CALCULATE DISCOUNT
// ============================================

export const calculateDiscountAmountAPI = (data: {
  profile_id: number;

  discount_id: number;
}) => api.post(`/payment/calculate-discount`, data);

// ============================================
// CREATE PAYMENT
// ============================================

export const createPaymentAPI = (data: {
  customer_id: number;

  profile_id: number;

  discount_id?: number;

  payment_methods: {
    payment_method:
      | "CASH"
      | "BANK_TRANSFER"
      | "MOMO"
      | "VNPAY"
      | "ZALOPAY"
      | "CARD";

    amount: number;

    transaction_code?: string;
  }[];

  note?: string;
}) => api.post(`/payment`, data);

// PAYMENT BILLS MANAGEMENT

export const fetchPaymentBillsAPI = (params?: {
  day?: number;
  month?: number;
  year?: number;
  status?: string;
}) =>
  api.get("/payment/bills", {
    params,
  });

export const fetchPaymentBillDetailAPI = (payment_id: number) =>
  api.get(`/payment/bills/${payment_id}`);
