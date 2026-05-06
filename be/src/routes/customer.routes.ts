import { Router } from "express";
import {
  getCustomers,
  getCustomerDetail,
  createCustomerProfile,
  getProfilesByCustomer,
  createSession,
  getSessionsByProfile,
} from "../controllers/customer.controller.js";

const router = Router();

// ================= CUSTOMER =================
router.get("/", getCustomers);
router.get("/:id", getCustomerDetail);

// ================= PROFILE =================
router.post("/profile", createCustomerProfile);
router.get("/profile/:customerId", getProfilesByCustomer);

// ================= SESSION =================
router.post("/session", createSession);
router.get("/session/:profileId", getSessionsByProfile);

export default router;
