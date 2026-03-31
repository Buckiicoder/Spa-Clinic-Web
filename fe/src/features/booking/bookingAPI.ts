import { api } from "../../services/api";

export const createBookingAPI = (data: any) =>
  api.post("/booking", data);

// (sau này dùng)
export const getMyBookingsAPI = () =>
  api.get("/booking/me");
