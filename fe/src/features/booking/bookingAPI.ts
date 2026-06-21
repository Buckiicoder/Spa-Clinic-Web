import { api } from "../../services/api";

export const createBookingAPI = (data: any) =>
  api.post("/booking/customer", data);

// (sau này dùng)
export const getMyBookingsAPI = () =>
  api.get("/booking/me");

export const getDayCapacityAPI = (
  bookingDate: string,
  quantity: number,
) =>
  api.get("/booking/capacity/day", {
    params: {
      booking_date: bookingDate,
      quantity,
    },
  });

export const checkBookingCapacityAPI = (
  booking_date: string,
  booking_time: string,
  quantity: number,
) =>
  api.get("/booking/capacity", {
    params: {
      booking_date,
      booking_time,
      quantity,
    },
  });

