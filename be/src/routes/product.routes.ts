import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// 🔹 GET
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// 🔹 STAFF / ADMIN
router.post("/", authStaffMiddleware, productController.createProduct);
router.patch("/:id", authStaffMiddleware, productController.updateProduct);
router.delete("/:id", authStaffMiddleware, productController.deleteProduct);

router.post(
  "/upload-image",
  authStaffMiddleware,
  upload.single("image"),
  productController.uploadProductImage
);

export default router;