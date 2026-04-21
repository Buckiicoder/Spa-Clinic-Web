import { Request, Response } from "express";
import * as inventoryService from "../services/inventoryTransaction.service.js";
import { createInventoryTransactionSchema } from "../validators/inventoryTransaction.schema.js";

// 🔹 GET ALL
export const getInventoryTransactions = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await inventoryService.getAllInventoryTransactions();

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// 🔹 GET BY ID
export const getInventoryTransactionById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const transaction =
      await inventoryService.getInventoryTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        message: "Không tìm thấy phiếu kho",
      });
    }

    return res.json(transaction);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// 🔹 CREATE
export const createInventoryTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createInventoryTransactionSchema.parse(req.body);

    // check trùng code
    const existed =
      await inventoryService.findInventoryTransactionByCode(data.code);

    if (existed) {
      return res.status(400).json({
        message: "Mã phiếu đã tồn tại",
      });
    }

    // check product tồn tại
    for (const item of data.items) {
      const product = await inventoryService.getProductById(
        item.product_id
      );

      if (!product) {
        return res.status(400).json({
          message: `Sản phẩm ID ${item.product_id} không tồn tại`,
        });
      }

      // check tồn kho nếu xuất
      if (
        data.type === "EXPORT" &&
        product.stock_quantity < item.quantity
      ) {
        return res.status(400).json({
          message: `Sản phẩm "${product.name}" không đủ tồn kho`,
        });
      }
    }

    const transaction =
      await inventoryService.createInventoryTransaction(data);

    return res.json({
      message:
        data.type === "IMPORT"
          ? "Nhập kho thành công"
          : data.type === "EXPORT"
          ? "Xuất kho thành công"
          : "Điều chỉnh kho thành công",
      transaction,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 DELETE
export const deleteInventoryTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const transaction =
      await inventoryService.getInventoryTransactionById(id);

    if (!transaction) {
      return res.status(404).json({
        message: "Không tìm thấy phiếu kho",
      });
    }

    await inventoryService.deleteInventoryTransaction(id);

    return res.json({
      message: "Xóa phiếu kho thành công",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
