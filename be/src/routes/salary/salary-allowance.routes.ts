import { Router } from "express";

import {
  getSalaryAllowances,
  getSalaryAllowanceDetail,
  createSalaryAllowance
} from "../../controllers/salary/salary-allowance.controller.js";

const router = Router();

// ================= ALLOWANCE =================

// GET ALL
router.get("/", getSalaryAllowances);

router.get("/:id", getSalaryAllowanceDetail);

// CREATE
router.post("/", createSalaryAllowance);

export default router;