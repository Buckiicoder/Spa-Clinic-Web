import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchBookings,
  checkInBooking,
  bookingCreated,
  bookingUpdated,
  bookingDeleted,
} from "../features/internalBooking/bookingSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.internalBooking.bookings);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const socketRef = useRef<any>(null);

  const [filters, setFilters] = useState({
    keyword: "", // gộp name + phone
    status: "",
    date: "",
  });

  // handle click outside button
  useEffect(() => {
    const handleClick = () => setOpenMenu(null);
    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  // ✅ load data
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // ✅ socket realtime
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    const socket = socketRef.current;

    socket.emit("join-reception");

    socket.on("booking:created", (booking: any) => {
      dispatch(bookingCreated(booking));
    });

    socket.on("booking:updated", (updated: any) => {
      dispatch(bookingUpdated(updated));
    });

    socket.on("booking:deleted", (id: string) => {
      dispatch(bookingDeleted(id));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // ✅ filter
  const filteredBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.booking_date).toISOString().split("T")[0];

    const keyword = filters.keyword.toLowerCase();

    return (
      (b.name?.toLowerCase().includes(keyword) ||
        (b.phone || "").includes(keyword)) &&
      (filters.status ? b.status === filters.status : true) &&
      (filters.date ? bookingDate === filters.date : true)
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / limit);

  const paginatedBookings = filteredBookings.slice(
    (page - 1) * limit,
    page * limit,
  );

  // ✅ status render
  const renderStatus = (status: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";

    switch (status) {
      case "PENDING":
        return (
          <span className={`${base} bg-gray-100 text-gray-600`}>Chưa đến</span>
        );

      case "CONFIRMED":
        return (
          <span className={`${base} bg-blue-100 text-blue-600`}>
            Chưa xác nhận
          </span>
        );

      case "CHECKED_IN":
        return (
          <span className={`${base} bg-amber-100 text-amber-600`}>Đã đến</span>
        );

      case "COMPLETED":
        return (
          <span className={`${base} bg-green-100 text-green-600`}>
            Hoàn thành
          </span>
        );

      case "CANCELLED":
        return (
          <span className={`${base} bg-red-100 text-red-600`}>Đã hủy</span>
        );

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-50 font-sans text-brown-900 border-2">
      {/* <Navbar /> */}

      <div className="max-w-[1800px] mx-auto px-3 md:px-6 py-4">
        {/* Table */}
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg md:text-2xl font-bold text-amber-600">
            Quản lý đặt lịch
          </h3>

          <button
            onClick={() => navigate("/booking")}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-xl font-semibold shadow hover:from-amber-500 hover:to-yellow-600 transition"
          >
            + Đặt lịch
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-md mb-6 flex flex-col md:flex-row gap-3">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT..."
            className="w-full md:w-72 px-4 py-1 border rounded-xl 
focus:ring-2 focus:ring-amber-400 
transition-all duration-300 ease-in-out 
hover:shadow-md focus:scale-[1.02]"
            onChange={(e) =>
              setFilters({ ...filters, keyword: e.target.value })
            }
          />

          {/* STATUS */}
          <select
            className="w-full md:w-72 px-4 py-1 border rounded-xl 
focus:ring-2 focus:ring-amber-400 
transition-all duration-300 ease-in-out 
hover:shadow-md focus:scale-[1.02]"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chưa đến</option>
            <option value="CONFIRMED">Chưa xác nhận</option>
            <option value="CHECKED_IN">Đã đến</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {/* DATE */}
          <div className="relative w-[200px]">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                setSelectedDate(date);
                setFilters({
                  ...filters,
                  date: date ? date.toISOString().split("T")[0] : "",
                });
              }}
              placeholderText="Chọn ngày"
              dateFormat="dd/MM/yyyy"
              onKeyDown={(e) => e.preventDefault()} // ❌ chặn nhập tay
              className="w-full px-4 py-1 border rounded-xl pr-10
    transition-all duration-300 ease-in-out
    hover:shadow-md focus:ring-2 focus:ring-amber-400 cursor-pointer"
            />

            {/* ❌ NÚT CLEAR */}
            {selectedDate && (
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setFilters({ ...filters, date: "" });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm md:text-base">
              <thead className="bg-amber-100 text-amber-700">
                <tr>
                  <th className="px-3 py-3 w-[100px]">Mã</th>
                  <th className="px-3 py-3 w-[150px]">Khách</th>
                  <th className="px-3 py-3 w-[120px]">SĐT</th>
                  <th className="px-3 py-3 w-[160px]">Dịch vụ</th>
                  <th className="px-3 py-3 w-[100px]">Thời gian</th>
                  <th className="px-3 py-3 w-[30px]">SL</th>
                  <th className="px-3 py-3 w-[130px]">Trạng thái</th>
                  <th className="px-3 py-3 w-[90px] text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedBookings.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-6 text-gray-400">
                      No results.
                    </td>
                  </tr>
                )}

                {paginatedBookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => handleView(b.id)}
                    className="border-t cursor-pointer hover:bg-amber-50 transition"
                  >
                    <td className="px-6 py-4 ">{b.booking_code}</td>
                    <td className="px-4 py-4 ">{b.name}</td>
                    <td className="px-6 py-4 ">{b.phone}</td>
                    <td className="px-6 py-4 ">{b.service_name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col text-sm">
                        <span>
                          {new Date(b.booking_date).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-gray-600 text-s">
                          {b.booking_time}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 ">{b.quantity}</td>
                    <td className="px-6 py-4 ">{renderStatus(b.status)}</td>

                    <td
                      className="px-3 py-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === b.id ? null : b.id);
                        }}
                        className="px-2 py-1 rounded-lg hover:bg-gray-100"
                      >
                        ⋯
                      </button>

                      {openMenu === b.id && (
                        <div className="absolute right-4 mt-2 w-36 bg-white border rounded-xl shadow-lg z-10 animate-fadeIn">
                          <button
                            onClick={() => handleView(b.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            👁 Xem
                          </button>

                          <button
                            onClick={() => handleCheckIn(b.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-amber-600"
                          >
                            ✔ Check-in
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-4 border-t text-sm">
              {/* LEFT */}
              <div>
                {(page - 1) * limit + 1}–
                {Math.min(page * limit, filteredBookings.length)} trên{" "}
                {filteredBookings.length} bản ghi
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">
                {/* chọn số dòng */}
                <div className="flex items-center gap-2">
                  <span>Số hàng mỗi trang</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border rounded-lg px-2 py-1"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* page info */}
                <div>
                  Trang {page} / {totalPages || 1}
                </div>

                {/* buttons */}
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    {"<"}
                  </button>

                  <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    {">"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
