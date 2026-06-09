import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import {
  fetchBookings,
  // checkInBooking,
  bookingCreated,
  bookingUpdated,
  bookingDeleted,
} from "../features/internalBooking/bookingSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  Wallet,
} from "lucide-react";

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
    socket.connect();

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
      socket.off("booking:created");
    socket.off("booking:updated");
    socket.off("booking:deleted");
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

  const renderStatus = (status: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";

    switch (status) {
      case "PENDING":
        return (
          <span className={`${base} bg-gray-100 text-gray-600`}>Chưa đến</span>
        );

      case "CHECKED_IN":
        return (
          <span className={`${base} bg-amber-100 text-amber-700`}>
            Đã check-in
          </span>
        );

      case "IN_CONSULTATION":
        return (
          <span className={`${base} bg-purple-100 text-purple-700`}>
            Đang tư vấn
          </span>
        );

      case "CONSULTED":
        return (
          <span className={`${base} bg-indigo-100 text-indigo-700`}>
            Đã tư vấn
          </span>
        );

      case "IN_TREATMENT":
        return (
          <span className={`${base} bg-amber-100 text-amber-700`}>
            Đang thực hiện DV
          </span>
        );

      case "COMPLETED":
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Hoàn thành
          </span>
        );

      case "CANCELLED":
        return (
          <span className={`${base} bg-red-100 text-red-700`}>Đã hủy</span>
        );

      case "NO_SHOW":
        return (
          <span className={`${base} bg-orange-100 text-orange-700`}>
            Không đến
          </span>
        );

      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-500`}>{status}</span>
        );
    }
  };

  // ✅ action
  const handleCheckIn = (id: string) => {
    navigate(`/booking/${id}?action=checkin`);
  };

  const handleView = (id: string) => {
    navigate(`/booking/${id}`);
  };

  const handlePayment = (customerId: number) => {
    navigate(`/payment/customer/${customerId}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      {/* <Navbar /> */}

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Table */}
        {/* HEADER */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-black">Quản lý đặt lịch</h1>

          <button
            onClick={() => navigate("/booking")}
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + Đặt lịch
          </button>
        </div>

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={filters.keyword}
                placeholder="Tìm theo tên, SĐT..."
                onChange={(e) =>
                  setFilters({ ...filters, keyword: e.target.value })
                }
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* STATUS */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-black"
            >
              <option value="">Tất cả trạng thái</option>

              <option value="PENDING">Chưa đến</option>

              <option value="CHECKED_IN">Đã check-in</option>

              <option value="IN_CONSULTATION">Đang tư vấn</option>

              <option value="CONSULTED">Đã tư vấn</option>

              <option value="IN_TREATMENT">Đang thực hiện dịch vụ</option>

              <option value="COMPLETED">Hoàn thành</option>

              <option value="NO_SHOW">Không đến</option>

              <option value="CANCELLED">Đã hủy</option>
            </select>

            {/* DATE */}
            <div className="relative w-full max-w-[220px]">
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
                onKeyDown={(e) => e.preventDefault()}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 pr-10 text-sm outline-none transition focus:border-black"
              />

              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(null);
                    setFilters({ ...filters, date: "" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-gray-700">
                <tr>
                  <th className="p-3 px-4 text-left">Mã</th>
                  <th className="p-3 text-left">Khách</th>
                  <th className="p-3 text-left">SĐT</th>
                  <th className="p-3 text-left">Dịch vụ</th>
                  <th className="p-3 text-left">Thời gian</th>
                  <th className="p-3 text-left">SL</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Thanh toán</th>
                  <th className="p-3 text-left">Thao tác</th>
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
                    className="cursor-pointer border-t transition hover:bg-amber-50"
                  >
                    <td className="p-3 font-semibold">{b.booking_code}</td>
                    <td className="p-3">{b.name}</td>
                    <td className="p-3">{b.phone}</td>
                    <td className="p-3 font-semibold">{b.service_name}</td>
                    <td className="p-3">
                      <div className="flex flex-col text-sm">
                        <span>
                          {new Date(b.booking_date).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-xs text-gray-400">
                          {b.booking_time}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 ">{b.quantity}</td>
                    <td className="px-6 py-4 ">{renderStatus(b.status)}</td>

                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Bell size={20} className="text-gray-600" />

                          {b.has_unpaid_payment && (
                            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
                          )}
                        </div>

                        {b.has_unpaid_payment ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              handlePayment(b.customer_id);
                            }}
                            className="flex items-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                          >
                            <Wallet size={14} />
                            Thanh toán
                            {b.unpaid_profiles > 0 && (
                              <span>({b.unpaid_profiles})</span>
                            )}
                          </button>
                        ) : (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Đã thanh toán
                          </span>
                        )}
                      </div>
                    </td>

                    <td
                      className="px-3 py-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === b.id ? null : b.id);
                        }}
                        className="rounded-lg p-2 transition hover:bg-gray-100"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenu === b.id && (
                        <div className="absolute right-3 top-10 z-20 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                          <button
                            onClick={() => handleView(b.id)}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
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
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            {(page - 1) * limit + 1}–
            {Math.min(page * limit, filteredBookings.length)} trên{" "}
            {filteredBookings.length} bản ghi.
          </p>

          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="font-medium">Số hàng mỗi trang</span>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-gray-200 bg-white px-4 outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Trang {page} trên {totalPages || 1}
              </span>

              <div className="flex items-center gap-2">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft size={18} />
                </button>

                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage(totalPages)}
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
