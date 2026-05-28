import { Router } from "express";

import {
  getDiscounts,
  getDiscountDetail,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discount.controller.js";

const router = Router();

// GET ALL DISCOUNTS
router.get("/", getDiscounts);

// GET DETAIL DISCOUNT
router.get("/:id", getDiscountDetail);

// CREATE DISCOUNT
router.post("/", createDiscount);

// UPDATE DISCOUNT
router.put("/:id", updateDiscount);

// DELETE DISCOUNT
router.delete("/:id", deleteDiscount);

export default router;