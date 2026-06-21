import { Request, Response } from "express";
import { createBookingSchema } from "../validators/booking.schema.js";
import * as bookingService from "../services/booking.service.js";
import { getIO } from "../socket.js";
import { ChatCapacityService } from "../services/chat/chat-capacity.service.js";

export const createBookingPublic = async (req: Request, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const capacityCheck = await ChatCapacityService.isSlotAvailable(
      data.booking_date,
      data.booking_time,
      data.quantity,
    );

    if (!capacityCheck.available) {
      return res.status(400).json({
        message:
          "Khung giờ này đã đầy hoặc không tiếp nhận đủ số khách đã chọn, vui lòng chọn giờ khác",
      });
    }
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

    const capacityCheck = await ChatCapacityService.isSlotAvailable(
      data.booking_date,
      data.booking_time,
      data.quantity,
    );

    if (!capacityCheck.available) {
      return res.status(400).json({
        message:
          "Khung giờ này đã đầy hoặc không thể tiếp nhận số khách đã chọn, vui lòng chọn giờ khác",
      });
    }

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

    const bookingExist = await bookingService.getBookingById(id);

    if (!bookingExist) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const cleanData = {
      ...data,

      referrer_id: data.referrer_id ? Number(data.referrer_id) : null,
    };

    // customer
    await bookingService.upsertCustomer(bookingExist.customer_id, cleanData);

    // booking
    await bookingService.updateBooking(id, cleanData);

    const booking = await bookingService.getBookingById(id);

    getIO().to("reception").emit("booking:updated", booking);

    return res.json(booking);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
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
    io.to("doctor").emit("booking:updated", booking);

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

export const checkBookingCapacity = async (req: Request, res: Response) => {
  try {
    const { booking_date, booking_time } = req.query;

    const quantity = Number(req.query.quantity) || 1;
    if (!booking_date || !booking_time) {
      return res.status(400).json({
        message: "booking_date và booking_time là bắt buộc",
      });
    }

    const result = await ChatCapacityService.isSlotAvailable(
      booking_date as string,
      booking_time as string,
      quantity,
    );

    const suggestions = !result.available
      ? await ChatCapacityService.suggestSlots(booking_date as string, quantity)
      : [];

    return res.json({
      ...result,
      suggestions,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getDayCapacity = async (req: Request, res: Response) => {
  try {
    const { booking_date } = req.query;

    const quantity = Number(req.query.quantity) || 1;

    if (!booking_date) {
      return res.status(400).json({
        message: "booking_date bắt buộc",
      });
    }

    const slots = await ChatCapacityService.getDayCapacity(
      booking_date as string,
      quantity,
    );

    return res.json(slots);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
