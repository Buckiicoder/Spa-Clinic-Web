import { Request, Response } from "express";

import * as dashboardServices from "../services/dashboard.service.js";

// ======================================================
// DASHBOARD OVERVIEW
// ======================================================

export const getDashboardOverview = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      await dashboardServices.getDashboardOverview();

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET DASHBOARD OVERVIEW ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy dữ liệu dashboard thất bại",
      error: err.message,
    });
  }
};

// ======================================================
// PRODUCTS
// ======================================================

// LOW STOCK PRODUCTS
export const getLowStockProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Number(req.query.limit || 10);

    const data =
      await dashboardServices.getLowStockProducts(
        limit
      );

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET LOW STOCK PRODUCTS ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy sản phẩm tồn kho thất bại",
      error: err.message,
    });
  }
};

// ======================================================
// STAFF
// ======================================================

// STAFF ATTENDANCE
export const getTopAttendanceStaffs = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Number(req.query.limit || 10);

    const data =
      await dashboardServices.getTopAttendanceStaffs(
        limit
      );

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET TOP ATTENDANCE STAFFS ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy thống kê chuyên cần thất bại",
      error: err.message,
    });
  }
};

// LATE STAFFS
export const getLateStaffs = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Number(req.query.limit || 10);

    const data =
      await dashboardServices.getLateStaffs(
        limit
      );

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET LATE STAFFS ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy nhân viên đi muộn thất bại",
      error: err.message,
    });
  }
};

// DOCTOR REVENUE
export const getTopDoctorRevenue = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Number(req.query.limit || 10);

    const data =
      await dashboardServices.getTopDoctorRevenue(
        limit
      );

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET TOP DOCTOR REVENUE ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy doanh số bác sĩ thất bại",
      error: err.message,
    });
  }
};

// TECHNICIAN REVENUE
export const getTopTechnicianRevenue =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const limit = Number(
        req.query.limit || 10
      );

      const data =
        await dashboardServices.getTopTechnicianRevenue(
          limit
        );

      return res.json(data);
    } catch (err: any) {
      console.error(
        "GET TOP TECHNICIAN REVENUE ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Lấy doanh số kỹ thuật viên thất bại",
        error: err.message,
      });
    }
  };

// ======================================================
// CUSTOMERS
// ======================================================

// VIP CUSTOMERS
export const getTopVipCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const limit = Number(req.query.limit || 10);

    const data =
      await dashboardServices.getTopVipCustomers(
        limit
      );

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET TOP VIP CUSTOMERS ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy khách hàng VIP thất bại",
      error: err.message,
    });
  }
};

// LOYAL CUSTOMERS
export const getTopLoyalCustomers =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const limit = Number(
        req.query.limit || 10
      );

      const data =
        await dashboardServices.getTopLoyalCustomers(
          limit
        );

      return res.json(data);
    } catch (err: any) {
      console.error(
        "GET TOP LOYAL CUSTOMERS ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Lấy khách hàng thân thiết thất bại",
        error: err.message,
      });
    }
  };

// ======================================================
// SERVICES
// ======================================================

// MOST BOOKED SERVICES
export const getMostBookedServices =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const limit = Number(
        req.query.limit || 10
      );

      const data =
        await dashboardServices.getTopBookedServices(
          limit
        );

      return res.json(data);
    } catch (err: any) {
      console.error(
        "GET MOST BOOKED SERVICES ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Lấy dịch vụ được đặt nhiều thất bại",
        error: err.message,
      });
    }
  };

// LEAST BOOKED SERVICES
export const getLeastBookedServices =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const limit = Number(
        req.query.limit || 10
      );

      const data =
        await dashboardServices.getLeastBookedServices(
          limit
        );

      return res.json(data);
    } catch (err: any) {
      console.error(
        "GET LEAST BOOKED SERVICES ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Lấy dịch vụ ít được đặt thất bại",
        error: err.message,
      });
    }
  };

// MOST BOOKED PACKAGES
export const getMostBookedPackages =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const limit = Number(
        req.query.limit || 10
      );

      const data =
        await dashboardServices.getTopBookedPackages(
          limit
        );

      return res.json(data);
    } catch (err: any) {
      console.error(
        "GET MOST BOOKED PACKAGES ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Lấy gói dịch vụ được đặt nhiều thất bại",
        error: err.message,
      });
    }
  };

// LEAST BOOKED PACKAGES
export const getLeastBookedPackages =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const limit = Number(
        req.query.limit || 10
      );

      const data =
        await dashboardServices.getLeastBookedPackages(
          limit
        );

      return res.json(data);
    } catch (err: any) {
      console.error(
        "GET LEAST BOOKED PACKAGES ERROR:",
        err
      );

      return res.status(500).json({
        message:
          "Lấy gói dịch vụ ít được đặt thất bại",
        error: err.message,
      });
    }
  };

// ======================================================
// REVENUE
// ======================================================

export const getRevenueStatistics = async (
  req: Request,
  res: Response
) => {
  try {
    const data =
      await dashboardServices.getRevenueStatistics();

    return res.json(data);
  } catch (err: any) {
    console.error(
      "GET REVENUE STATISTICS ERROR:",
      err
    );

    return res.status(500).json({
      message:
        "Lấy thống kê doanh thu thất bại",
      error: err.message,
    });
  }
};