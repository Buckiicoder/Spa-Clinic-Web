import { Request, Response } from "express";

import * as overtimeService from "../services/overtime.service.js";
import { getIO } from "../socket.js";

import {
  getOvertimeRequestsSchema,
  createOvertimeRequestSchema,
  approveOvertimeRequestSchema,
  rejectOvertimeRequestSchema,
  cancelOvertimeRequestSchema,
  syncApprovedOtSchema,
} from "../validators/overtime.schema.js";

export const getOvertimeRequests = async (req: Request, res: Response) => {
  try {
    const filters = getOvertimeRequestsSchema.parse(req.query);

    const data = await overtimeService.getOvertimeRequests(filters);

    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const getOvertimeRequestDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = await overtimeService.getOvertimeRequestDetail(id);

    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy yêu cầu OT",
      });
    }

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getMyOvertimeRequests = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: "User ID không hợp lệ",
      });
    }

    const data = await overtimeService.getMyOvertimeRequests(userId);

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const createOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const data = createOvertimeRequestSchema.parse(req.body);

    const result = await overtimeService.createOvertimeRequest(data);

    // realtime
    getIO().to("manager").emit("overtime:created", {
  type: "CREATED",
  data: result,
});

getIO().emit("overtime:updated");

    return res.json({
      message: "Tạo yêu cầu OT thành công",

      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const approveOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = approveOvertimeRequestSchema.parse(req.body);

    const result = await overtimeService.approveOvertimeRequest(
      id,

      data.approved_by,

      data.approved_minutes,
    );

    getIO().to("manager").emit("overtime:approved", {
  type: "APPROVED",
  data: result,
});

getIO().emit("overtime:updated", {
  type: "APPROVED",
  data: result,
});

    return res.json({
      message: "Duyệt OT thành công",

      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const rejectOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = rejectOvertimeRequestSchema.parse(req.body);

    const result = await overtimeService.rejectOvertimeRequest(
      id,
      data.approved_by,
      data.reject_reason,
    );

    getIO().to("manager").emit("overtime:rejected", {
  type: "REJECTED",
  data: result,
});

getIO().emit("overtime:updated", {
  type: "REJECTED",
  data: result,
});

    return res.json({
      message: "Từ chối OT thành công",

      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const cancelOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = cancelOvertimeRequestSchema.parse(req.body);

    const result = await overtimeService.cancelOvertimeRequest(
      id,

      data.user_id,
    );

    return res.json({
      message: "Hủy yêu cầu OT thành công",

      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const deleteOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    await overtimeService.deleteOvertimeRequest(id);

    return res.json({
      message: "Xóa yêu cầu OT thành công",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const syncApprovedOtToTimekeeping = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = syncApprovedOtSchema.parse(req.body);

    const result = await overtimeService.syncApprovedOtToTimekeeping(
      data.timekeeping_id,
    );

    return res.json({
      message: "Đồng bộ OT thành công",

      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

export const getTimekeepingDailyViewController = async (
  req: Request,
  res: Response,
) => {
  try {
    const date = req.query.date as string;
    const status = req.query.status as string | undefined;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const data = await overtimeService.getTimekeepingDailyView(date, status);

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
