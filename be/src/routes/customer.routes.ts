import { Router } from "express";

import {
  getCustomers,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  getMyServiceHistory
} from "../controllers/customer.controller.js";
import { authCustomerMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// ================= CUSTOMER =================

// GET ALL
router.get("/", getCustomers);

// GET DETAIL
router.get("/:id", getCustomerDetail);

// CREATE
router.post("/", createCustomer);

// UPDATE
router.put("/:id", updateCustomer);

router.get(
  "/me/service-history",
 authCustomerMiddleware, getMyServiceHistory
);

export default router;
