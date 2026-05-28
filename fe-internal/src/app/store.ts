import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import internalBookingReducer from "../features/internalBooking/bookingSlice";
import serviceReducer from "../features/service/serviceSlice";
import shiftReducer from "../features/shift/shiftSlice";
import scheduleReducer from "../features/schedule/scheduleSlice";
import staffReducer from "../features/staff/staffSlice";
import positionReducer from "../features/position/positionSlice";
import timekeepingReducer from "../features/timekeeping/timekeepingSlice";
import branchReducer from "../features/branch/branchSlice";
import productReducer from "../features/product/productSlice";
import productCategoryReducer from "../features/productCategory/productCategorySlice";
import inventoryTransactionReducer from "../features/inventoryTransaction/inventoryTransactionSlice";
import customerReducer from "../features/customer/customerSlice";
import treatmentReducer from "../features/treatment/treatmentSlice";
import doctorReducer from "../features/doctor/doctorSlice";
import technicianReducer from "../features/technician/technicianSlice";
import trackingReducer from "../features/tracking/trackingSlice";
import salaryTemplateReducer from "../features/salary/salary-template/salary-templateSlice";
import salaryAllowanceReducer from "../features/salary/salary-allowance/salary-allowanceSlice";
import salaryDeductionReducer from "../features/salary/salary-deduction/salary-deductionSlice";
import staffSalaryReducer from "../features/salary/staff-salary/staff-salarySlice";
import payrollReducer from "../features/payroll/payrollSlice";
import overtimeReducer from "../features/overtime/overtimeSlice";
import discountReducer from "../features/discount/discountSlice";
import paymentReducer from "../features/payment/paymentSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    internalBooking: internalBookingReducer,
    service: serviceReducer,
    shift: shiftReducer,
    schedule: scheduleReducer,
    staff: staffReducer,
    position: positionReducer,
    timekeeping: timekeepingReducer,
    branch: branchReducer,
    product: productReducer,
    productCategory: productCategoryReducer,
    inventoryTransaction: inventoryTransactionReducer,
    customer: customerReducer,
    treatment: treatmentReducer,
    doctor: doctorReducer,
    technician: technicianReducer,
    tracking: trackingReducer,
    salaryTemplates: salaryTemplateReducer,
    salaryAllowance: salaryAllowanceReducer,
    salaryDeduction: salaryDeductionReducer,
    staffSalary: staffSalaryReducer,
    payroll: payrollReducer,
    overtime: overtimeReducer,
    discount: discountReducer,
    payment: paymentReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
