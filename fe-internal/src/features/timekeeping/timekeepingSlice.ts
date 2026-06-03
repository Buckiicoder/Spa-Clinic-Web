import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTimekeepingAPI,
  getTimekeepingByDateAPI,
  createTimekeepingAPI,
  updateTimekeepingAPI,
  approveOffAPI,
  rejectOffAPI,
  checkInAPI,
  checkOutAPI,
  startBreakAPI,
  endBreakAPI,
  deleteTimekeepingAPI,
} from "./timekeepingAPI";

interface TimekeepingState {
  records: any[];
  selectedDateRecords: any[];
  loading: boolean;
}

const initialState: TimekeepingState = {
  records: [],
  selectedDateRecords: [],
  loading: false,
};

//
// 🔹 GET
//
export const fetchTimekeeping = createAsyncThunk(
  "timekeeping/fetch",
  async ({
    month,
    year,
    user_id,
  }: {
    month: number;
    year: number;
    user_id?: number;
  }) => {
    const res = await getTimekeepingAPI(month, year, user_id);
    return res.data || [];
  },
);

//
// 🔹 GET chi tiết theo ngày
//
export const fetchTimekeepingByDate = createAsyncThunk(
  "timekeeping/fetchByDate",
  async ({ user_id, work_date }: { user_id: number; work_date: string }) => {
    const res = await getTimekeepingByDateAPI(user_id, work_date);

    return res.data.data || [];
  },
);

export const createTimekeeping = createAsyncThunk(
  "timekeeping/create",
  async (records: any[], thunkAPI) => {
    try {
      const payload = {
        records,
      };

      console.log("CREATE TIMEKEEPING PAYLOAD", payload);

      const res = await createTimekeepingAPI(payload);

      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Đăng ký lịch thất bại",
      );
    }
  },
);

export const updateTimekeeping = createAsyncThunk(
  "timekeeping/update",
  async ({ id, data }: { id: number; data: any }) => {
    const res = await updateTimekeepingAPI(id, data);
    return res.data.data;
  },
);

//
// 🔹 APPROVE / REJECT OFF REQUEST
//
export const approveOff = createAsyncThunk(
  "timekeeping/approveOff",
  async (id: number, thunkAPI) => {
    try {
      const res = await approveOffAPI(id);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Không thể duyệt nghỉ",
      );
    }
  },
);

export const rejectOff = createAsyncThunk(
  "timekeeping/rejectOff",
  async (id: number, thunkAPI) => {
    try {
      const res = await rejectOffAPI(id);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Không thể từ chối nghỉ",
      );
    }
  },
);

export const checkIn = createAsyncThunk(
  "timekeeping/checkIn",
  async ({ id, lat, lng }: { id: number; lat?: number; lng?: number }) => {
    const res = await checkInAPI(id, lat, lng);
    return res.data.data;
  },
);

export const checkOut = createAsyncThunk(
  "timekeeping/checkOut",
  async ({ id, lat, lng }: { id: number; lat?: number; lng?: number }) => {
    const res = await checkOutAPI(id, lat, lng);
    return res.data.data;
  },
);

//
// 🔹 BREAK
//
export const startBreak = createAsyncThunk(
  "timekeeping/startBreak",
  async (id: number) => {
    const res = await startBreakAPI(id);
    return res.data.data;
  },
);

export const endBreak = createAsyncThunk(
  "timekeeping/endBreak",
  async (id: number) => {
    const res = await endBreakAPI(id);
    return res.data.data;
  },
);

//
// 🔹 DELETE
//
export const deleteTimekeeping = createAsyncThunk(
  "timekeeping/delete",
  async (id: number) => {
    await deleteTimekeepingAPI(id);
    return id;
  },
);

//
// 🔹 SLICE
//
const timekeepingSlice = createSlice({
  name: "timekeeping",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ================= FETCH =================
    builder.addCase(fetchTimekeeping.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchTimekeeping.fulfilled, (state, action) => {
      state.loading = false;
      state.records = action.payload;
    });

    builder.addCase(fetchTimekeeping.rejected, (state) => {
      state.loading = false;
    });

    // FETCH BY DATE
    // ================= FETCH BY DATE =================

    builder.addCase(fetchTimekeepingByDate.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchTimekeepingByDate.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedDateRecords = action.payload;
    });

    builder.addCase(fetchTimekeepingByDate.rejected, (state) => {
      state.loading = false;
    });

    // ================= CREATE =================
    builder.addCase(createTimekeeping.fulfilled, (state, action) => {
      state.records.push(action.payload);
    });

    // ================= UPDATE =================
    builder.addCase(updateTimekeeping.fulfilled, (state, action) => {
      const index = state.records.findIndex(
        (r) => Number(r.id) === Number(action.payload.id),
      );

      if (index !== -1) {
        state.records[index] = action.payload;
      }
    });

    // ================= APPROVE OFF =================
    builder.addCase(approveOff.fulfilled, (state, action) => {
      const updated = action.payload;

      const index = state.records.findIndex(
        (r) => Number(r.id) === Number(updated.id),
      );

      if (index !== -1) {
        state.records[index] = {
          ...state.records[index],
          ...updated,
        };
      }
    });

    // ================= REJECT OFF =================
    builder.addCase(rejectOff.fulfilled, (state, action) => {
      const updated = action.payload;

      const index = state.records.findIndex(
        (r) => Number(r.id) === Number(updated.id),
      );

      if (index !== -1) {
        state.records[index] = {
          ...state.records[index],
          ...updated,
        };
      }
    });

    // ================= CHECK-IN =================
    builder.addCase(checkIn.fulfilled, (state, action) => {
      const index = state.records.findIndex(
        (r) => Number(r.id) === Number(action.payload.id),
      );

      if (index !== -1) {
        state.records[index] = action.payload;
      }
    });

    // ================= CHECK-OUT =================
    builder.addCase(checkOut.fulfilled, (state, action) => {
      const index = state.records.findIndex(
        (r) => Number(r.id) === Number(action.payload.id),
      );

      if (index !== -1) {
        state.records[index] = action.payload;
      }
    });

    // ================= BREAK =================
    builder.addCase(startBreak.fulfilled, (state, action) => {
      const index = state.records.findIndex(
        (r) => Number(r.id) === Number(action.payload.id),
      );

      if (index !== -1) {
        state.records[index] = action.payload;
      }
    });

    builder.addCase(endBreak.fulfilled, (state, action) => {
      const index = state.records.findIndex(
        (r) => Number(r.id) === Number(action.payload.id),
      );

      if (index !== -1) {
        state.records[index] = action.payload;
      }
    });

    // ================= DELETE =================
    builder.addCase(deleteTimekeeping.fulfilled, (state, action) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    });
  },
});

export const selectTimekeepingRecords = (state: any) =>
  state.timekeeping.records;

export const selectTimekeepingLoading = (state: any) =>
  state.timekeeping.loading;

export default timekeepingSlice.reducer;

export const selectSelectedDateRecords = (state: any) =>
  state.timekeeping.selectedDateRecords;
