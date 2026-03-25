import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const contact = location.state?.contact;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // ❗ Nếu reload mất state → redirect
  useEffect(() => {
    if (!contact) {
      navigate("/register");
    }
  }, [contact, navigate]);

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

      await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          contact,
          otp,
        },
        {
          withCredentials: true, // 🔥 QUAN TRỌNG (cookie)
        }
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

      await axios.post(
        "http://localhost:5000/api/auth/register",
        { contact },
        { withCredentials: true }
      );

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
            Nhập mã đã gửi tới <b>{contact}</b>
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
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

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