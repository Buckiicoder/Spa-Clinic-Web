import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { useNavigate } from "react-router-dom";
import {
  fetchBookings,
  checkInBooking,
  bookingCreated,
  bookingUpdated,
  bookingDeleted,
} from "../features/internalBooking/bookingSlice";

const socket = io("http://localhost:5000");

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.internalBooking.bookings);

  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
  });

  // ✅ load data
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // ✅ socket realtime
  useEffect(() => {
    socket.emit("join-reception");

    socket.on("booking:created", (booking) => {
      dispatch(bookingCreated(booking));
    });

    socket.on("booking:updated", (updated) => {
      dispatch(bookingUpdated(updated));
    });

    socket.on("booking:deleted", (id) => {
      dispatch(bookingDeleted(id));
    });

    return () => {
      socket.off("booking:created");
      socket.off("booking:updated");
      socket.off("booking:deleted");
    };
  }, [dispatch]);

  // ✅ filter
  const filteredBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.booking_date).toISOString().split("T")[0];

    return (
      b.name?.toLowerCase().includes(filters.name.toLowerCase()) &&
      (b.phone || "").includes(filters.phone) &&
      (b.email || "").includes(filters.email) &&
      (filters.date ? bookingDate === filters.date : true)
    );
  });

  // ✅ status render
  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="text-yellow-600 font-bold">CHƯA ĐẾN</span>;
      case "CONFIRMED":
        return <span className="text-yellow-600 font-bold">CHƯA XÁC NHẬN</span>;
      case "CHECKED_IN":
        return <span className="text-blue-600 font-semibold">ĐÃ ĐẾN</span>;
      case "CANCELLED":
        return <span className="text-red-500 font-semibold">ĐÃ HỦY</span>;
      case "COMPLETED":
        return <span className="text-green-600 font-semibold">HOÀN THÀNH</span>;
      default:
        return status;
    }
  };

  // ✅ action
  const handleCheckIn = (id: string) => {
    dispatch(checkInBooking(id));
  };

  const handleView = (id: string) => {
    navigate(`/booking/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-50 font-sans text-brown-900">
      <Navbar />

      <div className="max-w-8xl mx-auto px-6 md:px-12 xl:px-32 py-16 md:py-24">
        {/* Filters */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-center">
            <input
              type="text"
              placeholder="Tên khách"
              className="xl:col-span-3 w-full px-4 py-2 rounded-xl border"
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />

            <input
              type="text"
              placeholder="Số điện thoại"
              className="xl:col-span-3 w-full px-4 py-2 rounded-xl border"
              onChange={(e) =>
                setFilters({ ...filters, phone: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Email"
              className="xl:col-span-3 w-full px-4 py-2 rounded-xl border"
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
            />

            <div className="xl:col-span-2 relative">
              <input
                type="date"
                value={filters.date}
                className="w-full px-4 py-2 rounded-xl border pr-8"
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />

              {filters.date && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, date: "" })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h5 className="text-xl md:text-2xl font-semibold text-amber-600">
              Danh sách đặt lịch
            </h5>

            <button
              onClick={() => navigate("/booking")}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl font-semibold shadow hover:from-amber-500 hover:to-yellow-600 transition"
            >
              + Đặt lịch
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm md:text-base">
              <thead className="bg-amber-100 text-amber-700">
                <tr>
                  <th className="px-6 py-3">Mã</th>
                  <th className="px-6 py-3">Tên khách</th>
                  <th className="px-6 py-3">Số điện thoại</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Dịch vụ</th>
                  <th className="px-6 py-3">Ngày</th>
                  <th className="px-6 py-3">Giờ</th>
                  <th className="px-6 py-3">SL</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-6 py-4">{b.booking_code}</td>
                    <td className="px-6 py-4">{b.name}</td>
                    <td className="px-6 py-4">{b.phone}</td>
                    <td className="px-6 py-4">{b.email}</td>
                    <td className="px-6 py-4">{b.service_name}</td>
                    <td className="px-6 py-4">
                      {new Date(b.booking_date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">{b.booking_time}</td>
                    <td className="px-6 py-4">{b.quantity}</td>
                    <td className="px-6 py-4">{renderStatus(b.status)}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(b.id)}
                          className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-lg text-sm hover:from-amber-500 hover:to-yellow-600 shadow transition"
                        >
                          Xem
                        </button>

                        <button
                          onClick={() => handleCheckIn(b.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
                        >
                          Check-in
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
