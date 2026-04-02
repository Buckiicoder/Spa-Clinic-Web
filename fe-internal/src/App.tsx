import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppDispatch } from "./app/hook";
import { useEffect } from "react";
import { fetchUser } from "./features/auth/authSlice";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import ChamCong from "./pages/Timekeeping";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import BookingDetail from "./pages/BookingDetail";
import Booking from "./pages/Booking";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(fetchUser()).unwrap();
      } catch (err: any) {
        if(err === null || err?.message === "Rejected") {
          return;
        }
      }
      console.log("Lỗi lấy thông tin người dùng");
    }
    initAuth();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />}/>
        <Route
          path="/chamcong"
          element={
            <ProtectedRoute>
              <ChamCong />
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
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
