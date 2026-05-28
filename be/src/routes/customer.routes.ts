import { Router } from "express";

import {
  getCustomers,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
} from "../controllers/customer.controller.js";

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

export default router;
