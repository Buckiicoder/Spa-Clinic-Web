import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBookingsAPI,
  checkInBookingAPI,
  getBookingByIdAPI,
  createBookingPublicAPI,
  createBookingStaffAPI,
  updateBookingAPI,
  searchCustomersAPI,
  deleteBookingAPI,
  getDayCapacityAPI,
  checkBookingCapacityAPI,
} from "./bookingAPI";
import { Booking, CapacityResponse, DayCapacityItem } from "../../types/booking";

interface BookingState {
  bookings: Booking[];
  customers: any[];

  capacity: CapacityResponse | null;
  dayCapacity: DayCapacityItem[];

  checkingCapacity: boolean;
  loadingDayCapacity: boolean;
}

const initialState: BookingState = {
  bookings: [],
  customers: [],

  capacity: null,
  dayCapacity: [],

  checkingCapacity: false,
  loadingDayCapacity: false,
};


export const fetchBookings = createAsyncThunk(
  "booking/fetch",
  async () => {
    const res = await getBookingsAPI();
    return res.data;
  }
);

export const fetchBookingById = createAsyncThunk(
  "booking/fetchById",
  async (id: string) => {
    const res = await getBookingByIdAPI(id);
    return res.data;
  }
);

export const checkInBooking = createAsyncThunk(
  "booking/checkin",
  async (id: string) => {
    const res = await checkInBookingAPI(id);
    return res.data;
  }
);

export const createBookingStaff = createAsyncThunk(
  "booking/createStaff",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await createBookingStaffAPI(data);
      return res.data.booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Đặt lịch thất bại");
    }
  }
);

export const createBookingPublic = createAsyncThunk(
  "booking/createPublic",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await createBookingPublicAPI(data);
      return res.data.booking;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Đặt lịch thất bại");
    }
  }
);

export const updateBooking = createAsyncThunk(
  "booking/update",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await updateBookingAPI(id, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Update thất bại");
    }
  }
);

export const deleteBooking = createAsyncThunk(
  "booking/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteBookingAPI(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Delete thất bại");
    }
  }
);

export const searchCustomers = createAsyncThunk(
  "booking/searchCustomers",
  async (params: { phone?: string; email?: string }) => {
    const res = await searchCustomersAPI(params);
    return res.data;
  }
);

export const checkBookingCapacity = createAsyncThunk(
  "booking/checkCapacity",
  async (
    {
      booking_date,
      booking_time,
      quantity,
    }: {
      booking_date: string;
      booking_time: string;
      quantity: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await checkBookingCapacityAPI(
        booking_date,
        booking_time,
        quantity
      );

      return res.data as CapacityResponse;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Không kiểm tra được capacity"
      );
    }
  }
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
    const res = await getDayCapacityAPI(bookingDate,
      quantity,);

    return res.data as DayCapacityItem[];
  }
);

const slice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    bookingCreated: (state, action) => {
      state.bookings.unshift(action.payload);
    },
    bookingUpdated: (state, action) => {
      state.bookings = state.bookings.map((b) =>
        b.id === action.payload.id ? action.payload : b
      );
    },
    bookingDeleted: (state, action) => {
      state.bookings = state.bookings.filter(
        (b) => b.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 fetch
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookings = action.payload;
      })

      // 🔹 create
      .addCase(createBookingStaff.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
      })
      .addCase(createBookingPublic.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
      })

      // 🔹 update
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.map((b) =>
          b.id === action.payload.id ? action.payload : b
        );
      })

      // 🔹 checkin
      .addCase(checkInBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.map((b) =>
          b.id === action.payload.id ? action.payload : b
        );
      })

      // 🔹 delete
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(
          (b) => b.id !== action.payload
        );
      })

      // 🔹 search customer
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })

      .addCase(checkBookingCapacity.pending, (state) => {
  state.checkingCapacity = true;
})

.addCase(checkBookingCapacity.fulfilled, (state, action) => {
  state.checkingCapacity = false;
  state.capacity = action.payload;
})

.addCase(checkBookingCapacity.rejected, (state) => {
  state.checkingCapacity = false;
})

.addCase(getDayCapacity.pending, (state) => {
  state.loadingDayCapacity = true;
})

.addCase(getDayCapacity.fulfilled, (state, action) => {
  state.loadingDayCapacity = false;
  state.dayCapacity = action.payload;
})

.addCase(getDayCapacity.rejected, (state) => {
  state.loadingDayCapacity = false;
})
  },
});

export const { bookingCreated, bookingUpdated, bookingDeleted } = slice.actions;

export default slice.reducer;

export const selectBookingCapacity = (state: any) =>
  state.internalBooking.capacity;

export const selectDayCapacity = (state: any) =>
  state.internalBooking.dayCapacity;

export const selectCheckingCapacity = (state: any) =>
  state.internalBooking.checkingCapacity;

export const selectLoadingDayCapacity = (state: any) =>
  state.internalBooking.loadingDayCapacity;