import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import bookingReducer from '../features/booking/bookingSlice'
import serviceReducer from '../features/service/serviceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    service: serviceReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
