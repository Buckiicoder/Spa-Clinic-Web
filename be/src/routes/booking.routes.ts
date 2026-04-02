import { Router } from "express";
import * as bookingService from "../controllers/booking.controller.js";
import { authCustomerMiddleware, authStaffMiddleware } from "../middleware/auth.middleware.js";
const router = Router();

router.post("/customer",bookingService. createBookingPublic);
router.post("/staff", authStaffMiddleware,bookingService. createBookingByStaff);

router.get("/", bookingService.getBookings);
router.get("/search", bookingService.searchCustomers);
router.get("/:id", bookingService.getBookingById);
router.patch("/:id/confirm", bookingService.confirmBooking);
router.patch("/:id/check-in", bookingService.checkInBooking);
router.delete("/:id", bookingService.deleteBooking);



export default router;