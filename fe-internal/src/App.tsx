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
        <Route element={<MainLayout />} />
        <Route
          path="/trangchu"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route element={<MainLayout />}>
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
                <TimeKeepingManage />
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
                <StaffManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checklich"
            element={
              <ProtectedRoute>
                <ReceptionDashboard />
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
                <Product />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service"
            element={
              <ProtectedRoute>
                <Service />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treatment"
            element={
              <ProtectedRoute>
                <Treatment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute>
                <Doctor />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
