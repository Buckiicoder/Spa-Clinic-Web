import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getDashboardOverviewAPI,
  getLowStockProductsAPI,
  getTopAttendanceStaffsAPI,
  getLateStaffsAPI,
  getTopDoctorRevenueAPI,
  getTopTechnicianRevenueAPI,
  getTopVipCustomersAPI,
  getTopLoyalCustomersAPI,
  getMostBookedServicesAPI,
  getLeastBookedServicesAPI,
  getMostBookedPackagesAPI,
  getLeastBookedPackagesAPI,
  getRevenueStatisticsAPI,
} from "./dashboardAPI";

// ======================================================
// TYPES
// ======================================================

interface DashboardState {
  loading: boolean;

  overview: any | null;

  lowStockProducts: any[];

  topAttendanceStaffs: any[];
  lateStaffs: any[];

  topDoctorRevenue: any[];
  topTechnicianRevenue: any[];

  topVipCustomers: any[];
  topLoyalCustomers: any[];

  mostBookedServices: any[];
  leastBookedServices: any[];

  mostBookedPackages: any[];
  leastBookedPackages: any[];

  revenueStatistics: any | null;
}

const initialState: DashboardState = {
  loading: false,

  overview: null,

  lowStockProducts: [],

  topAttendanceStaffs: [],
  lateStaffs: [],

  topDoctorRevenue: [],
  topTechnicianRevenue: [],

  topVipCustomers: [],
  topLoyalCustomers: [],

  mostBookedServices: [],
  leastBookedServices: [],

  mostBookedPackages: [],
  leastBookedPackages: [],

  revenueStatistics: null,
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

// ======================================================
// PRODUCTS
// ======================================================

export const fetchLowStockProducts = createAsyncThunk(
  "dashboard/lowStockProducts",
  async (limit: number = 10) => {
    const res = await getLowStockProductsAPI(limit);

    return res.data;
  },
);

// ======================================================
// STAFF
// ======================================================

export const fetchTopAttendanceStaffs = createAsyncThunk(
  "dashboard/topAttendanceStaffs",
  async (limit: number = 10) => {
    const res = await getTopAttendanceStaffsAPI(limit);

    return res.data;
  },
);

export const fetchLateStaffs = createAsyncThunk(
  "dashboard/lateStaffs",
  async (limit: number = 10) => {
    const res = await getLateStaffsAPI(limit);

    return res.data;
  },
);

export const fetchTopDoctorRevenue = createAsyncThunk(
  "dashboard/topDoctorRevenue",
  async (limit: number = 10) => {
    const res = await getTopDoctorRevenueAPI(limit);

    return res.data;
  },
);

export const fetchTopTechnicianRevenue = createAsyncThunk(
  "dashboard/topTechnicianRevenue",
  async (limit: number = 10) => {
    const res = await getTopTechnicianRevenueAPI(limit);

    return res.data;
  },
);

// ======================================================
// CUSTOMERS
// ======================================================

export const fetchTopVipCustomers = createAsyncThunk(
  "dashboard/topVipCustomers",
  async (limit: number = 10) => {
    const res = await getTopVipCustomersAPI(limit);

    return res.data;
  },
);

export const fetchTopLoyalCustomers = createAsyncThunk(
  "dashboard/topLoyalCustomers",
  async (limit: number = 10) => {
    const res = await getTopLoyalCustomersAPI(limit);

    return res.data;
  },
);

// ======================================================
// SERVICES
// ======================================================

export const fetchMostBookedServices = createAsyncThunk(
  "dashboard/mostBookedServices",
  async (limit: number = 10) => {
    const res = await getMostBookedServicesAPI(limit);

    return res.data;
  },
);

export const fetchLeastBookedServices = createAsyncThunk(
  "dashboard/leastBookedServices",
  async (limit: number = 10) => {
    const res = await getLeastBookedServicesAPI(limit);

    return res.data;
  },
);

export const fetchMostBookedPackages = createAsyncThunk(
  "dashboard/mostBookedPackages",
  async (limit: number = 10) => {
    const res = await getMostBookedPackagesAPI(limit);

    return res.data;
  },
);

export const fetchLeastBookedPackages = createAsyncThunk(
  "dashboard/leastBookedPackages",
  async (limit: number = 10) => {
    const res = await getLeastBookedPackagesAPI(limit);

    return res.data;
  },
);

// ======================================================
// REVENUE
// ======================================================

export const fetchRevenueStatistics = createAsyncThunk(
  "dashboard/revenueStatistics",
  async () => {
    const res = await getRevenueStatisticsAPI();

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

      state.lowStockProducts = [];

      state.topAttendanceStaffs = [];
      state.lateStaffs = [];

      state.topDoctorRevenue = [];
      state.topTechnicianRevenue = [];

      state.topVipCustomers = [];
      state.topLoyalCustomers = [];

      state.mostBookedServices = [];
      state.leastBookedServices = [];

      state.mostBookedPackages = [];
      state.leastBookedPackages = [];

      state.revenueStatistics = null;
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

    // ======================================================
    // PRODUCTS
    // ======================================================

    builder.addCase(fetchLowStockProducts.fulfilled, (state, action) => {
      state.loading = false;

      state.lowStockProducts = action.payload;
    });

    // ======================================================
    // STAFF
    // ======================================================

    builder.addCase(fetchTopAttendanceStaffs.fulfilled, (state, action) => {
      state.loading = false;

      state.topAttendanceStaffs = action.payload;
    });

    builder.addCase(fetchLateStaffs.fulfilled, (state, action) => {
      state.loading = false;

      state.lateStaffs = action.payload;
    });

    builder.addCase(fetchTopDoctorRevenue.fulfilled, (state, action) => {
      state.loading = false;

      state.topDoctorRevenue = action.payload;
    });

    builder.addCase(fetchTopTechnicianRevenue.fulfilled, (state, action) => {
      state.loading = false;

      state.topTechnicianRevenue = action.payload;
    });

    // ======================================================
    // CUSTOMERS
    // ======================================================

    builder.addCase(fetchTopVipCustomers.fulfilled, (state, action) => {
      state.loading = false;

      state.topVipCustomers = action.payload;
    });

    builder.addCase(fetchTopLoyalCustomers.fulfilled, (state, action) => {
      state.loading = false;

      state.topLoyalCustomers = action.payload;
    });

    // ======================================================
    // SERVICES
    // ======================================================

    builder.addCase(fetchMostBookedServices.fulfilled, (state, action) => {
      state.loading = false;

      state.mostBookedServices = action.payload;
    });

    builder.addCase(fetchLeastBookedServices.fulfilled, (state, action) => {
      state.loading = false;

      state.leastBookedServices = action.payload;
    });

    builder.addCase(fetchMostBookedPackages.fulfilled, (state, action) => {
      state.loading = false;

      state.mostBookedPackages = action.payload;
    });

    builder.addCase(fetchLeastBookedPackages.fulfilled, (state, action) => {
      state.loading = false;

      state.leastBookedPackages = action.payload;
    });

    // ======================================================
    // REVENUE
    // ======================================================

    builder.addCase(fetchRevenueStatistics.fulfilled, (state, action) => {
      state.loading = false;

      state.revenueStatistics = action.payload;
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

// PRODUCTS
export const selectLowStockProducts = (state: any) =>
  state.dashboard?.lowStockProducts || [];

// STAFF
export const selectTopAttendanceStaffs = (state: any) =>
  state.dashboard?.topAttendanceStaffs || [];

export const selectLateStaffs = (state: any) =>
  state.dashboard?.lateStaffs || [];

export const selectTopDoctorRevenue = (state: any) =>
  state.dashboard?.topDoctorRevenue || [];

export const selectTopTechnicianRevenue = (state: any) =>
  state.dashboard?.topTechnicianRevenue || [];

// CUSTOMERS
export const selectTopVipCustomers = (state: any) =>
  state.dashboard?.topVipCustomers || [];

export const selectTopLoyalCustomers = (state: any) =>
  state.dashboard?.topLoyalCustomers || [];

// SERVICES
export const selectMostBookedServices = (state: any) =>
  state.dashboard?.mostBookedServices || [];

export const selectLeastBookedServices = (state: any) =>
  state.dashboard?.leastBookedServices || [];

export const selectMostBookedPackages = (state: any) =>
  state.dashboard?.mostBookedPackages || [];

export const selectLeastBookedPackages = (state: any) =>
  state.dashboard?.leastBookedPackages || [];

// REVENUE
export const selectRevenueStatistics = (state: any) =>
  state.dashboard?.revenueStatistics || null;
