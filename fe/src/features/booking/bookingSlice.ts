import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createBookingAPI } from "./bookingAPI";

interface Booking {
  id: number;
  booking_code: string;
  booking_date: string;
  booking_time: string;
  status: string;
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
  success: false,
};

export const createBooking = createAsyncThunk(
  "booking/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await createBookingAPI(data);
      return res.data.booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Đặt lịch thất bại");
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetBookingState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.bookings.unshift(action.payload);
    });

    builder.addCase(createBooking.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload?.message || "Booking failed";
    });
  },
});

export const { resetBookingState } = bookingSlice.actions;

export default bookingSlice.reducer;

export const selectBooking = (state: any) => state.booking;
export const selectBookingLoading = (state: any) => state.booking.loading;
export const selectBookingSuccess = (state: any) => state.booking.success;
