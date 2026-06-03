import { Request, Response } from "express";
import * as timekeepingService from "../services/timekeeping.service.js";
import {
  createTimekeepingSchema,
  updateTimekeepingSchema,
} from "../validators/timekeeping.schema.js";
import * as overtimeService from "../services/overtime.service.js";

//
// 🔹 GET theo user + tháng
//
export const getTimekeepingByMonth = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const user_id = req.query.user_id ? Number(req.query.user_id) : undefined;

    if (!month || !year) {
      return res.status(400).json({
        message: "Thiếu month hoặc year",
      });
    }

    const data = await timekeepingService.getTimekeepingByUser(
      month,
      year,
      user_id,
    );

    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 GET chi tiết chấm công theo ngày
//
export const getTimekeepingByDate = async (req: Request, res: Response) => {
  try {
    const workDate = String(req.query.work_date || "");
    const userId = Number(req.query.user_id);

    if (!workDate) {
      return res.status(400).json({
        message: "Thiếu work_date",
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "Thiếu user_id",
      });
    }

    const data = await timekeepingService.getTimekeepingByDate(
      userId,
      workDate,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

//
// 🔹 CREATE (đăng ký lịch làm)
//
// timekeeping.controller.ts

export const createTimekeeping = async (req: Request, res: Response) => {
  try {
    // console.log("REQ BODY", req.body);

    const parsed = createTimekeepingSchema.parse(req.body);

    // console.log("PARSED RECORDS", parsed.records);

    const result = await timekeepingService.createTimekeepingBulk(
      parsed.records,
    );

    return res.status(200).json({
      message: "Đăng ký lịch thành công",
      data: result,
    });
  } catch (err: any) {
    console.error("CREATE TIMEKEEPING ERROR", err);

    return res.status(400).json({
      message:
        err?.errors?.[0]?.message || err?.message || "Đăng ký lịch thất bại",
    });
  }
};

//
// 🔹 UPDATE trạng thái / check-in / check-out
//
export const updateTimekeeping = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    const data = updateTimekeepingSchema.parse(req.body);

    const result = await timekeepingService.updateTimekeeping(id, data);

    if (!result) {
      return res.status(404).json({
        message: "Không tìm thấy bản ghi chấm công",
      });
    }

    return res.json({
      message: "Cập nhật chấm công thành công",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      message: err.errors?.[0]?.message || err.message,
    });
  }
};

export const approveTimekeepingOff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const updated = await timekeepingService.updateTimekeepingAndReturn(id, {
      status: "OFF",
    });
    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Duyệt nghỉ thất bại",
    });
  }
};

export const rejectTimekeepingOff = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const updated = await timekeepingService.updateTimekeepingAndReturn(id, {
      status: "SCHEDULED",
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Từ chối nghỉ thất bại",
    });
  }
};

//
// 🔹 DELETE (hủy đăng ký ca)
//
export const deleteTimekeeping = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    await timekeepingService.deleteTimekeeping(id);

    return res.json({
      message: "Xóa ca đăng ký thành công",
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 CHECK-IN
//
export const checkIn = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const { lat, lng } = req.body;

    const result = await timekeepingService.updateTimekeepingAndReturn(
      id,
      {
        check_in_time: new Date().toISOString(),
        status: "WORKING",
      },
      {
        check_in_lat: lat,
        check_in_lng: lng,
      },
    );

    return res.json({
      message: "Check-in thành công",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 CHECK-OUT
//
export const checkOut = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const { lat, lng } = req.body;

    const current = await timekeepingService.getTimekeepingById(id);

    if (!current) {
      return res.status(404).json({
        message: "Không tìm thấy ca làm",
      });
    }

    if (!current.start_time || !current.end_time) {
      throw new Error("Ca làm chưa có thời gian bắt đầu/kết thúc");
    }

    if (current.check_out_time) {
      return res.status(400).json({
        message: "Ca làm đã checkout",
      });
    }

    if (!current.check_in_time) {
      return res.status(400).json({
        message: "Ca làm chưa check-in",
      });
    }

    const now = new Date();
    const calc = await timekeepingService.calculateCheckoutData(id, now);

    const result = await timekeepingService.updateTimekeepingAndReturn(
      id,
      {
        check_out_time: now.toISOString(),
        status: "COMPLETED",
      },
      {
        work_minutes: calc.workMinutes,

        ot_minutes: calc.actualOtMinutes,

        break_minutes: calc.breakMinutes,

        check_out_lat: lat,
        check_out_lng: lng,

        is_full_work: calc.isFullWork,
      },
    );

    if (calc.approvedOt) {
      await overtimeService.completeApprovedOt(calc.approvedOt.id, {
        actual_ot_minutes: calc.actualOtMinutes,

        approved_end_time:
          calc.actualOtMinutes > 0
            ? new Date(
                calc.shiftEnd.getTime() + calc.actualOtMinutes * 60000,
              ).toISOString()
            : null,

        shift_end_time: calc.shiftEnd.toISOString(),

        is_locked: true,
      });
    }

    return res.json({
      message: "Check-out thành công",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 START BREAK
//
export const startBreak = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const result = await timekeepingService.updateTimekeepingAndReturn(id, {
      break_start_time: new Date().toISOString(),
      status: "BREAK",
    });

    return res.json({
      message: "Bắt đầu nghỉ",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

//
// 🔹 END BREAK
//
export const endBreak = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const current = await timekeepingService.getTimekeepingById(id);

    const breakMinutes = current?.break_start_time
      ? Math.max(
          0,
          Math.round(
            (new Date().getTime() -
              new Date(current.break_start_time).getTime()) /
              60000,
          ),
        ) + Number(current?.break_minutes || 0)
      : Number(current?.break_minutes || 0);

    const result = await timekeepingService.updateTimekeepingAndReturn(
      id,
      {
        break_end_time: new Date().toISOString(),
        status: "WORKING",
      },
      {
        break_minutes: breakMinutes,
      },
    );

    return res.json({
      message: "Kết thúc nghỉ",
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

