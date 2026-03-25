import { useState } from "react";
import { useAppDispatch } from "../app/hook";
import { register } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    gender: "",
    contact: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    gender: "",
    contact: "",
    password: "",
  });

  // ===== VALIDATE =====
  const validate = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value || value.trim().length < 2) {
          error = "Tên phải có ít nhất 2 ký tự";
        }
        break;

      case "gender":
        if (!value) {
          error = "Vui lòng chọn giới tính";
        }
        break;

      case "contact": {
        const phoneRegex = /^(03|09)\d{8}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!phoneRegex.test(value) && !emailRegex.test(value)) {
          error = "Phải là SĐT hoặc email hợp lệ";
        }
        break;
      }

      case "password": {
        const passwordRegex = /^(?=.*[@$!%*#?&])(?=.*[A-Za-z0-9]).{6,}$/;

        if (!passwordRegex.test(value)) {
          error = "Mật khẩu phải từ 6 ký tự, gồm chữ, số và ký tự đặc biệt";
        }
        break;
      }
    }

    return error;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: validate(name, value),
    });
  };

  const isValid =
    form.name &&
    form.gender &&
    form.contact &&
    form.password &&
    !errors.name &&
    !errors.gender &&
    !errors.contact &&
    !errors.password;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      await dispatch(
        register({
          name: form.name,
          gender: form.gender,
          contact: form.contact,
          password: form.password,
        }),
      ).unwrap();

      alert("Mã OTP đã được gửi, vui lòng kiểm tra email");

      navigate("/verify", {
        state: {
          contact: form.contact,
        },
      });
    } catch (err: any) {
      alert(err?.message || "Không thể gửi OTP");
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
              Spa<span className="text-amber-500">Clinic</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Tạo tài khoản để sử dụng dịch vụ
            </p>
          </div>

          {/* Họ tên */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Họ và tên
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Giới tính */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Giới tính
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Email / SĐT */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email hoặc SĐT
            </label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Nhập email hoặc số điện thoại"
              className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none pr-12"
            />

            {/* Eye */}
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[42px] cursor-pointer text-gray-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={!isValid}
            className={`
              w-full py-3 rounded-full text-white font-semibold
              transition-all duration-200 shadow-lg shadow-amber-200
              ${
                isValid
                  ? "bg-amber-500 hover:bg-amber-600 active:scale-[0.97]"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            Xác nhận
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-stone-500">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-amber-500 font-medium">
              Đăng nhập
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
