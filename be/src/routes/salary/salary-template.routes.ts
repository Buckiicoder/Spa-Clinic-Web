import { Router } from "express";

import {
  getSalaryTemplates,
  getSalaryTemplateDetail,
  createSalaryTemplate,
  updateSalaryTemplate,
} from "../../controllers/salary/salary-template.controller.js";

const router = Router();

// ================= TEMPLATE =================

// GET ALL
router.get("/", getSalaryTemplates);

// GET DETAIL
router.get("/:id", getSalaryTemplateDetail);

// CREATE
router.post("/", createSalaryTemplate);

// UPDATE
router.put("/:id", updateSalaryTemplate);

export default router;