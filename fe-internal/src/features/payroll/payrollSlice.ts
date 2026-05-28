import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  fetchPayrollsAPI,
  generatePayrollAPI,
  generateMultiplePayrollsAPI,
  regeneratePayrollAPI,

  //test tính lương thủ công
  runDailyPayrollSyncAPI,
} from "./payrollAPI";

interface PayrollState {
  loading: boolean;
  payrolls: any[];
  payroll: any | null;
  multiplePayrolls: any[];
  error: string | null;
}

const initialState: PayrollState = {
  loading: false,
  payrolls: [],
  payroll: null,
  multiplePayrolls: [],
  error: null,
};

export const fetchPayrolls = createAsyncThunk(
  "payroll/fetchPayrolls",

  async (params?: {
    keyword?: string;
    employee_type?: string;
    salary_unit?: string;
    month?: number;
    year?: number;
  }) => {
    const res = await fetchPayrollsAPI(params);
    return res.data;
  },
);

export const generatePayroll = createAsyncThunk(
  "payroll/generate",

  async (data: {
    staff_id: number;
    month: number;
    year: number;
    payroll_status?: string;
    note?: string | null;
  }) => {
    const res = await generatePayrollAPI(data);

    return res.data;
  },
);

export const generateMultiplePayrolls = createAsyncThunk(
  "payroll/generateMultiple",

  async (data: { staff_ids: number[]; month: number; year: number }) => {
    const res = await generateMultiplePayrollsAPI(data);

    return res.data;
  },
);

export const regeneratePayroll = createAsyncThunk(
  "payroll/regenerate",

  async (data: { staff_id: number; month: number; year: number }) => {
    const res = await regeneratePayrollAPI(data);

    return res.data;
  },
);

export const runDailyPayrollSync =
  createAsyncThunk(
    "payroll/runDailyPayrollSync",

    async (_, thunkAPI) => {
      const res =
        await runDailyPayrollSyncAPI();

      // reload payroll list
      await thunkAPI.dispatch(
        fetchPayrolls(),
      );

      return res.data;
    },
  );
const payrollSlice = createSlice({
  name: "payroll",

  initialState,

  reducers: {
    clearPayroll: (state) => {
      state.payroll = null;
    },

    clearPayrollError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchPayrolls.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchPayrolls.fulfilled, (state, action) => {
      state.loading = false;
      state.payrolls = action.payload;
    });

    builder.addCase(fetchPayrolls.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(generatePayroll.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(generatePayroll.fulfilled, (state, action) => {
      state.loading = false;
      state.payroll = action.payload.data;
    });

    builder.addCase(generatePayroll.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Generate payroll failed";
    });

    builder.addCase(generateMultiplePayrolls.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(generateMultiplePayrolls.fulfilled, (state, action) => {
      state.loading = false;

      state.multiplePayrolls = action.payload.data;
    });

    builder.addCase(generateMultiplePayrolls.rejected, (state, action) => {
      state.loading = false;

      state.error = action.error.message || "Generate multiple payroll failed";
    });

    builder.addCase(regeneratePayroll.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(regeneratePayroll.fulfilled, (state, action) => {
      state.loading = false;
      state.payroll = action.payload.data;
    });

    builder.addCase(regeneratePayroll.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Regenerate payroll failed";
    });



    builder.addCase(
  runDailyPayrollSync.pending,
  (state) => {
    state.loading = true;
    state.error = null;
  },
);

builder.addCase(
  runDailyPayrollSync.fulfilled,
  (state) => {
    state.loading = false;
  },
);

builder.addCase(
  runDailyPayrollSync.rejected,
  (state, action) => {
    state.loading = false;

    state.error =
      action.error.message ||
      "Daily payroll sync failed";
  },
);
  },
});

export const { clearPayroll, clearPayrollError } = payrollSlice.actions;



export default payrollSlice.reducer;

export const selectPayrollLoading = (state: any) => state.payroll.loading;

export const selectPayroll = (state: any) => state.payroll.payroll;

export const selectPayrolls = (state: any) =>
  state.payroll.payrolls;

export const selectMultiplePayrolls = (state: any) =>
  state.payroll.multiplePayrolls;

export const selectPayrollError = (state: any) => state.payroll.error;
