import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { getMyServiceHistoryAPI } from "./customerAPI";

//
// =========================
// TYPES
// =========================
//

interface PaymentTransaction {
  transaction_id: number;

  transaction_code: string;

  payment_method: string;

  gateway_provider: string;

  amount: number;

  status: string;

  paid_at: string;

  note: string;
}

interface PaymentItem {
  payment_item_id: number;

  profile_id: number;

  item_type: string;

  item_name: string;

  quantity: number;

  unit_price: number;

  subtotal_amount: number;

  discount_amount: number;

  final_amount: number;
}

interface Payment {
  id: number;

  payment_code: string;

  subtotal_amount: number;

  discount_amount: number;

  final_amount: number;

  paid_amount: number;

  remaining_amount: number;

  status: string;

  note: string;

  created_at: string;

  payment_items: PaymentItem[];

  transactions: PaymentTransaction[];
}

interface CustomerProfile {
  id: number;

  customer_id: number;

  total_sessions: number;

  used_sessions: number;

  status: string;

  started_at: string;

  completed_at: string;

  note: string;

  created_at: string;

  service_id: number;

  service_name: string;

  service_area: string;

  package_id: number;

  package_name: string;

  package_price: number;

  package_total_sessions: number;

  unit: string;

  doctor_id: number;

  doctor_name: string;

  technician_id: number;

  technician_name: string;

  payments: Payment[];
}

interface CustomerInfo {
  id: number;

  name: string;

  phone: string;

  email: string;

  avatar: string | null;

  gender: string;

  dob: string;

  city: string;

  ward: string;

  address_detail: string;

  is_active: boolean;

  is_verified: boolean;

  created_at: string;

  updated_at: string;

  total_spending: number;

  rank: string;

  total_visits: number;

  first_visit_at: string;

  last_visit_at: string;

  loyalty_points: number;
}

interface CustomerPortalState {
  customer: CustomerInfo | null;

  profiles: CustomerProfile[];

  payments: Payment[];

  total_spending: number;

  loading: boolean;

  error: string | null;
}

//
// =========================
// INITIAL STATE
// =========================
//

const initialState: CustomerPortalState = {
  customer: null,

  profiles: [],

  payments: [],

  total_spending: 0,

  loading: false,

  error: null,
};

//
// =========================
// FETCH SERVICE HISTORY
// =========================
//

export const fetchMyServiceHistory =
  createAsyncThunk(
    "customerPortal/fetchMyServiceHistory",

    async (_, { rejectWithValue }) => {
      try {
        const res =
          await getMyServiceHistoryAPI();

        return res.data;
      } catch (err: any) {
        return rejectWithValue(
          err.response?.data ||
            "Lấy lịch sử dịch vụ thất bại",
        );
      }
    },
  );

//
// =========================
// SLICE
// =========================
//

const customerPortalSlice = createSlice({
  name: "customerPortal",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    //
    // FETCH HISTORY
    //
    builder.addCase(
      fetchMyServiceHistory.pending,
      (state) => {
        state.loading = true;

        state.error = null;
      },
    );

    builder.addCase(
      fetchMyServiceHistory.fulfilled,
      (state, action) => {
        state.loading = false;

        state.customer =
          action.payload.customer;

        state.profiles =
          action.payload.profiles;

        state.payments =
          action.payload.payments;

        state.total_spending =
          action.payload.customer?.total_spending || 0;
      },
    );

    builder.addCase(
      fetchMyServiceHistory.rejected,
      (state, action: any) => {
        state.loading = false;

        state.error =
          action.payload?.message ||
          "Lấy dữ liệu thất bại";
      },
    );
  },
});

//
// =========================
// EXPORT
// =========================
//

export default customerPortalSlice.reducer;

//
// =========================
// SELECTORS
// =========================
//

export const selectCustomerPortal = (
  state: any,
) => state.customerPortal || initialState;

export const selectCustomerInfo = (
  state: any,
) => state.customerPortal?.customer || null;

export const selectCustomerProfiles = (
  state: any,
) => state.customerPortal?.profiles || [];

export const selectCustomerPayments = (
  state: any,
) => state.customerPortal?.payments || [];

export const selectCustomerTotalSpending = (
  state: any,
) => state.customerPortal?.total_spending || 0;

export const selectCustomerPortalLoading = (
  state: any,
) => state.customerPortal?.loading || false;

export const selectCustomerPortalError = (
  state: any,
) => state.customerPortal?.error || null;