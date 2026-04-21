import { Request, Response } from "express";
import * as branchService from "../services/branch.service.js";
import {
  createBranchSchema,
  updateBranchSchema,
} from "../validators/branch.schema.js";
import { db } from "../config/db.js";

// 🔹 GET ALL
export const getBranches = async (_req: Request, res: Response) => {
  const branches = await branchService.getAllBranches();
  return res.json(branches);
};

// 🔹 GET BY ID
export const getBranchById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const branch = await branchService.getBranchById(id);

    if (!branch) {
      return res.status(404).json({
        message: "Không tìm thấy cơ sở",
      });
    }

    return res.json(branch);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// 🔹 CREATE
export const createBranch = async (req: Request, res: Response) => {
  try {
    const data = createBranchSchema.parse(req.body);

    const existed = await branchService.findBranchByName(data.name);

    if (existed) {
      return res.status(400).json({
        message: "Tên cơ sở đã tồn tại",
      });
    }

    const branch = await branchService.createBranch({
      ...data,
      created_by: req.user?.id,
    });

    return res.json({
      message: "Tạo cơ sở thành công",
      branch,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 UPDATE
export const updateBranch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = updateBranchSchema.parse(req.body);

    const existing = await branchService.getBranchById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy cơ sở",
      });
    }

    if (data.name && data.name !== existing.name) {
      const existed = await branchService.findBranchByName(data.name);

      if (existed) {
        return res.status(400).json({
          message: "Tên cơ sở đã tồn tại",
        });
      }
    }

    const branch = await branchService.updateBranch(id, data);

    return res.json({
      message: "Cập nhật cơ sở thành công",
      branch,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// 🔹 DELETE
export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const existing = await branchService.getBranchById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy cơ sở",
      });
    }

    const used = await db.query(
      `SELECT 1 FROM staffs WHERE branch_id = $1 LIMIT 1`,
      [id],
    );

    if (used.rowCount && used.rowCount > 0) {
      return res.status(400).json({
        message: "Không thể xóa vì đang có nhân viên thuộc cơ sở này",
      });
    }

    await branchService.deleteBranch(id);

    return res.json({
      message: "Xóa cơ sở thành công",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
