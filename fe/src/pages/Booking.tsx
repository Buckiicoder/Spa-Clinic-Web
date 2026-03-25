import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";

export default function Booking() {
  const user = useSelector(selectUser);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    date: "",
    time: "",
  });

useEffect(() => {
  if(user) {
    setForm({
      name: user.name || " ",
      phone: user.phone || "",
      service: "",
      date: "",
      time: "",
    });
  }
}, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sau này gọi API ở đây
    console.log("Booking data:", form);
    alert("Đặt lịch thành công! Spa sẽ liên hệ sớm 💛");
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
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nguyễn Văn A"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
              required
              placeholder="0909 999 999"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Cơ sở
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn cơ sở
            </label>
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">-- Chọn cơ sở --</option>
              <option value="q1">Spa Clinic Quận 1</option>
              <option value="q3">Spa Clinic Quận 3</option>
              <option value="pn">Spa Clinic Phú Nhuận</option>
              <option value="td">Spa Clinic Thủ Đức</option>
            </select>
          </div> */}

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
              <option value="" unselectable="on">Vui lòng chọn dịch vụ </option>
              <option value="beauty">Điều trị nám da</option>
              <option value="beauty">Điều trị giãn mao mạch</option>
              <option value="hair">Điều trị sẹo rỗ</option>
              <option value="hair">Điều trị mụn</option>
              <option value="body">Tiêm Filler</option>
              <option value="massage">Tiêm Botox</option>
              <option value="massage">Tiêm HA</option>
              <option value="massage">Triệt lông</option>
            </select>
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
