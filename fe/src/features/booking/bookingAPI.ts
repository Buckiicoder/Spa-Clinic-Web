import { api } from "../../services/api";

export const createBookingAPI = (data: any) =>
  api.post("/booking/customer", data);

// (sau này dùng)
export const getMyBookingsAPI = () =>
  api.get("/booking/me");
