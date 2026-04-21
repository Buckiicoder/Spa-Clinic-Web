import { Request, Response } from "express";
import * as productCategoryService from "../services/productCategory.service.js";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from "../validators/productCategory.schema.js";

// 🔹 GET ALL
export const getProductCategories = async (
  _req: Request,
  res: Response
) => {
  try {
    const data =
      await productCategoryService.getAllProductCategories();

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// 🔹 CREATE
export const createProductCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createProductCategorySchema.parse(req.body);

    const existed =
      await productCategoryService.findProductCategoryByName(
        data.name
      );

    if (existed) {
      return res.status(400).json({
        message: "Tên phân loại đã tồn tại",
      });
    }

    const category =
      await productCategoryService.createProductCategory(data);

    return res.json({
      message: "Tạo phân loại thành công",
      category,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 UPDATE
export const updateProductCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const existing =
      await productCategoryService.getProductCategoryById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy phân loại",
      });
    }

    const data = updateProductCategorySchema.parse(req.body);

    if (
      data.name &&
      data.name.toLowerCase() !== existing.name.toLowerCase()
    ) {
      const existed =
        await productCategoryService.findProductCategoryByName(
          data.name
        );

      if (existed) {
        return res.status(400).json({
          message: "Tên phân loại đã tồn tại",
        });
      }
    }

    const category =
      await productCategoryService.updateProductCategory(
        id,
        data
      );

    return res.json({
      message: "Cập nhật phân loại thành công",
      category,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 DELETE
export const deleteProductCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const existing =
      await productCategoryService.getProductCategoryById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy phân loại",
      });
    }

    await productCategoryService.deleteProductCategory(id);

    return res.json({
      message: "Xóa phân loại thành công",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
