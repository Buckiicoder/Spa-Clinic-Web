import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getSalaryAllowancesAPI,
  getSalaryAllowanceDetailAPI,
  createSalaryAllowanceAPI}
from "./salary-allowanceAPI";

interface SalaryAllowanceState {
  allowances: any[];
  loading: boolean;
  selectedAllowance: any | null;
}

const initialState: SalaryAllowanceState = {
  allowances: [],
  loading: false,
  selectedAllowance: null,
};

// ================= FETCH ALL =================

export const fetchSalaryAllowances = createAsyncThunk(
  "salaryAllowance/fetchAll",
  async (keyword: string = "") => {
    const res = await getSalaryAllowancesAPI(keyword);
    return res.data;
  },
);

// ================= FETCH DETAIL =================

export const fetchSalaryAllowanceDetail = createAsyncThunk(
  "salaryAllowance/fetchDetail",
  async (id: number) => {
    const res = await getSalaryAllowanceDetailAPI(id);
    return res.data;
  },
);

// ================= CREATE =================

export const createSalaryAllowance = createAsyncThunk(
  "salaryAllowance/create",
  async (data: any) => {
    const res = await createSalaryAllowanceAPI(data);
    return res.data;
  },
);

const salaryAllowanceSlice = createSlice({
  name: "salaryAllowance",
  initialState,
  reducers: {
    clearSelectedAllowance: (state) => {
      state.selectedAllowance = null;
    },
  },

  extraReducers: (builder) => {
    // FETCH ALL
    builder.addCase(fetchSalaryAllowances.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      fetchSalaryAllowances.fulfilled,
      (state, action) => {
        state.loading = false;
        state.allowances = action.payload;
      },
    );

    builder.addCase(fetchSalaryAllowances.rejected, (state) => {
      state.loading = false;
    });

    // DETAIL
    builder.addCase(
      fetchSalaryAllowanceDetail.fulfilled,
      (state, action) => {
        state.selectedAllowance = action.payload;
      },
    );

    // CREATE
    builder.addCase(
      createSalaryAllowance.fulfilled,
      (state, action) => {
        state.allowances.unshift(action.payload);
      },
    );
  },
});

export const { clearSelectedAllowance } =
  salaryAllowanceSlice.actions;

export default salaryAllowanceSlice.reducer;

// ================= SELECTORS =================

export const selectSalaryAllowances = (state: any) =>
  state.salaryAllowance.allowances;

export const selectSalaryAllowanceLoading = (state: any) =>
  state.salaryAllowance.loading;

export const selectSelectedSalaryAllowance = (state: any) =>
  state.salaryAllowance.selectedAllowance;