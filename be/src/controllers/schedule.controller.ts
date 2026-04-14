import { Request, Response } from "express";
import * as scheduleService from "../services/schedule.service.js";
import {
  createSchedulePeriodSchema,
  updateSchedulePeriodSchema,
  createScheduleDaysSchema,
} from "../validators/schedule.schema.js";

/**
 * 🔹 GET tháng
 */
export const getScheduleByMonth = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Tháng/năm không hợp lệ" });
    }

    const period = await scheduleService.getSchedulePeriod(month, year);

    if (!period) {
      return res.json(null);
    }

    const days = await scheduleService.getScheduleDays(period.id);

    return res.json({
      period,
      days,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 CREATE tháng
 */
export const createSchedulePeriod = async (req: Request, res: Response) => {
  try {
    const data = createSchedulePeriodSchema.parse(req.body);

    const parsedData = {
      ...data,
      open_from: data.open_from ? new Date(data.open_from) : null,
      open_to: data.open_to ? new Date(data.open_to) : null,
    };

    const existing = await scheduleService.getSchedulePeriod(
      data.month,
      data.year,
    );

    if (existing) {
      return res.status(400).json({
        message: "Tháng này đã tồn tại lịch",
      });
    }

    const period = await scheduleService.createSchedulePeriod(parsedData);

    res.json({
      message: "Tạo lịch tháng thành công",
      period,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 UPDATE tháng
 */
export const updateSchedulePeriod = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = updateSchedulePeriodSchema.parse(req.body);

    const parsedData = {
      ...data,
      open_from: data.open_from ? new Date(data.open_from) : undefined,
      open_to: data.open_to ? new Date(data.open_to) : undefined,
    };

    const period = await scheduleService.updateSchedulePeriod(id, parsedData);

    res.json({
      message: "Cập nhật lịch tháng thành công",
      period,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 SET ngày làm việc (bulk)
 */
export const setScheduleDays = async (req: Request, res: Response) => {
  try {
    const data = createScheduleDaysSchema.parse(req.body);

    const period = await scheduleService.getSchedulePeriodById(
      data.period_id
    );

    if (!period) {
      return res.status(404).json({ message: "Không tìm thấy kỳ lịch" });
    }

    // 🔥 validate date thuộc tháng
    for (const d of data.days) {
      const date = new Date(d.work_date);

      if (
        date.getMonth() + 1 !== period.month ||
        date.getFullYear() !== period.year
      ) {
        return res.status(400).json({
          message: `Ngày ${d.work_date} không thuộc tháng ${period.month}/${period.year}`,
        });
      }
    }

    // 🔥 remove duplicate
    const uniqueMap = new Map();

    for (const d of data.days) {
      const key = `${d.work_date}-${d.shift_id}-${d.employee_type}`;
      uniqueMap.set(key, d);
    }

    const finalRecords = Array.from(uniqueMap.values());

    // 🔥 DB
    await scheduleService.deleteScheduleDaysByPeriod(data.period_id);

    const result = await scheduleService.createScheduleDays(
      data.period_id,
      finalRecords
    );

    res.json({
      message: "Tạo lịch làm thành công",
      days: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 GET by id
 */
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const period = await scheduleService.getSchedulePeriodById(id);

    if (!period) {
      return res.status(404).json({ message: "Không tìm thấy lịch" });
    }

    const days = await scheduleService.getScheduleDays(id);

    res.json({ period, days });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 DELETE period
 */
export const deleteSchedulePeriod = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await scheduleService.deleteSchedulePeriod(id);

    res.json({ message: "Xóa lịch tháng thành công" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * 🔹 GET full schedule (gộp)
 */
export const getFullSchedule = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ message: "Thiếu month hoặc year" });
    }

    const data = await scheduleService.getFullSchedule(month, year);

    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
