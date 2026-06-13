import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
import { api } from "../services/api";
import { verifyForgotOTP } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hook";
import { forgotPassword } from "../features/auth/authSlice";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const mode = location.state?.mode || "register";

  const contact = location.state?.contact;
  const contactType = location.state?.contactType;
  const demoOtp = location.state?.demoOtp;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // ❗ Nếu reload mất state → redirect
  useEffect(() => {
    if (!contact) {
      alert("Phiên xác thực đã hết. Vui lòng đăng ký lại.");

      navigate(mode === "register" ? "/register" : "/forgot-password");
    }
  }, [contact, navigate, mode]);

  useEffect(() => {
    if (contactType === "PHONE" && demoOtp) {
      alert(
        `Mã OTP của bạn là: ${demoOtp}\n\n` +
          `Mã chỉ có hiệu lực trong 5 phút.\n` +
          `Vui lòng nhập đúng mã này để ${
            mode === "register" ? "đăng ký" : "khôi phục mật khẩu"
          }.`,
      );
    }
  }, [contactType, demoOtp, mode]);

  // ⏳ countdown resend
  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("OTP phải đủ 6 số");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (mode === "forgot-password") {
      await dispatch(
        verifyForgotOTP({
          contact,
          otp,
        }),
      ).unwrap();

      navigate("/reset-password", {
        state: {
          contact,
        },
      });

      return;
    }

    await api.post(
      "/auth/customer/verify-otp",
      {
        contact,
        otp,
      },
    );

    alert("Đăng ký thành công!");

    navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setTimeLeft(60);

      if (mode === "register") {
        alert("Vui lòng quay lại màn hình đăng ký");
      }

      if (mode === "forgot-password") {
        const result = await dispatch(forgotPassword(contact)).unwrap();

        if (result.contactType === "PHONE" && result.demoOtp) {
          alert(`OTP mới: ${result.demoOtp}`);
        }

        alert("OTP mới đã được gửi");
      }

      alert("OTP mới đã được gửi!");
    } catch {
      setError("Không thể gửi lại OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-brown-900 mb-2">
            Xác thực OTP
          </h2>

          <p className="text-gray-500 mb-6">
            {contactType === "PHONE"
              ? `Nhập mã OTP vừa được hiển thị cho số ${contact}`
              : `Nhập mã OTP đã gửi tới ${contact}`}
          </p>

          {/* OTP INPUT */}
          <input
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // chỉ số
              setOtp(value);
            }}
            maxLength={6}
            className="
              w-full text-center text-3xl tracking-[10px]
              border border-amber-200
              p-3 rounded-xl
              focus:outline-none
              focus:ring-2 focus:ring-amber-400
              font-medium
            "
            placeholder="------"
          />

          {/* ERROR */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* BUTTON */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className={`
              mt-5 w-full py-3 rounded-full
              text-white font-semibold
              transition-all
              ${
                otp.length === 6
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Đang xác thực..." : "Xác nhận"}
          </button>

          {/* RESEND */}
          <div className="mt-5 text-sm text-gray-500">
            {timeLeft > 0 ? (
              <p>Gửi lại OTP sau {timeLeft}s</p>
            ) : (
              <button
                onClick={handleResend}
                className="text-amber-500 font-medium hover:underline"
              >
                Gửi lại OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
