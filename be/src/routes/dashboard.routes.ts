import { Router } from "express";

import {
  getDashboardOverview,
  getLowStockProducts,
  getTopAttendanceStaffs,
  getLateStaffs,
  getTopDoctorRevenue,
  getTopTechnicianRevenue,
  getTopVipCustomers,
  getTopLoyalCustomers,
  getMostBookedServices,
  getLeastBookedServices,
  getMostBookedPackages,
  getLeastBookedPackages,
  getRevenueStatistics,
} from "../controllers/dashboard.controller.js";

const router = Router();

// ======================================================
// OVERVIEW
// ======================================================

router.get("/overview", getDashboardOverview);

// ======================================================
// PRODUCTS
// ======================================================

router.get("/products/low-stock", getLowStockProducts);

// ======================================================
// STAFF
// ======================================================

router.get("/staffs/attendance", getTopAttendanceStaffs);

router.get("/staffs/late", getLateStaffs);

router.get("/staffs/doctor-revenue", getTopDoctorRevenue);

router.get("/staffs/technician-revenue", getTopTechnicianRevenue);

// ======================================================
// CUSTOMERS
// ======================================================

router.get("/customers/vip", getTopVipCustomers);

router.get("/customers/loyal", getTopLoyalCustomers);

// ======================================================
// SERVICES
// ======================================================

router.get("/services/most-booked", getMostBookedServices);

router.get("/services/least-booked", getLeastBookedServices);

router.get("/packages/most-booked", getMostBookedPackages);

router.get("/packages/least-booked", getLeastBookedPackages);

// ======================================================
// REVENUE
// ======================================================

router.get("/revenues/statistics", getRevenueStatistics);

export default router;
