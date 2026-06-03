import { Router } from "express";
import * as inventoryController from "../controllers/inventoryTransaction.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", inventoryController.getInventoryTransactions);

router.get("/:id", inventoryController.getInventoryTransactionById);

router.post(
  "/",
  authStaffMiddleware,
  inventoryController.createInventoryTransaction,
);

router.put(
  "/:id",
  authStaffMiddleware,
  inventoryController.updateInventoryTransaction,
);

router.patch(
  "/:id/confirm",
  authStaffMiddleware,
  inventoryController.confirmInventoryTransaction,
);

router.patch(
  "/:id/cancel",
  authStaffMiddleware,
  inventoryController.cancelInventoryTransaction,
);

export default router;
