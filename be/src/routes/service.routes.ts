import { Router } from "express";
import * as controller from "../controllers/service.controller.js";

const router = Router();

// ===== BASIC =====
router.get("/getServices", controller.getServices);
router.get("/getMiddleServices", controller.getMiddleServices);
router.get("/tree", controller.getServiceTree);

// ===== DETAIL =====
router.get("/:id", controller.getServiceDetail);

// ===== CRUD =====
router.post("/", controller.createService);
router.put("/:id", controller.updateService);
router.delete("/:id", controller.deleteService);

export default router;
