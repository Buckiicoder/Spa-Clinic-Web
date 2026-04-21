import { Router } from "express";
import * as inventoryController from "../controllers/inventoryTransaction.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// GET
router.get("/", inventoryController.getInventoryTransactions);
router.get("/:id", inventoryController.getInventoryTransactionById);

// CREATE
router.post(
  "/",
  authStaffMiddleware,
  inventoryController.createInventoryTransaction
);

// DELETE
router.delete(
  "/:id",
  authStaffMiddleware,
  inventoryController.deleteInventoryTransaction
);

export default router;
