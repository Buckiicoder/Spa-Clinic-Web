import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js"
import serviceRoutes from "./routes/service.routes.js"
import chatRoutes from "./routes/chat.routes.js";
import shiftRoutes from "./routes/shift.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js"
import staffRoutes from "./routes/staff.routes.js"
import positionRoutes from "./routes/position.routes.js"
import branchRoutes from "./routes/branch.routes.js"
import productRoutes from "./routes/product.routes.js"
import productCategoryRoutes from "./routes/productCategory.routes.js"
import TimeKeepingRoutes from "./routes/timekeeping.routes.js"
import inventoryTransactionRoutes from "./routes/inventoryTransaction.routes.js"
import customerRoutes from "./routes/customer.routes.js"
import treatmentRoutes from "./routes/treatment.routes.js"
import doctorRoutes from "./routes/doctor.routes.js"
import technicianRoutes from "./routes/technician.routes.js"
import trackingRoutes from "./routes/tracking.routes.js"
import salaryTemplateRoutes from "./routes/salary/salary-template.routes.js"
import salaryAllowanceRoutes from "./routes/salary/salary-allowance.routes.js"
import salaryDeductionRoutes from "./routes/salary/salary-deduction.routes.js"
import staffSalaryRoutes from "./routes/salary/staff-salary.routes.js"
import payrollRoutes from "./routes/payroll.routes.js"
import overtimeRoutes from "./routes/overtime.routes.js"
import discountRoutes from "./routes/discount.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

//demo
// app.use(cors({
//   origin: ["http://localhost:5173", "http://localhost:5174"],
//   credentials: true
// }))

//reality
const allowedOrigins = [
  "https://www.spaclinic.online",
  "https://spaclinic.online",
  "https://staff.spaclinic.online",

  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Postman / server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked CORS Origin:", origin);

    return callback(
      new Error(`CORS blocked for origin: ${origin}`),
    );
  },

  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/shift", shiftRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/position", positionRoutes);
app.use("/api/timekeeping", TimeKeepingRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/product", productRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/inventory-transactions", inventoryTransactionRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/treatment", treatmentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/salary/template", salaryTemplateRoutes);
app.use("/api/salary/allowance", salaryAllowanceRoutes);
app.use("/api/salary/deduction", salaryDeductionRoutes);
app.use("/api/salary/staff", staffSalaryRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/overtime", overtimeRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

export default app;
