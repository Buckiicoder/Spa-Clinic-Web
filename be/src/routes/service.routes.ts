import { Router } from "express";
import { getServices } from "../controllers/service.controller.js";

const router = Router();

router.get("/getServices", getServices)

export default router;