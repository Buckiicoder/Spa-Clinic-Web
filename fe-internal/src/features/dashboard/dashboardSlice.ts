import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getDashboardOverviewAPI,
  getRevenueByDateRangeAPI,
} from "./dashboardAPI";

// ======================================================
// TYPES
// ======================================================

interface DashboardState {
  loading: boolean;

  overview: any | null;

  weeklyRevenue: any[];
}

const initialState: DashboardState = {
  loading: false,

  overview: null,

  weeklyRevenue: [],
};

// ======================================================
// OVERVIEW
// ======================================================

export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/overview",
  async () => {
    const res = await getDashboardOverviewAPI();

    return res.data;
  },
);

export const fetchRevenueByDateRange = createAsyncThunk(
  "dashboard/revenueByDateRange",
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const res = await getRevenueByDateRangeAPI(startDate, endDate);

    return res.data;
  },
);

// ======================================================
// SLICE
// ======================================================

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    clearDashboardState: (state) => {
      state.overview = null;

      state.weeklyRevenue = [];
    },
  },

  extraReducers: (builder) => {
    // ======================================================
    // OVERVIEW
    // ======================================================

    builder.addCase(fetchDashboardOverview.fulfilled, (state, action) => {
      state.loading = false;

      state.overview = action.payload;
    });

    builder.addCase(fetchRevenueByDateRange.fulfilled, (state, action) => {
      state.loading = false;

      state.weeklyRevenue = action.payload || [];
    });

    builder.addMatcher(
      (action) => action.type.endsWith("/pending"),
      (state) => {
        state.loading = true;
      },
    );

    builder.addMatcher(
      (action) => action.type.endsWith("/rejected"),
      (state) => {
        state.loading = false;
      },
    );
  },
});

export const { clearDashboardState } = dashboardSlice.actions;

export default dashboardSlice.reducer;

// ======================================================
// SELECTORS
// ======================================================

export const selectDashboardLoading = (state: any) =>
  state.dashboard?.loading || false;

export const selectDashboardOverview = (state: any) =>
  state.dashboard?.overview || null;

export const selectLowStockProducts = (state: any) =>
  state.dashboard?.overview?.products?.low_stock_products || [];

export const selectTopAttendanceStaffs = (state: any) =>
  state.dashboard?.overview?.staffs?.top_attendance_staffs || [];

export const selectTopDoctorRevenue = (state: any) =>
  state.dashboard?.overview?.staffs?.top_doctor_revenue || [];

export const selectTopTechnicianRevenue = (state: any) =>
  state.dashboard?.overview?.staffs?.top_technician_revenue || [];

export const selectTopVipCustomers = (state: any) =>
  state.dashboard?.overview?.customers?.vip_customers || [];

export const selectMostBookedServices = (state: any) =>
  state.dashboard?.overview?.services?.top_booked_services || [];

export const selectMostBookedPackages = (state: any) =>
  state.dashboard?.overview?.services?.top_booked_packages || [];

export const selectRevenueStatistics = (state: any) =>
  state.dashboard?.overview?.revenues || {};

export const selectWeeklyRevenue = (state: any) =>
  state.dashboard?.weeklyRevenue;
