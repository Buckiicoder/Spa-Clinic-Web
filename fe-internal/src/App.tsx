import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppDispatch } from "./app/hook";
import { useEffect } from "react";
import { fetchUser } from "./features/auth/authSlice";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import ChamCong from "./pages/Timekeeping";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUser());
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
      </Routes>
    </BrowserRouter>
  );
}
