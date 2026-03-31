import { Request, Response } from "express";
import { createBookingSchema } from "../validators/booking.schema.js";
import * as bookingService from "../services/booking.service.js";
import { getIO } from "../socket.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const phone = data.phone || null;
    const email = data.email || null;

    let user = await bookingService.findUserByContact(phone, email);

    // 👉 nếu chưa có user → tạo guest user
    if (!user) {
      user = await bookingService.createGuestUser(data.name, phone, email);
    }

    // 👉 tạo booking
    const booking = await bookingService.createBooking({
      customer_id: user.id,
      ...data,
    });

    //Socket emit
    const io = getIO();
    io.to("reception").emit("booking:created", {
      ...booking,
      customer_name: user.name,
      phone: user.phone,
    });

    return res.json({
      message: "Booking created",
      booking,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  const bookings = await bookingService.getBookings();
  res.json(bookings);
};

export const confirmBooking = async (req: Request, res: Response) => {
  const booking = await bookingService.confirmBooking(req.params.id);

  const io = getIO();
  io.to("reception").emit("booking:updated", booking);

  res.json(booking);
};

export const deleteBooking = async (req: Request, res: Response) => {
  await bookingService.deleteBooking(req.params.id);

  const io = getIO();
  io.to("reception").emit("booking:deleted", req.params.id);

  res.json({ success: true });
};
