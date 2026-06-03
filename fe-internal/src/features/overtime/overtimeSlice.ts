import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchTimekeepingDailyViewAPI,
  approveOvertimeRequestAPI,
  cancelOvertimeRequestAPI,
  createOvertimeRequestAPI,
  fetchMyOvertimeRequestsAPI,
  fetchOvertimeRequestDetailAPI,
  fetchOvertimeRequestsAPI,
  rejectOvertimeRequestAPI,
} from "./overtimeAPI";

// ======================================================
// STATE
// ======================================================

interface OvertimeState {
  loading: boolean;

  timekeepingLoading: boolean; // 👈 thêm

  timekeepingDaily: any[];

  overtimeRequests: any[];

  myOvertimeRequests: any[];

  overtimeRequest: any | null;

  error: string | null;
}

const initialState: OvertimeState = {
  loading: false,

  timekeepingLoading: false, // 👈 thêm

  timekeepingDaily: [],

  overtimeRequests: [],

  myOvertimeRequests: [],

  overtimeRequest: null,

  error: null,
};

// ======================================================
// GET ALL
// ======================================================
export const fetchTimekeepingDailyView = createAsyncThunk(
  "overtime/fetchDailyView",
  async (params: { date: string; status?: string }) => {
    const res = await fetchTimekeepingDailyViewAPI(params);
    return res.data;
  },
);

export const fetchOvertimeRequests = createAsyncThunk(
  "overtime/fetchAll",

  async (params?: {
    keyword?: string;
    status?: string;
    user_id?: number;
    from_date?: string;
    to_date?: string;
  }) => {
    const res = await fetchOvertimeRequestsAPI(params);

    return res.data;
  },
);

// ======================================================
// GET MY REQUESTS
// ======================================================

export const fetchMyOvertimeRequests = createAsyncThunk(
  "overtime/fetchMy",

  async () => {
    const res = await fetchMyOvertimeRequestsAPI();

    return res.data;
  },
);

// ======================================================
// GET DETAIL
// ======================================================

export const fetchOvertimeRequestDetail = createAsyncThunk(
  "overtime/fetchDetail",

  async (id: number) => {
    const res = await fetchOvertimeRequestDetailAPI(id);

    return res.data;
  },
);

// ======================================================
// CREATE
// ======================================================

export const createOvertimeRequest = createAsyncThunk(
  "overtime/create",

  async (data: {
    user_id: number;

    timekeeping_id: number;

    work_date: string;

    requested_start_time: string | null;

    requested_end_time: string | null;

    requested_minutes: number;

    reason: string | null;
  }) => {
    const res = await createOvertimeRequestAPI(data);

    return res.data;
  },
);

// ======================================================
// APPROVE
// ======================================================

export const approveOvertimeRequest = createAsyncThunk(
  "overtime/approve",

  async ({
    id,
    data,
  }: {
    id: number;

    data: {
      approved_by: number;

      approved_minutes: number;
    };
  }) => {
    const res = await approveOvertimeRequestAPI(
      id,
      data,
    );

    return res.data;
  },
);

export const rejectOvertimeRequest = createAsyncThunk(
  "overtime/reject",

  async ({
    id,
    data,
  }: {
    id: number;

    data: {
      approved_by: number;

      reject_reason: string;
    };
  }) => {
    const res = await rejectOvertimeRequestAPI(id, data);

    return res.data;
  },
);

// ======================================================
// CANCEL
// ======================================================

export const cancelOvertimeRequest = createAsyncThunk(
  "overtime/cancel",

  async (id: number) => {
    const res = await cancelOvertimeRequestAPI(id);

    return res.data;
  },
);

// ======================================================
// SLICE
// ======================================================

const overtimeSlice = createSlice({
  name: "overtime",

  initialState,

  reducers: {
    clearOvertimeError: (state) => {
      state.error = null;
    },

    clearOvertimeDetail: (state) => {
      state.overtimeRequest = null;
    },
  },

  extraReducers: (builder) => {
    // ============================================
    // FETCH ALL
    // ============================================

    builder.addCase(fetchTimekeepingDailyView.pending, (state) => {
      state.timekeepingLoading = true;
    });

    builder.addCase(fetchTimekeepingDailyView.fulfilled, (state, action) => {
      state.timekeepingLoading = false;
      state.timekeepingDaily = action.payload;
    });

    builder.addCase(fetchTimekeepingDailyView.rejected, (state, action) => {
      state.timekeepingLoading = false;
      state.error = action.error.message || "Fetch timekeeping failed";
    });

    builder.addCase(fetchOvertimeRequests.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchOvertimeRequests.fulfilled, (state, action) => {
      state.loading = false;

      state.overtimeRequests = action.payload;
    });

    builder.addCase(fetchOvertimeRequests.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch overtime requests failed";
    });

    // ============================================
    // FETCH MY
    // ============================================

    builder.addCase(fetchMyOvertimeRequests.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchMyOvertimeRequests.fulfilled, (state, action) => {
      state.loading = false;

      state.myOvertimeRequests = action.payload;
    });

    builder.addCase(fetchMyOvertimeRequests.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch my overtime requests failed";
    });

    // ============================================
    // DETAIL
    // ============================================

    builder.addCase(fetchOvertimeRequestDetail.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchOvertimeRequestDetail.fulfilled, (state, action) => {
      state.loading = false;

      state.overtimeRequest = action.payload;
    });

    builder.addCase(fetchOvertimeRequestDetail.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Fetch overtime detail failed";
    });

    // ============================================
    // CREATE
    // ============================================

    builder.addCase(createOvertimeRequest.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(createOvertimeRequest.fulfilled, (state, action) => {
      state.loading = false;

      state.overtimeRequest = action.payload.request;
    });

    builder.addCase(createOvertimeRequest.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Create overtime request failed";
    });

    // ============================================
    // APPROVE
    // ============================================

    builder.addCase(approveOvertimeRequest.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(approveOvertimeRequest.fulfilled, (state, action) => {
      state.loading = false;

      state.overtimeRequest = action.payload.request;
    });

    builder.addCase(approveOvertimeRequest.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Approve overtime request failed";
    });

    // ============================================
    // REJECT
    // ============================================

    builder.addCase(rejectOvertimeRequest.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(rejectOvertimeRequest.fulfilled, (state, action) => {
      state.loading = false;

      state.overtimeRequest = action.payload.request;
    });

    builder.addCase(rejectOvertimeRequest.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Reject overtime request failed";
    });

    // ============================================
    // CANCEL
    // ============================================

    builder.addCase(cancelOvertimeRequest.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(cancelOvertimeRequest.fulfilled, (state, action) => {
      state.loading = false;

      state.overtimeRequest = action.payload.request;
    });

    builder.addCase(cancelOvertimeRequest.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Cancel overtime request failed";
    });
  },
});

// ======================================================
// EXPORTS
// ======================================================

export const { clearOvertimeError, clearOvertimeDetail } =
  overtimeSlice.actions;

export default overtimeSlice.reducer;

// ======================================================
// SELECTORS
// ======================================================
export const selectTimekeepingDaily = (state: any) =>
  state?.overtime?.timekeepingDaily ?? [];

export const selectTimekeepingDailyLoading = (state: any) =>
  state.overtime.timekeepingLoading;

export const selectOvertimeLoading = (state: any) => state.overtime.loading;

export const selectPendingOvertimeRequests = (state: any) =>
  (state.overtime.overtimeRequests || []).filter(
    (x: any) => x.status === "PENDING",
  );

export const selectOvertimeRequests = (state: any) =>
  state.overtime.overtimeRequests;

export const selectMyOvertimeRequests = (state: any) =>
  state.overtime.myOvertimeRequests;

export const selectOvertimeRequest = (state: any) =>
  state.overtime.overtimeRequest;

export const selectOvertimeError = (state: any) => state.overtime.error;
