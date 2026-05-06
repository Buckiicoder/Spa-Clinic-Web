import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCustomersAPI,
  getCustomerDetailAPI,
  createCustomerProfileAPI,
  getProfilesByCustomerAPI,
  createSessionAPI,
  getSessionsByProfileAPI,
} from "./customerAPI";

// ================= TYPES =================
interface CustomerState {
  customers: any[];
  selectedCustomer: any | null;

  profiles: any[];
  sessionsByProfile: Record<number, any[]>;

  loading: boolean;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,

  profiles: [],
  sessionsByProfile: {},

  loading: false,
};

// ================= CUSTOMER =================

// FETCH ALL
export const fetchCustomers = createAsyncThunk(
  "customer/fetchAll",
  async () => {
    const res = await getCustomersAPI();
    return res.data;
  },
);

// FETCH DETAIL
export const fetchCustomerDetail = createAsyncThunk(
  "customer/fetchDetail",
  async (id: number) => {
    const res = await getCustomerDetailAPI(id);
    return res.data;
  },
);

// ================= PROFILE =================

// CREATE PROFILE
export const createCustomerProfile = createAsyncThunk(
  "customer/createProfile",
  async (data: any) => {
    const res = await createCustomerProfileAPI(data);
    return res.data;
  },
);

// GET PROFILES
export const fetchProfilesByCustomer = createAsyncThunk(
  "customer/fetchProfiles",
  async (customerId: number) => {
    const res = await getProfilesByCustomerAPI(customerId);
    return res.data;
  },
);

// ================= SESSION =================

// CREATE SESSION
export const createSession = createAsyncThunk(
  "customer/createSession",
  async (data: any) => {
    const res = await createSessionAPI(data);
    return res.data;
  },
);

// GET SESSIONS
export const fetchSessionsByProfile = createAsyncThunk(
  "customer/fetchSessions",
  async (profileId: number) => {
    const res = await getSessionsByProfileAPI(profileId);
    return res.data;
  },
);

// ================= SLICE =================

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
      state.profiles = [];
      state.sessionsByProfile = {};
    },
  },
  extraReducers: (builder) => {
    // ================= CUSTOMER =================

    builder.addCase(fetchCustomers.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      state.loading = false;
      state.customers = action.payload;
    });

    builder.addCase(fetchCustomers.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(fetchCustomerDetail.fulfilled, (state, action) => {
      state.selectedCustomer = action.payload;
    });

    // ================= PROFILE =================

    builder.addCase(fetchProfilesByCustomer.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });

    builder.addCase(createCustomerProfile.fulfilled, (state, action) => {
      state.profiles.unshift(action.payload);
    });

    // ================= SESSION =================

    builder.addCase(fetchSessionsByProfile.fulfilled, (state, action) => {
      const profileId = action.meta.arg;
      state.sessionsByProfile[profileId] = action.payload;
    });

    builder.addCase(createSession.fulfilled, (state, action) => {
      const profileId = action.payload.profile_id;

      if (!state.sessionsByProfile[profileId]) {
        state.sessionsByProfile[profileId] = [];
      }

      state.sessionsByProfile[profileId].push(action.payload);
    });
  },
});

export const { clearSelectedCustomer } = customerSlice.actions;

export default customerSlice.reducer;

// ================= SELECTORS =================

export const selectCustomers = (state: any) => state.customer.customers;

export const selectSelectedCustomer = (state: any) =>
  state.customer.selectedCustomer;

export const selectProfiles = (state: any) => state.customer.profiles;

export const selectSessionsByProfile = (profileId: number) => (state: any) =>
  state.customer.sessionsByProfile[profileId] || [];

export const selectCustomerLoading = (state: any) => state.customer.loading;
