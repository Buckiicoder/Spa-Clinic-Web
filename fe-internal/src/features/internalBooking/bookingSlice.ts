import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBookingsAPI, checkInBookingAPI, getBookingByIdAPI, createBookingAPI } from "./bookingAPI";
import { Booking } from "../../types/booking";

export const fetchBookings = createAsyncThunk(
  "internalBooking/fetch",
  async () => {
    const res = await getBookingsAPI();
    return res.data;
  },
);

export const fetchBookingById = createAsyncThunk(
  "internalBooking/fetchById",
  async (id: string) => {
    const res = await getBookingByIdAPI(id);
    return res.data;
  },
);

export const checkInBooking = createAsyncThunk(
  "internalBooking/checkin",
  async (id: string) => {
    const res = await checkInBookingAPI(id);
    return res.data;
  },
);

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

const slice = createSlice({
  name: "internalBooking",
  initialState: {
    bookings: [] as Booking[],
  },
  reducers: {
    bookingCreated: (state, action) => {
      state.bookings.unshift(action.payload);
    },
    bookingUpdated: (state, action) => {
      state.bookings = state.bookings.map((b) =>
        b.id === action.payload.id ? action.payload : b,
      );
    },
    bookingDeleted: (state, action) => {
      state.bookings = state.bookings.filter((b) => b.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })
      .addCase(checkInBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.map((b) =>
          b.id === action.payload.id ? action.payload : b,
        );
      });
  },
});

export const { bookingCreated, bookingUpdated, bookingDeleted } = slice.actions;

export default slice.reducer;
