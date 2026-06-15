import { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../app/hook";

import { resetPassword } from "../features/auth/authSlice";

export default function ResetPassword() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const contact = location.state?.contact;

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // const validatePassword = (password: string): string | null => {
  //   if (password.length < 6) {
  //     return "Mật khẩu phải có ít nhất 6 ký tự";
  //   }

  //   const hasLetter = /[a-zA-Z]/.test(password);

  //   const hasNumber = /\d/.test(password);

  //   const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/']/g.test(password);

  //   if (!hasSpecial) {
  //     return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
  //   }

  //   if (!hasLetter && !hasNumber) {
  //     return "Mật khẩu phải chứa chữ hoặc số";
  //   }

  //   return null;
  // };

  useEffect(() => {
    if (!contact) {
      navigate("/forgot-password");
    }
  }, [contact, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    // const validatePassword = (password: string): string | null => {
    //   if (password.length < 6) {
    //     return "Mật khẩu phải có ít nhất 6 ký tự";
    //   }

    //   const hasLetter = /[a-zA-Z]/.test(password);

    //   const hasNumber = /\d/.test(password);

    //   const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/']/g.test(
    //     password,
    //   );

    //   if (!hasSpecial) {
    //     return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
    //   }

    //   if (!hasLetter && !hasNumber) {
    //     return "Mật khẩu phải chứa chữ hoặc số";
    //   }

    //   return null;
    // };

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        resetPassword({
          contact,
          password,
        }),
      ).unwrap();

      alert("Đổi mật khẩu thành công");

      navigate("/login");
    } catch (err: any) {
      alert(err?.message || "Có lỗi xảy ra");
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
            bg-white/90 backdrop-blur-xl
            border border-amber-200
            rounded-2xl
            shadow-[0_20px_40px_rgba(120,_72,_0,_0.15)]
            p-8 sm:p-10
          "
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-brown-900">
              Spa
              <span className="text-amber-500">Clinic</span>
            </h1>

            <p className="text-gray-500 mt-2">Thiết lập mật khẩu mới</p>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mật khẩu mới
            </label>

            <input
              type="password"
              value={password}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-3
                rounded-xl
                border border-amber-200
                focus:outline-none
                focus:ring-2
                focus:ring-amber-400
                focus:border-amber-400
              "
            />
            <p className="mt-1 text-xs text-gray-500">
              Mật khẩu tối thiểu 6 ký tự, có ít nhất 1 ký tự đặc biệt và chứa
              chữ hoặc số.
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Xác nhận mật khẩu
            </label>

            <input
              type="password"
              value={confirmPassword}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              onChange={(e) => setConfirmPassword(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              className="
                w-full px-4 py-3
                rounded-xl
                border border-amber-200
                focus:outline-none
                focus:ring-2
                focus:ring-amber-400
                focus:border-amber-400
              "
            />
          </div>

          {/* Error */}
          {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-full
              bg-amber-500
              hover:bg-amber-600
              text-white font-semibold
              transition-all
              disabled:opacity-50
            "
          >
            {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>

          <div className="mt-6 text-center text-sm text-stone-500">
            Nhớ mật khẩu rồi?
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                ml-1
                text-amber-500
                font-medium
                hover:underline
              "
            >
              Đăng nhập
            </button>
          </div>

          <div className="mt-3 text-center text-sm text-stone-500">
            © {new Date().getFullYear()} Spa Clinic System
          </div>
        </form>
      </div>
    </div>
  );
}
