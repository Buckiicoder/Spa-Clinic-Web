import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ReceptionDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
  });

  // ✅ load data ban đầu
  useEffect(() => {
    fetch("http://localhost:5000/api/booking")
      .then((res) => res.json())
      .then((data) => setBookings(data));
  }, []);

  // ✅ socket realtime
  useEffect(() => {
    socket.emit("join-reception");

    socket.on("booking:created", (booking) => {
      setBookings((prev) => [booking, ...prev]);
    });

    socket.on("booking:updated", (updated) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
    });

    socket.on("booking:deleted", (id) => {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    });

    return () => {
      socket.off("booking:created");
      socket.off("booking:updated");
      socket.off("booking:deleted");
    };
  }, []);

  // ✅ filter logic
  const filteredBookings = bookings.filter((b) => {
    return (
      b.name?.toLowerCase().includes(filters.name.toLowerCase()) &&
      (b.phone || "").includes(filters.phone) &&
      (b.email || "").includes(filters.email) &&
      (filters.date ? b.booking_date === filters.date : true)
    );
  });

  // ✅ action xác nhận
  const handleConfirm = async (id: string) => {
    await fetch(`http://localhost:5000/api/booking/${id}/confirm`, {
      method: "PATCH",
    });
  };

  // ✅ action xóa
  const handleDelete = async (id: string) => {
    await fetch(`http://localhost:5000/api/booking/${id}`, {
      method: "DELETE",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-50 font-sans text-brown-900">
      <Navbar />

      <div className="max-w-8xl mx-auto px-32 py-24">
        {/* Filters */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-12 gap-4 items-center">
            <input
              type="text"
              placeholder="Tên khách"
              className="col-span-3 px-4 py-2 rounded-xl border"
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />

            <input
              type="text"
              placeholder="Số điện thoại"
              className="col-span-3 px-4 py-2 rounded-xl border"
              onChange={(e) =>
                setFilters({ ...filters, phone: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Email"
              className="col-span-3 px-4 py-2 rounded-xl border"
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
            />

            <input
              type="date"
              className="col-span-2 px-4 py-2 rounded-xl border"
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />

            {/* (giữ button nhưng không cần dùng) */}
            <button className="col-span-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-3 py-2 font-semibold">
              Lọc
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h5 className="text-2xl font-semibold text-amber-600">
              Danh sách đặt lịch
            </h5>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-amber-100 text-amber-700">
                <tr className="text-left">
                  <th className="px-6 py-3">Mã</th>
                  <th className="px-6 py-3">Tên khách</th>
                  <th className="px-6 py-3">Dịch vụ</th>
                  <th className="px-6 py-3">Ngày</th>
                  <th className="px-6 py-3">Giờ</th>
                  <th className="px-6 py-3">SL</th>
                  <th className="px-6 py-3">Ghi chú</th>
                  <th className="px-6 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t hover:bg-amber-50 transition text-left"
                  >
                    <td className="px-6 py-4">{b.booking_code}</td>
                    <td className="px-6 py-4">{b.name}</td>
                    <td className="px-6 py-4">{b.service_name}</td>
                    <td className="px-6 py-4">{b.booking_date}</td>
                    <td className="px-6 py-4">{b.booking_time}</td>
                    <td className="px-6 py-4">{b.quantity}</td>
                    <td className="px-6 py-4">{b.note || "Không"}</td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-lg text-sm hover:from-amber-500 hover:to-yellow-600 shadow transition">
                          Xem
                        </button>

                        <button className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg text-sm hover:from-amber-600 hover:to-yellow-700 shadow transition">
                          Sửa
                        </button>

                        <button
                          onClick={() => handleDelete(b.id)}
                          className="px-3 py-1 bg-gradient-to-r from-[#8b5e3c] to-[#a67c52] text-white rounded-lg text-sm hover:from-[#7a5235] hover:to-[#956c45] shadow transition"
                        >
                          Xóa
                        </button>

                        <button
                          onClick={() => handleConfirm(b.id)}
                          className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg text-sm hover:from-yellow-600 hover:to-amber-700 shadow transition"
                        >
                          Xác nhận
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
