import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import BeautySkin from "./pages/BeautySkin";
import BodyCare from "./pages/BodyCare";
import HairRemoval from "./pages/HairRemoval";
import RelaxMassage from "./pages/RelaxMassage";
import Booking from "./pages/Booking";
import UserProfile from "./pages/UserProfile";
import { useAppDispatch } from "./app/hook";
import { useEffect } from "react";
import { fetchUser } from "./features/auth/authSlice";
import Register from "./pages/Register";
import VerifyOTP from "./pages/verifyOTP";
import SpaChatWidget from "./components/SpaChatWidget";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(fetchUser()).unwrap();
      } catch (err: any) {
        // 👉 nếu rejectWithValue(null) → ignore luôn
        if (err === null || err?.message === "Rejected") {
          return;
        }

        console.error("Lỗi lấy người dùng: ", err);
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <BrowserRouter>
    <SpaChatWidget/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/beauty" element={<BeautySkin />} />
        <Route path="/body" element={<BodyCare />} />
        <Route path="/hair" element={<HairRemoval />} />
        <Route path="/massage" element={<RelaxMassage />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/verify" element={<VerifyOTP />} />
      </Routes>
    </BrowserRouter>
  );
}
