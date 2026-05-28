import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  assignStaffSalaryAPI,
  getStaffSalaryDetailAPI,
  getAllStaffSalariesAPI,
} from "./staff-salaryAPI";

interface StaffSalaryState {
  salaries: any[];
  loading: boolean;
  selectedSalary: any | null;
}

const initialState: StaffSalaryState = {
  salaries: [],
  loading: false,
  selectedSalary: null,
};

// ================= FETCH ALL =================

export const fetchAllStaffSalaries = createAsyncThunk(
  "staffSalary/fetchAll",
  async () => {
    const res = await getAllStaffSalariesAPI();
    return res.data;
  },
);

// ================= FETCH DETAIL =================

export const fetchStaffSalaryDetail = createAsyncThunk(
  "staffSalary/fetchDetail",
  async (staffId: number) => {
    const res = await getStaffSalaryDetailAPI(staffId);
    return res.data;
  },
);

// ================= ASSIGN =================

export const assignStaffSalary = createAsyncThunk(
  "staffSalary/assign",
  async (data: any) => {
    const res = await assignStaffSalaryAPI(data);
    return res.data;
  },
);

const staffSalarySlice = createSlice({
  name: "staffSalary",
  initialState,
  reducers: {
    clearSelectedStaffSalary: (state) => {
      state.selectedSalary = null;
    },
  },

  extraReducers: (builder) => {
    // FETCH ALL
    builder.addCase(fetchAllStaffSalaries.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      fetchAllStaffSalaries.fulfilled,
      (state, action) => {
        state.loading = false;
        state.salaries = action.payload;
      },
    );

    builder.addCase(fetchAllStaffSalaries.rejected, (state) => {
      state.loading = false;
    });

    // DETAIL
    builder.addCase(
      fetchStaffSalaryDetail.fulfilled,
      (state, action) => {
        state.selectedSalary = action.payload;
      },
    );

    // ASSIGN
    builder.addCase(
      assignStaffSalary.fulfilled,
      (state, action) => {
        const index = state.salaries.findIndex(
          (s) => s.staff_id === action.payload.staff_id,
        );

        if (index !== -1) {
          state.salaries[index] = action.payload;
        } else {
          state.salaries.unshift(action.payload);
        }

        state.selectedSalary = action.payload;
      },
    );
  },
});

export const { clearSelectedStaffSalary } =
  staffSalarySlice.actions;

export default staffSalarySlice.reducer;

// ================= SELECTORS =================

export const selectStaffSalaries = (state: any) =>
  state.staffSalary.salaries;

export const selectStaffSalaryLoading = (state: any) =>
  state.staffSalary.loading;

export const selectSelectedStaffSalary = (state: any) =>
  state.staffSalary.selectedSalary;