import { Router } from "express";

import {
  getCustomers,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  updateMyProfile,
  getMyServiceHistory,
  rescheduleSession
} from "../controllers/customer.controller.js";
import { authCustomerMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// ================= CUSTOMER =================

// GET ALL
router.get("/", getCustomers);

router.put("/me/profile", authCustomerMiddleware, updateMyProfile);

router.get(
  "/me/service-history",
 authCustomerMiddleware, getMyServiceHistory
);

// RESCHEDULE SESSION
router.put(
  "/me/sessions/reschedule",
  authCustomerMiddleware,
  rescheduleSession,
);

// GET DETAIL
router.get("/:id", getCustomerDetail);

// CREATE
router.post("/", createCustomer);

// UPDATE
router.put("/:id", updateCustomer);

export default router;
