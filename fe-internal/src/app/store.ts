import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import internalBookingReducer from "../features/internalBooking/bookingSlice";
import serviceReducer from "../features/service/serviceSlice";
import shiftReducer from "../features/shift/shiftSlice";
import scheduleReducer from "../features/schedule/scheduleSlice";
import staffReducer from "../features/staff/staffSlice";
import positionReducer from "../features/position/positionSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    internalBooking: internalBookingReducer,
    service: serviceReducer,
    shift: shiftReducer,
    schedule: scheduleReducer,
    staff: staffReducer,
    position: positionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
