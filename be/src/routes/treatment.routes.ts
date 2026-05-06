import { Router } from "express";
import * as controller from "../controllers/treatment.controller.js";

const router = Router();

// ===== PACKAGES =====
router.get("/packages", controller.getPackages);

// ===== TREATMENT =====
router.get("/package/:id", controller.getTreatment);
router.put("/package/:id", controller.saveTreatment);

// ===== SEARCH =====
router.get("/steps/search", controller.searchSteps);
router.get("/sessions/search", controller.searchSessions);

export default router;
