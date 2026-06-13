import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "../app/hook";

import { forgotPassword } from "../features/auth/authSlice";
import Toast from "../components/Toast";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const [contact, setContact] = useState("");

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const result = await dispatch(forgotPassword(contact)).unwrap();

      setToast({
  type: "success",
  message: result.message || "OTP đã được gửi thành công",
});

      navigate("/verify-otp", {
        state: {
          contact,

          contactType: result.contactType,

          demoOtp: result.demoOtp,

          mode: "forgot-password",
        },
      });
    } catch (err: any) {
      console.log(err);

      setToast({
    type: "error",
    message:
      err?.message ||
      err?.payload?.message ||
      "SĐT hoặc Email chưa đăng ký. Vui lòng đăng ký để sử dụng dịch vụ",
  });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={submit}
          className="
            bg-white/90
            backdrop-blur-xl
            border border-amber-200
            rounded-2xl
            shadow-xl
            p-8
          "
        >
          <h2 className="text-2xl font-bold text-center mb-2">Quên mật khẩu</h2>

          <p className="text-center text-gray-500 mb-6">
            Nhập Email hoặc SĐT đã đăng ký
          </p>

          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Email hoặc SĐT"
            className="
              w-full
              px-4
              py-3
              border
              border-amber-200
              rounded-xl
              focus:ring-2
              focus:ring-amber-400
              focus:outline-none
            "
          />

          <button
            type="submit"
            disabled={loading}
            className="
              mt-6
              w-full
              py-3
              rounded-full
              bg-amber-500
              hover:bg-amber-600
              text-white
            "
          >
            {loading ? "Đang gửi..." : "Gửi OTP"}
          </button>
        </form>
      </div>

      {toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
    </div>
  );
}
