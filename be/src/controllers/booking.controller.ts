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

    if (!user) {
      user = await bookingService.createGuestUser(data.name, phone, email);
    }

    const bookingRaw = await bookingService.createBooking({
      customer_id: user.id,
      service_id: data.service_id,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      quantity: data.quantity,
      created_by: user.id,
      note: data.note,
    });

    const booking = await bookingService.getBookingById(bookingRaw.id);

    getIO().to("reception").emit("booking:created", booking);

    res.json({
      message: "Booking created",
      booking,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const createBookingByStaff = async (req: Request, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const phone = data.phone || null;
    const email = data.email || null;

    // 🔹 1. tìm user
    let user = await bookingService.findUserByContact(phone, email);

    // 🔹 2. chưa có → tạo
    if (!user) {
      user = await bookingService.createGuestUser(data.name, phone, email);
    }

    // 🔹 3. tạo customer (internal info)
    await bookingService.upsertCustomer(user.id, data);

    // 🔹 4. tạo booking
    const bookingRaw = await bookingService.createBooking({
      customer_id: user.id,
      service_id: data.service_id,
      booking_date: data.booking_date,
      booking_time: data.booking_time,
      quantity: data.quantity,
      created_by: req.user.id,
      note: data.note,
    });

    const booking = await bookingService.getBookingById(bookingRaw.id);

    getIO().to("reception").emit("booking:created", booking);

    res.json({
      message: "Booking created",
      booking,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
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

export const updateBookingAndCustomer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // 🔹 clean data
    const cleanData = {
      ...data,
      referrer_id: data.referrer_id === "" ? null : Number(data.referrer_id),
    };

    // 🔹 1. update booking
    const bookingRaw = await bookingService.updateBooking(id, cleanData);

    if (!bookingRaw) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await bookingService.upsertCustomer(bookingRaw.customer_id, cleanData);

    // 🔹 3. get full booking
    const booking = await bookingService.getBookingById(id);

    getIO().to("reception").emit("booking:updated", booking);

    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const checkInBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const bookingRaw = await bookingService.checkInBooking(id, req.user.id);

    if (!bookingRaw) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔹 update visit
    await bookingService.updateCustomerVisit(bookingRaw.customer_id);

    const booking = await bookingService.getBookingById(id);

    const io = getIO();
    io.to("reception").emit("booking:updated", booking);

    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

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
      email as string,
    );

    return res.json(customers);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
