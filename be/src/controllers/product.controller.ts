import { Request, Response } from "express";
import * as productService from "../services/product.service.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.schema.js";

// 🔹 GET ALL
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();

    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// 🔹 GET BY ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// 🔹 CREATE
export const createProduct = async (req: Request, res: Response) => {
  try {
    const parsed = createProductSchema.parse(req.body);

    const data = {
      ...parsed,
      barcode: parsed.barcode?.trim() || null,
    };

    // chỉ check barcode nếu có nhập
    if (data.barcode) {
      const existedBarcode = await productService.findProductByBarcode(
        data.barcode,
      );

      if (existedBarcode) {
        return res.status(400).json({
          message: "Mã vạch đã tồn tại",
        });
      }
    }

    // giá hiện tại không được lớn hơn giá niêm yết
    if (data.current_price > data.sale_price) {
      return res.status(400).json({
        message: "Giá bán hiện tại không được lớn hơn giá niêm yết",
      });
    }

    const product = await productService.createProduct(data);

    return res.json({
      message: "Tạo sản phẩm thành công",
      product,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 UPDATE
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const parsed = updateProductSchema.parse(req.body);

    const data = {
      ...parsed,
      barcode: parsed.barcode?.trim() || null,
    };

    const existing = await productService.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    // check barcode mới nếu đổi
    if (data.barcode && data.barcode !== existing.barcode) {
      const existedBarcode = await productService.findProductByBarcode(
        data.barcode,
      );

      if (existedBarcode) {
        return res.status(400).json({
          message: "Mã vạch đã tồn tại",
        });
      }
    }

    const salePrice = data.sale_price ?? existing.sale_price;
    const currentPrice = data.current_price ?? existing.current_price;

    if (currentPrice > salePrice) {
      return res.status(400).json({
        message: "Giá bán hiện tại không được lớn hơn giá niêm yết",
      });
    }

    const product = await productService.updateProduct(id, data);

    return res.json({
      message: "Cập nhật sản phẩm thành công",
      product,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 DELETE
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const existing = await productService.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    await productService.deleteProduct(id);

    return res.json({
      message: "Ngừng sử dụng sản phẩm thành công",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Chưa chọn ảnh sản phẩm",
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    return res.json({
      message: "Upload ảnh thành công",
      image_url: imagePath,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
