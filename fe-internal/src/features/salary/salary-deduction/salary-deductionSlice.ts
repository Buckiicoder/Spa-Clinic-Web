import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getSalaryDeductionsAPI,
  getSalaryDeductionDetailAPI,
  createSalaryDeductionAPI,
} from "./salary-deductionAPI";

interface SalaryDeductionState {
  deductions: any[];
  loading: boolean;
  selectedDeduction: any | null;
}

const initialState: SalaryDeductionState = {
  deductions: [],
  loading: false,
  selectedDeduction: null,
};

// ================= FETCH ALL =================

export const fetchSalaryDeductions = createAsyncThunk(
  "salaryDeduction/fetchAll",
  async (keyword: string = "") => {
    const res = await getSalaryDeductionsAPI(keyword);
    return res.data;
  },
);

// ================= FETCH DETAIL =================

export const fetchSalaryDeductionDetail = createAsyncThunk(
  "salaryDeduction/fetchDetail",
  async (id: number) => {
    const res = await getSalaryDeductionDetailAPI(id);
    return res.data;
  },
);

// ================= CREATE =================

export const createSalaryDeduction = createAsyncThunk(
  "salaryDeduction/create",
  async (data: any) => {
    const res = await createSalaryDeductionAPI(data);
    return res.data;
  },
);

const salaryDeductionSlice = createSlice({
  name: "salaryDeduction",
  initialState,
  reducers: {
    clearSelectedDeduction: (state) => {
      state.selectedDeduction = null;
    },
  },

  extraReducers: (builder) => {
    // FETCH ALL
    builder.addCase(fetchSalaryDeductions.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      fetchSalaryDeductions.fulfilled,
      (state, action) => {
        state.loading = false;
        state.deductions = action.payload;
      },
    );

    builder.addCase(fetchSalaryDeductions.rejected, (state) => {
      state.loading = false;
    });

    // DETAIL
    builder.addCase(
      fetchSalaryDeductionDetail.fulfilled,
      (state, action) => {
        state.selectedDeduction = action.payload;
      },
    );

    // CREATE
    builder.addCase(
      createSalaryDeduction.fulfilled,
      (state, action) => {
        state.deductions.unshift(action.payload);
      },
    );
  },
});

export const { clearSelectedDeduction } =
  salaryDeductionSlice.actions;

export default salaryDeductionSlice.reducer;

// ================= SELECTORS =================

export const selectSalaryDeductions = (state: any) =>
  state.salaryDeduction.deductions;

export const selectSalaryDeductionLoading = (state: any) =>
  state.salaryDeduction.loading;

export const selectSelectedSalaryDeduction = (state: any) =>
  state.salaryDeduction.selectedDeduction;