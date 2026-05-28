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
      reject_reason: null,
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

    if (!current.start_time || !current.end_time) {
      throw new Error("Ca làm chưa có thời gian bắt đầu/kết thúc");
    }

    if (!current) {
      return res.status(404).json({
        message: "Không tìm thấy ca làm",
      });
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

    const totalMinutes = current?.check_in_time
      ? Math.max(
          0,
          Math.round(
            (now.getTime() - new Date(current.check_in_time).getTime()) / 60000,
          ),
        )
      : 0;

    const totalBreakMinutes = Number(current?.break_minutes || 0);

    const workedAfterBreak = Math.max(totalMinutes - totalBreakMinutes, 0);

    // SHIFT DURATION
    const workDate = new Date(current.work_date)
  .toISOString()
  .split("T")[0];

const shiftStart = new Date(
  `${workDate}T${current.start_time}`,
);

const shiftEnd = new Date(
  `${workDate}T${current.end_time}`,
);

if (
  Number.isNaN(shiftStart.getTime()) ||
  Number.isNaN(shiftEnd.getTime())
) {
  throw new Error(
    "Không thể parse thời gian ca làm",
  );
}

console.log({
  workDate,
  start_time: current.start_time,
  end_time: current.end_time,
  shiftStart,
  shiftEnd,
});

    const shiftMinutes = Math.max(
      0,
      Math.round((shiftEnd.getTime() - shiftStart.getTime()) / 60000),
    );

    // GET APPROVED OT
    const approvedOt =
      await overtimeService.getApprovedOtRequestByTimekeeping(id);

    // ======================================================
    // REAL OT MINUTES
    // ======================================================

    let actualOtMinutes = 0;

    if (
      approvedOt &&
      approvedOt.status === "APPROVED" &&
      current.check_out_time === null
    ) {
      // chỉ tính OT nếu checkout sau giờ kết thúc ca

      if (now.getTime() > shiftEnd.getTime()) {
        actualOtMinutes = Math.max(
          0,
          Math.round((now.getTime() - shiftEnd.getTime()) / 60000),
        );

        const approvedMinutesRaw =
          approvedOt?.approved_minutes ?? approvedOt?.requested_minutes ?? 0;

        const approvedMinutes = Number(approvedMinutesRaw);

        if (Number.isNaN(approvedMinutes)) {
          throw new Error("approved_minutes không hợp lệ");
        }

        actualOtMinutes = Math.min(actualOtMinutes, approvedMinutes);
      }
    }

    // FINAL WORK MINUTES
    const workMinutes = Math.min(workedAfterBreak, shiftMinutes);

    console.log({
      totalMinutes,
      workedAfterBreak,
      shiftMinutes,
      workMinutes,
      actualOtMinutes,
    });

    const result = await timekeepingService.updateTimekeepingAndReturn(
      id,
      {
        check_out_time: now.toISOString(),
        status: "COMPLETED",
      },
      {
        work_minutes: workMinutes,

        ot_minutes: actualOtMinutes,

        break_minutes: totalBreakMinutes,

        check_out_lat: lat,
        check_out_lng: lng,

        is_full_work: workMinutes >= shiftMinutes,
      },
    );

    if (approvedOt) {
      await overtimeService.completeApprovedOt(approvedOt.id, {
        actual_ot_minutes: actualOtMinutes,

        approved_end_time:
          actualOtMinutes > 0
            ? new Date(
                shiftEnd.getTime() + actualOtMinutes * 60000,
              ).toISOString()
            : null,

        shift_end_time: shiftEnd.toISOString(),

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
