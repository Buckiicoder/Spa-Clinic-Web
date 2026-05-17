import { Request, Response } from "express";
import * as serviceServices from "../services/service.service.js";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/service.schema.js";

// GET ALL
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await serviceServices.getAllServices();
    return res.json(services);
  } catch {
    return res.status(500).json({ message: "Lấy dịch vụ thất bại" });
  }
};

// TREE
export const getServiceTree = async (req: Request, res: Response) => {
  try {
    const tree = await serviceServices.getServiceTree();
    return res.json(tree);
  } catch {
    return res.status(500).json({ message: "Lấy tree thất bại" });
  }
};

// DETAIL
export const getServiceDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await serviceServices.getServiceDetail(id);

    if (!data) return res.status(404).json({ message: "Không tìm thấy" });

    return res.json(data);
  } catch {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getMiddleServices = async (req: Request, res: Response) => {
  try {
    const services = await serviceServices.getMiddleServices();
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
export const createService = async (req: Request, res: Response) => {
  try {
    const parsed = createServiceSchema.parse(req.body);

    const isLeaf =
      parsed.parent_id !== null &&
      parsed.area !== undefined &&
      parsed.area.trim() !== "";

    // chỉ check có package hay không
    if (isLeaf && (!parsed.packages || parsed.packages.length === 0)) {
      return res.status(400).json({ message: "Chưa thêm gói dịch vụ" });
    }

    const service = await serviceServices.createService(parsed);

    return res.json(service);
  } catch (err: any) {
    console.error("CREATE SERVICE ERROR:", err);

    if (err.name === "ZodError") {
      return res.status(400).json({
        message: "Validate thất bại",
        errors: err.errors,
      });
    }

    return res.status(500).json({
      message: err.message || "Tạo thất bại",
    });
  }
};

// UPDATE
export const updateService = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const parsed = updateServiceSchema.parse(req.body);

    const isLeaf =
      parsed.parent_id !== null && parsed.area && parsed.area.trim().length > 0;

    if (isLeaf && (!parsed.packages || parsed.packages.length === 0)) {
      return res.status(400).json({
        message: "Dịch vụ chi tiết phải có package",
      });
    }

    const service = await serviceServices.updateService(id, parsed);

    return res.json(service);
  } catch (err: any) {
    console.error(err);

    if (err.name === "ZodError") {
      return res.status(400).json(err.errors);
    }

    return res.status(500).json({ message: "Cập nhật thất bại" });
  }
};

// DELETE
export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await serviceServices.deleteService(id);
    return res.json({ message: "Xóa thành công" });
  } catch {
    return res.status(500).json({ message: "Xóa thất bại" });
  }
};
