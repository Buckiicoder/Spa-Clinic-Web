import { useAppDispatch } from "../app/hook";
// import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    try {
      await dispatch(
        login({
          email: data.get("email") as string,
          password: data.get("password") as string,
        }),
      ).unwrap();

      navigate("/chamcong");
    } catch {
      alert("Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <form
          onSubmit={submit}
          className="
    bg-white/90 backdrop-blur-xl
    border border-amber-200
    rounded-2xl
    shadow-[0_20px_40px_rgba(120,_72,_0,_0.15)]
    p-8 sm:p-10
    transition-all
  "
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-brown-900">
              SpaClinic<span className="text-amber-500"> Nội bộ</span>
            </h1>

            <p className="text-gray-500 mt-2">Đăng nhập để làm việc ngay nhé</p>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email hoặc SĐT
            </label>
            <input
              name="email"
              placeholder="Email hoặc Số điện thoại"
              required
              className="
  w-full px-4 py-3
  rounded-xl
  border border-amber-200
  focus:outline-none
  focus:ring-2 focus:ring-amber-400
  focus:border-amber-400
  transition
"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="
  w-full px-4 py-3
  rounded-xl
  border border-amber-200
  focus:outline-none
  focus:ring-2 focus:ring-amber-400
  focus:border-amber-400
  transition
"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="
  w-full py-3 rounded-full
  bg-amber-500 hover:bg-amber-600
  text-white font-semibold
  active:scale-[0.97]
  transition-all duration-200
  shadow-lg shadow-amber-200
"
          >
            Đăng nhập
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-stone-500">
            © {new Date().getFullYear()} Spa Clinic System
          </div>
        </form>
      </div>
    </div>
  );
}
