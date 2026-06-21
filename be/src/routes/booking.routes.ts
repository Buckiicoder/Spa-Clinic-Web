import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";
import {
  authCustomerMiddleware,
  authStaffMiddleware,
} from "../middleware/auth.middleware.js";
const router = Router();

router.post("/customer", bookingController.createBookingPublic);
router.post(
  "/staff",
  authStaffMiddleware,
  bookingController.createBookingByStaff,
);

router.get("/", authStaffMiddleware, bookingController.getBookings);
router.get("/search", bookingController.searchCustomers);
router.get("/capacity", bookingController.checkBookingCapacity);
router.get("/capacity/day", bookingController.getDayCapacity);
router.get("/:id", bookingController.getBookingById);
router.patch(
  "/:id",
  authStaffMiddleware,
  bookingController.updateBookingAndCustomer,
);
router.patch(
  "/:id/check-in",
  authStaffMiddleware,
  bookingController.checkInBooking,
);
router.delete("/:id", authStaffMiddleware, bookingController.deleteBooking);

export default router;
