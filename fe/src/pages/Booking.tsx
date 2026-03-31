import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { selectUser } from "../features/auth/authSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hook";
import { createBooking } from "../features/booking/bookingSlice";
import {
  fetchServices,
  selectServices,
} from "../features/service/serviceSlice";

export default function Booking() {
  const dispatch = useAppDispatch();

  const services = useSelector(selectServices);
  const user = useSelector(selectUser);
  const isLoggedIn = !!user;
  const [error, setError] = useState({ phone: "" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    quantity: 1,
  });

  // 👉 autofill nếu đã login
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const validatePhone = (value: string) => {
    const phoneRegex = /^(03|09)\d{8}$/;

    if (!value) {
      setError((prev) => ({ ...prev, phone: "Vui lòng nhập số điện thoại" }));
    } else if (!phoneRegex.test(value)) {
      setError((prev) => ({
        ...prev,
        phone: "Số điện thoại không hợp lệ",
      }));
    } else {
      setError((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyNumber = value.replace(/\D/g, "");

      setForm((prev) => ({
        ...prev,
        phone: onlyNumber,
      }));

      validatePhone(onlyNumber);
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    validatePhone(form.phone);

  if (error.phone) {
    return;
  }

    try {
      await dispatch(
        createBooking({
          name: form.name,
          phone: form.phone,
          email: form.email,
          service_id: Number(form.service), // 🔥 convert sang number
          booking_date: form.date,
          booking_time: form.time,
          quantity: form.quantity,
        }),
      ).unwrap();

      alert("Đặt lịch thành công! Spa sẽ liên hệ sớm 💛");

      // reset form (giữ lại user nếu có)
      setForm({
        name: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        service: "",
        date: "",
        time: "",
        quantity: 1,
      });
      
      setError({phone: ""});
    } catch (err: any) {
      alert(err?.message || "Đặt lịch thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-6 py-20">
      <Navbar />

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 md:p-10">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-amber-600 mb-2">
            Đặt lịch thăm khám
          </h1>
          <p className="text-gray-500">
            Vui lòng để lại thông tin, Spa Clinic sẽ liên hệ xác nhận
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Họ tên */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* Họ tên */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  readOnly={isLoggedIn}
                  required
                  className={`w-full rounded-xl border px-4 py-3 ${
                    isLoggedIn
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white focus:ring-2 focus:ring-amber-400"
                  }`}
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  readOnly={isLoggedIn}
                  required
                  className={`w-full rounded-xl border px-4 py-3 ${
                    isLoggedIn
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white focus:ring-2 focus:ring-amber-400"
                  }`}
                />
              </div>

              {/* Email */}
              {user && (
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    readOnly={isLoggedIn}
                    required
                    className={`w-full rounded-xl border px-4 py-3 ${
                      isLoggedIn
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white focus:ring-2 focus:ring-amber-400"
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn dịch vụ
            </label>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Vui lòng chọn dịch vụ</option>

              {services.map((service: any) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Số người
            </label>
            <input
              type="number"
              name="quantity"
              min={1}
              max={10}
              value={form.quantity}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Ngày */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn ngày
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Giờ */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn giờ
            </label>
            <select
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full rounded-xl border px-4 py-3 bg-white focus:ring-2 focus:ring-amber-400"
            >
              <option value="">-- Chọn giờ --</option>
              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
            </select>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-full font-semibold transition"
          >
            Đặt lịch ngay
          </button>
        </form>
      </div>
    </div>
  );
}
