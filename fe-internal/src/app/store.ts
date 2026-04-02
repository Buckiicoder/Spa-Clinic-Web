import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import internalBookingReducer from '../features/internalBooking/bookingSlice'
import serviceReducer from '../features/service/serviceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    internalBooking: internalBookingReducer,
    service: serviceReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
