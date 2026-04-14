import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getScheduleAPI,
  createSchedulePeriodAPI,
  updateSchedulePeriodAPI,
  setScheduleDaysAPI,
} from "./scheduleAPI";

interface ScheduleState {
  period: any | null;
  days: any[];
  loading: boolean;
}

const initialState: ScheduleState = {
  period: null,
  days: [],
  loading: false,
};

//
// 🔹 GET SCHEDULE (theo tháng)
//
export const fetchSchedule = createAsyncThunk(
  "schedule/fetch",
  async ({ month, year }: { month: number; year: number }) => {
    const res = await getScheduleAPI(month, year);
    return {
  period: res.data?.period || null,
  days: res.data?.days || [],
};
  },
);

//
// 🔹 CREATE PERIOD
//
export const createSchedulePeriod = createAsyncThunk(
  "schedule/createPeriod",
  async (data: {
    month: number;
    year: number;
    status?: string;
    open_from?: string;
    open_to?: string;
  }) => {
    const res = await createSchedulePeriodAPI(data);
    return res.data.period;
  },
);

//
// 🔹 UPDATE PERIOD
//
export const updateSchedulePeriod = createAsyncThunk(
  "schedule/updatePeriod",
  async ({ id, data }: { id: number; data: any }) => {
    const res = await updateSchedulePeriodAPI(id, data);
    return res.data.period;
  },
);

//
// 🔹 SET DAYS (bulk)
//
export const setScheduleDays = createAsyncThunk(
  "schedule/setDays",
  async (data: {
    period_id: number;
    days: {
      work_date: string;
      shift_id: number;
      employee_type: "FULLTIME" | "PARTTIME";
      max_employee?: number;
    }[];
  }) => {
    const res = await setScheduleDaysAPI(data);
    return res.data.days;
  },
);

//
// 🔹 SLICE
//
const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchSchedule.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSchedule.fulfilled, (state, action) => {
      state.loading = false;
      state.period = action.payload.period;
      state.days = action.payload.days;
    });
    builder.addCase(fetchSchedule.rejected, (state) => {
      state.loading = false;
    });

    // CREATE PERIOD
    builder.addCase(createSchedulePeriod.fulfilled, (state, action) => {
      state.period = action.payload;
    });

    // UPDATE PERIOD
    builder.addCase(updateSchedulePeriod.fulfilled, (state, action) => {
      state.period = action.payload;
    });

    // SET DAYS
    builder.addCase(setScheduleDays.fulfilled, (state, action) => {
      state.days = action.payload;
    });
  },
});

export default scheduleSlice.reducer;

// SELECTOR
export const selectSchedule = (state: any) => state.schedule;
export const selectSchedulePeriod = (state: any) => state.schedule.period;
export const selectScheduleDays = (state: any) => state.schedule.days;
