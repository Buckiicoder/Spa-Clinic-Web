import { Router } from "express";

import {
  assignStaffSalary,
  getStaffSalaryDetail,
  getAllStaffSalaries,
} from "../../controllers/salary/staff-salary.controller.js";

const router = Router();

// ================= STAFF SALARY =================

// GET ALL
router.get("/", getAllStaffSalaries);

// GET DETAIL
router.get("/:staffId", getStaffSalaryDetail);

// ASSIGN / UPDATE STAFF SALARY
router.post("/", assignStaffSalary);

export default router;