import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchPaymentProfileDetailAPI,
  fetchAvailableDiscountsAPI,
  calculateDiscountAmountAPI,
  createPaymentAPI,
  fetchCustomerUnpaidProfilesAPI,
  fetchPaymentSummaryByProfileAPI,
  fetchPaymentBillsAPI,
  fetchPaymentBillDetailAPI,
} from "./paymentAPI";

interface PaymentState {
  loading: boolean;

  customerUnpaidProfiles: any[];

  customerInfo: any | null;

  paymentProfile: any | null;

  paymentSummary: any | null;

  availableDiscounts: any[];

  calculatedDiscount: any | null;

  paymentResult: any | null;

  error: string | null;

  paymentBills: any[];

  paymentBillDetail: any | null;
}

const initialState: PaymentState = {
  loading: false,

  customerUnpaidProfiles: [],

  customerInfo: null,

  paymentProfile: null,

  paymentSummary: null,

  availableDiscounts: [],

  calculatedDiscount: null,

  paymentResult: null,

  error: null,

  paymentBills: [],

  paymentBillDetail: null,
};

export const fetchCustomerUnpaidProfiles = createAsyncThunk(
  "payment/fetchCustomerUnpaidProfiles",

  async (customer_id: number, thunkAPI) => {
    try {
      const response = await fetchCustomerUnpaidProfilesAPI(customer_id);

      console.log("fetchCustomerUnpaidProfiles response", response.data);

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  },
);

export const fetchPaymentProfileDetail = createAsyncThunk(
  "payment/fetchProfileDetail",

  async (profile_id: number) => {
    const res = await fetchPaymentProfileDetailAPI(profile_id);

    return res.data;
  },
);

export const fetchPaymentSummaryByProfile = createAsyncThunk(
  "payment/fetchPaymentSummary",

  async (profile_id: number) => {
    const res = await fetchPaymentSummaryByProfileAPI(profile_id);

    return res.data;
  },
);

export const fetchPaymentBills = createAsyncThunk(
  "payment/fetchBills",

  async (params?: {
    day?: number;
    month?: number;
    year?: number;
    status?: string;
  }) => {
    const res = await fetchPaymentBillsAPI(params);

    return res.data;
  },
);

export const fetchPaymentBillDetail = createAsyncThunk(
  "payment/fetchBillDetail",

  async (payment_id: number) => {
    const res = await fetchPaymentBillDetailAPI(payment_id);

    return res.data;
  },
);

// ============================================
// GET AVAILABLE DISCOUNTS
// ============================================

export const fetchAvailableDiscounts = createAsyncThunk(
  "payment/fetchAvailableDiscounts",

  async (profile_id: number) => {
    const res = await fetchAvailableDiscountsAPI(profile_id);

    return res.data;
  },
);

// ============================================
// CALCULATE DISCOUNT
// ============================================

export const calculatePaymentDiscount = createAsyncThunk(
  "payment/calculateDiscount",

  async (data: {
    profile_id: number;

    discount_id: number;
  }) => {
    const res = await calculateDiscountAmountAPI(data);

    return res.data;
  },
);

// ============================================
// CREATE PAYMENT
// ============================================

export const createPayment = createAsyncThunk(
  "payment/create",

  async (data: {
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
  }) => {
    const res = await createPaymentAPI(data);

    return res.data;
  },
);

const paymentSlice = createSlice({
  name: "payment",

  initialState,

  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },

    clearCalculatedDiscount: (state) => {
      state.calculatedDiscount = null;
    },

    clearPaymentResult: (state) => {
      state.paymentResult = null;
    },

    clearPaymentBillDetail: (state) => {
      state.paymentBillDetail = null;
    },

    clearPaymentBills: (state) => {
      state.paymentBills = [];
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchCustomerUnpaidProfiles.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(fetchCustomerUnpaidProfiles.fulfilled, (state, action) => {
      state.loading = false;

      state.customerUnpaidProfiles = Array.isArray(action.payload?.profiles)
        ? action.payload.profiles
        : [];

      state.customerInfo = action.payload?.customer || null;
    });

    builder.addCase(
      fetchCustomerUnpaidProfiles.rejected,
      (state, action: any) => {
        state.loading = false;

        state.customerUnpaidProfiles = [];

        state.customerInfo = null;

        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Fetch unpaid profiles failed";
      },
    );

    builder.addCase(fetchPaymentProfileDetail.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchPaymentProfileDetail.fulfilled, (state, action) => {
      state.loading = false;

      state.paymentProfile = action.payload;
    });

    builder.addCase(fetchPaymentProfileDetail.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch payment profile failed";
    });

    // ============================================
    // FETCH PAYMENT SUMMARY
    // ============================================

    builder.addCase(fetchPaymentSummaryByProfile.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchPaymentSummaryByProfile.fulfilled, (state, action) => {
      state.loading = false;

      state.paymentSummary = action.payload;
    });

    builder.addCase(fetchPaymentSummaryByProfile.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch payment summary failed";
    });

    // ============================================
    // FETCH AVAILABLE DISCOUNTS
    // ============================================

    builder.addCase(fetchAvailableDiscounts.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchAvailableDiscounts.fulfilled, (state, action) => {
      state.loading = false;

      state.availableDiscounts = action.payload.discounts || [];

      if (action.payload.profile) {
        state.paymentProfile = action.payload.profile;
      }
    });

    builder.addCase(fetchAvailableDiscounts.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch available discounts failed";
    });

    // ============================================
    // CALCULATE DISCOUNT
    // ============================================

    builder.addCase(calculatePaymentDiscount.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(calculatePaymentDiscount.fulfilled, (state, action) => {
      state.loading = false;

      state.calculatedDiscount = action.payload;
    });

    builder.addCase(calculatePaymentDiscount.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Calculate discount failed";
    });

    // ============================================
    // CREATE PAYMENT
    // ============================================

    builder.addCase(createPayment.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(createPayment.fulfilled, (state, action) => {
      state.loading = false;

      state.paymentResult = action.payload;
    });

    builder.addCase(createPayment.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Create payment failed";
    });

    builder.addCase(fetchPaymentBills.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchPaymentBills.fulfilled, (state, action) => {
      state.loading = false;

      state.paymentBills = action.payload || [];
    });

    builder.addCase(fetchPaymentBills.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch payment bills failed";
    });

    builder.addCase(fetchPaymentBillDetail.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchPaymentBillDetail.fulfilled, (state, action) => {
      state.loading = false;

      state.paymentBillDetail = action.payload;
    });

    builder.addCase(fetchPaymentBillDetail.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch payment bill detail failed";
    });
  },
});

export const {
  clearPaymentError,
  clearCalculatedDiscount,
  clearPaymentResult,
  clearPaymentBillDetail,
  clearPaymentBills,
} = paymentSlice.actions;

export default paymentSlice.reducer;

// ============================================
// SELECTORS
// ============================================

export const selectCustomerUnpaidProfiles = (state: any): any[] =>
  state.payment.customerUnpaidProfiles || [];

export const selectPaymentCustomerInfo = (state: any) =>
  state.payment.customerInfo;

export const selectPaymentSummary = (state: any) =>
  state.payment.paymentSummary;

export const selectPaymentLoading = (state: any) => state.payment.loading;

export const selectPaymentProfile = (state: any) =>
  state.payment.paymentProfile;

export const selectAvailableDiscounts = (state: any) =>
  state.payment.availableDiscounts;

export const selectCalculatedDiscount = (state: any) =>
  state.payment.calculatedDiscount;

export const selectPaymentResult = (state: any) => state.payment.paymentResult;

export const selectPaymentError = (state: any) => state.payment.error;

export const selectPaymentBills = (state: any) => state.payment.paymentBills;

export const selectPaymentBillDetail = (state: any) =>
  state.payment.paymentBillDetail;
