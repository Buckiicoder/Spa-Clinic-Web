import { Router } from "express";
import * as productCategoryController from "../controllers/productCategory.controller.js";
import { authStaffMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", productCategoryController.getProductCategories);

router.post(
  "/",
  authStaffMiddleware,
  productCategoryController.createProductCategory
);

router.patch(
  "/:id",
  authStaffMiddleware,
  productCategoryController.updateProductCategory
);

router.delete(
  "/:id",
  authStaffMiddleware,
  productCategoryController.deleteProductCategory
);

export default router;
