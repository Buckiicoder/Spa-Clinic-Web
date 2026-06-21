import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createBookingAPI,
  checkBookingCapacityAPI,
  getDayCapacityAPI,
} from "./bookingAPI";

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

  capacity: CapacityResponse | null;
  checkingCapacity: boolean;

  dayCapacity: DayCapacitySlot[];
  loadingDayCapacity: boolean;
}

interface CapacityResponse {
  available: boolean;
  bookingCount: number;
  staff: number;
  maxCapacity: number;

  suggestions?: {
    time: string;
    booking: number;
    capacity: number;
  }[];
}

interface DayCapacitySlot {
  time: string;
  available: boolean;
  bookingCount: number;
  maxCapacity: number;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
  success: false,

  capacity: null,
  checkingCapacity: false,

  dayCapacity: [],
  loadingDayCapacity: false,
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
  },
);

export const checkBookingCapacity = createAsyncThunk(
  "booking/checkCapacity",
  async (
    {
      booking_date,
      booking_time,
      quantity
    }: {
      booking_date: string;
      booking_time: string;
      quantity: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await checkBookingCapacityAPI(booking_date, booking_time, quantity);

      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Không kiểm tra được lịch");
    }
  },
);

export const getDayCapacity = createAsyncThunk(
  "booking/dayCapacity",
  async (
    {
      bookingDate,
      quantity,
    }: {
      bookingDate: string;
      quantity: number;
    }
  ) => {
    const res = await getDayCapacityAPI(
      bookingDate,
      quantity,
    );

    return res.data;
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

    builder.addCase(checkBookingCapacity.pending, (state) => {
      state.checkingCapacity = true;
    });

    builder.addCase(checkBookingCapacity.fulfilled, (state, action) => {
      state.checkingCapacity = false;
      state.capacity = action.payload;
    });

    builder.addCase(checkBookingCapacity.rejected, (state) => {
      state.checkingCapacity = false;
    });

    builder.addCase(getDayCapacity.pending, (state) => {
      state.loadingDayCapacity = true;
    });

    builder.addCase(getDayCapacity.fulfilled, (state, action) => {
      state.loadingDayCapacity = false;
      state.dayCapacity = action.payload;
    });

    builder.addCase(getDayCapacity.rejected, (state) => {
      state.loadingDayCapacity = false;
      state.dayCapacity = [];
    });
  },
});

export const { resetBookingState } = bookingSlice.actions;

export default bookingSlice.reducer;

export const selectBooking = (state: any) => state.booking;
export const selectBookingLoading = (state: any) => state.booking.loading;
export const selectBookingSuccess = (state: any) => state.booking.success;
export const selectBookingCapacity = (state: any) => state.booking.capacity;
export const selectCheckingCapacity = (state: any) =>
  state.booking.checkingCapacity;
export const selectDayCapacity = (state: any) => state.booking.dayCapacity;

export const selectLoadingDayCapacity = (state: any) =>
  state.booking.loadingDayCapacity;
