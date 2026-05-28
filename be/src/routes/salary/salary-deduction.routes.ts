import { Router } from "express";

import {
  getSalaryDeductions,
  getSalaryDeductionDetail,
  createSalaryDeduction
} from "../../controllers/salary/salary-deduction.controller.js";

const router = Router();

// ================= DEDUCTION =================

// GET ALL
router.get("/", getSalaryDeductions);

// GET DETAIL
router.get("/:id", getSalaryDeductionDetail);

// CREATE
router.post("/", createSalaryDeduction);

export default router;