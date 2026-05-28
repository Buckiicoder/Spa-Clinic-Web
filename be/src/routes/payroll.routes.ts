import { Router } from "express";

import {
  generatePayrollController,
  generateMultiplePayrollsController,
  regeneratePayrollController,
  getPayrollsController,
  runPayrollDailySyncController // hàm đồng bộ tính lương thủ công, không cần đợi hết ngày
} from "../controllers/payroll.controller.js";

const router = Router();

router.get("/", getPayrollsController);

router.post("/generate", generatePayrollController);

router.post("/daily-sync",runPayrollDailySyncController);

router.post("/generate-multiple", generateMultiplePayrollsController);

router.post("/regenerate", regeneratePayrollController);

export default router;
