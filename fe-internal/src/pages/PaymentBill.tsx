import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchPaymentBills,
  // fetchPaymentBillDetail,
  selectPaymentBills,
  selectPaymentLoading,
} from "../features/payment/paymentSlice";
import "react-datepicker/dist/react-datepicker.css";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " đ";

export default function PaymentBill() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const payments = useAppSelector(selectPaymentBills);

  const loading = useAppSelector(selectPaymentLoading);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const currentDate = new Date();

  const [selectedDay, setSelectedDay] = useState<number | "">("");

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );

  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(
      fetchPaymentBills({
        month: currentDate.getMonth() + 1,

        year: currentDate.getFullYear(),
      }),
    );
  }, [dispatch]);

  const handleFilter = () => {
    dispatch(
      fetchPaymentBills({
        day: selectedDay || undefined,
        month: selectedMonth,
        year: selectedYear,
        status: status || undefined,
      }),
    );

    setPage(1);
  };

  const filteredPayments = useMemo(() => {
    const keyword = search.toLowerCase();

    return payments.filter((item: any) => {
      return (
        item.payment_code?.toLowerCase().includes(keyword) ||
        item.customer_name?.toLowerCase().includes(keyword) ||
        item.phone?.toLowerCase().includes(keyword)
      );
    });
  }, [payments, search]);

  const totalPage = Math.max(1, Math.ceil(filteredPayments.length / limit));

  const paginatedPayments = filteredPayments.slice(
    (page - 1) * limit,
    page * limit,
  );

  const handleOpenDetail = (payment: any) => {
    navigate(`/payment/bill/${payment.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Quản lý hóa đơn thanh toán</h1>

          <p className="mt-1 text-sm text-gray-500">
            Danh sách toàn bộ hóa đơn thanh toán của khách hàng
          </p>
        </div>

        {/* FILTER */}
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[300px] flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm mã hóa đơn, khách hàng..."
                className="h-12 w-full rounded-2xl border border-gray-200 pl-11 pr-4 outline-none"
              />
            </div>

            <select
              value={selectedDay}
              onChange={(e) =>
                setSelectedDay(e.target.value ? Number(e.target.value) : "")
              }
              className="h-12 rounded-xl border border-gray-200 px-4"
            >
              <option value="">Tất cả ngày</option>

              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Ngày {day}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-12 rounded-xl border border-gray-200 px-4"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-12 rounded-xl border border-gray-200 px-4"
            >
              {Array.from(
                { length: 10 },
                (_, i) => new Date().getFullYear() - 5 + i,
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-12 rounded-xl border border-gray-200 px-4"
            >
              <option value="">Tất cả trạng thái</option>

              <option value="paid">Đã thanh toán</option>

              <option value="partial_paid">Thanh toán một phần</option>

              <option value="pending">Chờ thanh toán</option>
            </select>

            <button
              onClick={handleFilter}
              className="rounded-xl bg-amber-600 px-5 text-white hover:bg-amber-700"
            >
              Lọc
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50">
                <tr>
                  <th className="p-3 text-left">Mã hóa đơn</th>

                  <th className="p-3 text-left">Khách hàng</th>

                  <th className="p-3 text-left">SĐT</th>

                  <th className="p-3 text-left">Dịch vụ</th>

                  <th className="p-3 text-left">Gói dịch vụ</th>

                  <th className="p-3 text-left">Tổng tiền</th>

                  <th className="p-3 text-left">Đã thanh toán</th>

                  <th className="p-3 text-left">Còn lại</th>

                  <th className="p-3 text-left">Trạng thái</th>

                  <th className="p-3 text-left">Ngày tạo</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  paginatedPayments.map((item: any) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className="cursor-pointer border-t hover:bg-amber-50"
                    >
                      <td className="p-3 font-semibold">{item.payment_code}</td>

                      <td className="p-3">{item.customer_name}</td>

                      <td className="p-3">{item.phone}</td>

                      <td className="p-3">{item.service_names}</td>

                      <td className="p-3">{item.package_names}</td>

                      <td className="p-3">{formatPrice(item.final_amount)}</td>

                      <td className="p-3">{formatPrice(item.paid_amount)}</td>

                      <td className="p-3">
                        {formatPrice(item.remaining_amount)}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : item.status === "partial_paid"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status === "paid"
                            ? "Đã thanh toán"
                            : item.status === "partial_paid"
                              ? "Thanh toán một phần"
                              : "Chờ thanh toán"}
                        </span>
                      </td>

                      <td className="p-3">
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {loading && (
              <div className="py-10 text-center text-gray-400">
                Đang tải dữ liệu...
              </div>
            )}

            {!loading && paginatedPayments.length === 0 && (
              <div className="py-10 text-center text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* PAGINATION */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            Tổng {filteredPayments.length} hóa đơn
          </p>

          <div className="flex items-center gap-4">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-10 rounded-xl border border-gray-200 px-3"
            >
              {[10, 20, 50].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <span className="text-sm">
              Trang {page}/{totalPage}
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="rounded-lg border p-2"
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border p-2"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                disabled={page === totalPage}
                onClick={() => setPage((prev) => Math.min(totalPage, prev + 1))}
                className="rounded-lg border p-2"
              >
                <ChevronRight size={16} />
              </button>

              <button
                disabled={page === totalPage}
                onClick={() => setPage(totalPage)}
                className="rounded-lg border p-2"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
