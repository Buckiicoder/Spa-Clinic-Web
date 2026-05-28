import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getCustomersAPI,
  getCustomerDetailAPI,
  createCustomerAPI,
  updateCustomerAPI,
} from "./customerAPI";

// ================= TYPES =================

interface CustomerState {
  customers: any[];

  selectedCustomer: any | null;

  loading: boolean;

  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: CustomerState = {
  customers: [],

  selectedCustomer: null,

  loading: false,

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// ================= CUSTOMER =================

// FETCH ALL
export const fetchCustomers = createAsyncThunk(
  "customer/fetchCustomers",
  async (params: any = {}) => {
    const res = await getCustomersAPI(params);
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

// CREATE
export const createCustomer = createAsyncThunk(
  "customer/create",
  async (data: any) => {
    const res = await createCustomerAPI(data);
    return res.data;
  },
);

// UPDATE
export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: any;
  }) => {
    const res = await updateCustomerAPI(id, data);

    return {
      id,
      data: res.data,
    };
  },
);

// ================= SLICE =================

const customerSlice = createSlice({
  name: "customer",

  initialState,

  reducers: {
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
  },

  extraReducers: (builder) => {
    // ================= FETCH ALL =================

    builder.addCase(fetchCustomers.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      state.loading = false;

      state.customers = action.payload.data;

      state.pagination = action.payload.pagination;
    });

    builder.addCase(fetchCustomers.rejected, (state) => {
      state.loading = false;
    });

    // ================= DETAIL =================

    builder.addCase(fetchCustomerDetail.fulfilled, (state, action) => {
      state.selectedCustomer = action.payload;
    });

    // ================= CREATE =================

    builder.addCase(createCustomer.fulfilled, (state, action) => {
      state.customers.unshift({
        ...action.payload.user,
        ...action.payload.customer,
      });
    });

    // ================= UPDATE =================

    builder.addCase(updateCustomer.fulfilled, (state, action) => {
      const index = state.customers.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (index !== -1) {
        state.customers[index] = {
          ...state.customers[index],
          ...action.payload.data,
        };
      }

      if (
  state.selectedCustomer?.customer?.id ===
  action.payload.id
) {
  state.selectedCustomer.customer = {
    ...state.selectedCustomer.customer,
    ...action.payload.data,
  };
}
    });
  },
});

export const { clearSelectedCustomer } =
  customerSlice.actions;

export default customerSlice.reducer;

// ================= SELECTORS =================

export const selectCustomers = (state: any) =>
  state.customer.customers;

export const selectSelectedCustomer = (state: any) =>
  state.customer.selectedCustomer;

export const selectCustomerPagination = (state: any) =>
  state.customer.pagination;

export const selectCustomerLoading = (state: any) =>
  state.customer.loading;