import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getMyServiceHistoryAPI,
  updateMyProfileAPI,
  rescheduleSessionAPI,
} from "./customerAPI";

//
// =========================
// TYPES
// =========================
//

interface PaymentTransaction {
  id: number;

  transaction_code: string;

  payment_method: string;

  gateway_provider: string;

  amount: number;

  status: string;

  paid_at: string;

  payment_id: number;

  payment_code: string;
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

interface ServiceSession {
  id: number;
  profile_id: number;
  session_no: number;
  service_date: string;
  service_time: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  doctor_note: string | null;
  skin_reaction: string | null;
  customer_feedback: string | null;
  rating: number | null;
  booking_id: number | null;
  technician_id: number | null;
  technician_name: string | null;
}

interface NextSession {
  id: number;
  profile_id: number;
  session_no: number;
  service_date: string;
  service_time: string;
  status: string;
  booking_id: number | null;
  technician_id: number | null;
  technician_name: string | null;
}

interface ProfilePaymentSummary {
  payment_id: number;

  payment_code: string;

  status: string;

  final_amount: number;

  paid_amount: number;

  remaining_amount: number;
}

interface CustomerProfile {
  id: number;

  total_sessions: number;

  used_sessions: number;

  status: string;

  started_at: string;

  completed_at: string | null;

  created_at: string;

  service_id: number;
  service_name: string;

  package_id: number;
  package_name: string;
  package_price: number;
  package_total_sessions: number;

  unit: string;

  doctor_id: number | null;
  doctor_name: string | null;

  technician_id: number | null;
  latest_technician_name: string | null;

  total_paid: number;
  total_remaining: number;

  payments: ProfilePaymentSummary[];

  transactions: PaymentTransaction[];

  sessions: ServiceSession[];

  next_session: NextSession | null;
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

  total_spending: number;

  loading: boolean;

  error: string | null;

  rescheduleLoading: boolean;
}

//
// =========================
// INITIAL STATE
// =========================
//

const initialState: CustomerPortalState = {
  customer: null,

  profiles: [],

  total_spending: 0,

  loading: false,

  error: null,

  rescheduleLoading: false,
};

// FETCH SERVICE HISTORY
export const fetchMyServiceHistory = createAsyncThunk(
  "customerPortal/fetchMyServiceHistory",

  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyServiceHistoryAPI();

      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Lấy lịch sử dịch vụ thất bại",
      );
    }
  },
);

export const updateMyProfile = createAsyncThunk(
  "customerPortal/updateMyProfile",

  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await updateMyProfileAPI(payload);

      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Cập nhật hồ sơ thất bại");
    }
  },
);

export const rescheduleSession = createAsyncThunk(
  "customerPortal/rescheduleSession",

  async (
    data: {
      session_id: number;
      service_date: string;
      service_time: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await rescheduleSessionAPI(data);

      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Đổi lịch thất bại");
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
    builder.addCase(fetchMyServiceHistory.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(fetchMyServiceHistory.fulfilled, (state, action) => {
      state.loading = false;

      state.customer = action.payload.customer;

      state.profiles = action.payload.profiles;

      state.total_spending = action.payload.customer?.total_spending || 0;
    });

    builder.addCase(fetchMyServiceHistory.rejected, (state, action: any) => {
      state.loading = false;

      state.error = action.payload?.message || "Lấy dữ liệu thất bại";
    });

    builder.addCase(updateMyProfile.fulfilled, (state, action) => {
      state.customer = action.payload.customer;
    });

    //
    // RESCHEDULE SESSION
    //

    builder.addCase(rescheduleSession.pending, (state) => {
      state.rescheduleLoading = true;

      state.error = null;
    });

    builder.addCase(rescheduleSession.fulfilled, (state, action: any) => {
      state.rescheduleLoading = false;

      const { session_id, service_date, service_time } = action.payload;

      state.profiles.forEach((profile) => {
        //
        // update session
        //
        const session = profile.sessions?.find((s) => s.id === session_id);

        if (session) {
          session.service_date = service_date;
          session.service_time = service_time;
        }

        //
        // recalc next session
        //
        const today = new Date().toISOString().split("T")[0];

        const nextSession =
          profile.sessions
            ?.filter(
              (s) =>
                s.service_date >= today &&
                s.status !== "done" &&
                s.status !== "cancelled",
            )
            .sort((a, b) => a.service_date.localeCompare(b.service_date))[0] ||
          null;

        profile.next_session = nextSession;
      });
    });

    builder.addCase(rescheduleSession.rejected, (state, action: any) => {
      state.rescheduleLoading = false;

      state.error = action.payload?.message || "Đổi lịch thất bại";
    });
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

export const selectCustomerPortal = (state: any) =>
  state.customerPortal || initialState;

export const selectCustomerInfo = (state: any) =>
  state.customerPortal?.customer || null;

export const selectCustomerProfiles = (state: any) =>
  state.customerPortal?.profiles || [];

export const selectCustomerTotalSpending = (state: any) =>
  state.customerPortal?.total_spending || 0;

export const selectCustomerPortalLoading = (state: any) =>
  state.customerPortal?.loading || false;

export const selectCustomerPortalError = (state: any) =>
  state.customerPortal?.error || null;

export const selectRescheduleLoading = (state: any) =>
  state.customerPortal?.rescheduleLoading || false;
