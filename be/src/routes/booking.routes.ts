import { Router } from "express";
import * as bookingService from "../controllers/booking.controller.js";
const router = Router();

router.post("/", bookingService.createBooking);
router.get("/", bookingService.getBookings);
router.patch("/:id/confirm", bookingService.confirmBooking);
router.delete("/:id", bookingService.deleteBooking);


export default router;