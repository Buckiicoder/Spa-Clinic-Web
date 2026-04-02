import { Request, Response } from "express";
import { createBookingSchema } from "../validators/booking.schema.js";
import * as bookingService from "../services/booking.service.js";
import { getIO } from "../socket.js";

export const createBookingPublic = async (req: Request, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const phone = data.phone || null;
    const email = data.email || null;

    let user = await bookingService.findUserByContact(phone, email);

    // 👉 nếu chưa có user → tạo guest user
    if (!user) {
      user = await bookingService.createGuestUser(data.name, phone, email);
    }

    const created_by = req.user?.id;

    // 👉 tạo booking
    const booking = await bookingService.createBooking({
      customer_id: user.id,
      service_id: data.service_id,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      quantity: data.quantity,
      created_by: user.id
    });

    //Socket emit
    const io = getIO();
    io.to("reception").emit("booking:created", {
      ...booking,
      customer_name: user.name,
      phone: user.phone,
      email: user.email,
    });

    return res.json({
      message: "Booking created",
      booking,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
export const createBookingByStaff = async (req: Request, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const phone = data.phone || null;
    const email = data.email || null;

    let user = await bookingService.findUserByContact(phone, email);

    // 👉 nếu chưa có user → tạo guest user
    if (!user) {
      user = await bookingService.createGuestUser(data.name, phone, email);
    }

    const created_by = req.user?.id;

    // 👉 tạo booking
    const booking = await bookingService.createBooking({
      customer_id: user.id,
      service_id: data.service_id,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      quantity: data.quantity,
      created_by: req.user.id,
    });

    //Socket emit
    const io = getIO();
    io.to("reception").emit("booking:created", {
      ...booking,
      customer_name: user.name,
      phone: user.phone,
      email: user.email,
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

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const confirmBooking = async (req: Request, res: Response) => {
  const booking = await bookingService.confirmBooking(req.params.id);

  const io = getIO();
  io.to("reception").emit("booking:updated", booking);

  res.json(booking);
};

export const checkInBooking = async (req: Request, res: Response) => {
  const booking = await bookingService.checkInBooking(req.params.id);

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

export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const { phone, email } = req.query;

    if (!phone && !email) {
      return res.status(400).json({ message: "Missing query" });
    }

    const customers = await bookingService.searchCustomers(
      phone as string,
      email as string
    );

    return res.json(customers);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
