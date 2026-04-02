import { api } from "../../services/api";

export const getBookingsAPI = () =>
  api.get("/booking");

export const getBookingByIdAPI = (id: string) => 
  api.get(`/booking/${id}`);

export const checkInBookingAPI = (id: string) =>
  api.patch(`/booking/${id}/check-in`);

export const createBookingAPI = (data: any) =>
  api.post("/booking/staff", data);