import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Shift } from "../../types/shift";
import {
  getShiftsAPI,
  createShiftAPI,
  updateShiftAPI,
  deleteShiftAPI,
} from "./shiftAPI";

interface ShiftState {
  shifts: Shift[];
  loading: boolean;
}

const initialState: ShiftState = {
  shifts: [],
  loading: false,
};

// 🔹 GET
export const fetchShifts = createAsyncThunk(
  "shift/fetch",
  async () => {
    const res = await getShiftsAPI();
    return res.data;
  }
);

// 🔹 CREATE
export const createShift = createAsyncThunk(
  "shift/create",
  async (data: {
    name: string;
    start_time: string;
    end_time: string;
  }) => {
    const res = await createShiftAPI(data);
    return res.data.shift;
  }
);

// 🔹 UPDATE
export const updateShift = createAsyncThunk(
  "shift/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<Shift>;
  }) => {
    const res = await updateShiftAPI(id, data);
    return res.data.shift;
  }
);

// 🔹 DELETE
export const deleteShift = createAsyncThunk(
  "shift/delete",
  async (id: number) => {
    await deleteShiftAPI(id);
    return id;
  }
);

const shiftSlice = createSlice({
  name: "shift",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchShifts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchShifts.fulfilled, (state, action) => {
      state.loading = false;
      state.shifts = action.payload;
    });
    builder.addCase(fetchShifts.rejected, (state) => {
      state.loading = false;
    });

    // CREATE
    builder.addCase(createShift.fulfilled, (state, action) => {
      state.shifts.push(action.payload);
    });

    // UPDATE
    builder.addCase(updateShift.fulfilled, (state, action) => {
      const index = state.shifts.findIndex(
        (s) => s.id === action.payload.id
      );
      if (index !== -1) {
        state.shifts[index] = action.payload;
      }
    });

    // DELETE
    builder.addCase(deleteShift.fulfilled, (state, action) => {
      state.shifts = state.shifts.filter(
        (s) => s.id !== action.payload
      );
    });
  },
});

export default shiftSlice.reducer;

export const selectShifts = (state: any) => state.shift.shifts;
