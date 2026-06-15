import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppDispatch } from "./app/hook";
import { useEffect } from "react";
import { fetchUser } from "./features/auth/authSlice";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import TimeKeeping from "./pages/Timekeeping";
import TimeKeepingManage from "./pages/TimeKeepingManage";
import ReceptionDashboard from "./pages/ReceptionDashboard";
// import BookingDetail from "./pages/BookingDetail";
// import Booking from "./pages/Booking";
import MainLayout from "./components/MainLayout";
import StaffManage from "./pages/StaffManage";
import TKManageDetail from "./pages/TKManageDetail";
import Product from "./pages/Product";
import Inventory from "./pages/Inventory";
import Service from "./pages/Service";
import Dashboard from "./pages/Dashboard";
import Doctor from "./pages/Doctor";
import Treatment from "./pages/Treatment";
import BookingForm from "./pages/BookingForm";
import ManagerAssign from "./pages/ManagerAssign";
import Technician from "./pages/Technician";
import Payroll from "./pages/payroll/PayrollTable";
import TimekeepingDaily from "./pages/TimekeepingDaily";
import Discount from "./pages/Discount";
import Payment from "./pages/Payment";
import Customer from "./pages/Customer";
import PaymentBill from "./pages/PaymentBill";
import BillDetail from "./pages/BillDetail";
import RoleRoute from "./utils/RoleRoute";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(fetchUser()).unwrap();
      } catch (err: any) {
        if (err === null || err?.message === "Rejected") {
          return;
        }
      }
      console.log("Lỗi lấy thông tin người dùng");
    };
    initAuth();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        {/* <Route element={<MainLayout />} /> */}

        <Route element={<MainLayout />}>
          <Route
            path="/trangchu"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Dashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chamcong"
            element={
              <ProtectedRoute>
                <TimeKeeping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qlychamcong"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <TimeKeepingManage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timekeeping/detail"
            element={
              <ProtectedRoute>
                <TKManageDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qlynhanvien"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <StaffManage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checklich"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Lễ tân", "Quản lý"]}>
                  <ReceptionDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Product />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Customer />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/service"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Service />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Treatment />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Inventory />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Bác sĩ", "Quản lý"]}>
                  <Doctor />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-assign"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <ManagerAssign />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Kỹ thuật viên", "Quản lý"]}>
                  <Technician />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Payroll />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timekeepingdaily"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <TimekeepingDaily />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discount"
            element={
              <ProtectedRoute>
                <RoleRoute allowedPositions={["Quản lý"]}>
                  <Discount />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/customer/:customerId"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/bill"
            element={
              <ProtectedRoute>
                <PaymentBill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/bill/:paymentId"
            element={
              <ProtectedRoute>
                <BillDetail />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
