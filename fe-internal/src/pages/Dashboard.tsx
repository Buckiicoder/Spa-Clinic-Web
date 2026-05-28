import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Search,
  Users,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchDashboardOverview,
  fetchRevenueStatistics,
  fetchTopVipCustomers,
  fetchMostBookedServices,
  selectDashboardOverview,
  selectRevenueStatistics,
  selectTopVipCustomers,
  selectMostBookedServices,
  selectDashboardLoading,
} from "../features/dashboard/dashboardSlice";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

export default function Dashboard() {
  const dispatch = useAppDispatch();

  const overview = useAppSelector(selectDashboardOverview);

  const revenueStatistics = useAppSelector(selectRevenueStatistics);

  const customers = useAppSelector(selectTopVipCustomers);

  const mostBookedServices = useAppSelector(selectMostBookedServices);

  const loading = useAppSelector(selectDashboardLoading);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    document.title = "Spa Clinic Dashboard";

    dispatch(fetchDashboardOverview());

    dispatch(fetchRevenueStatistics());

    dispatch(fetchTopVipCustomers(10));

    dispatch(fetchMostBookedServices(10));
  }, [dispatch]);

  // ================= FILTER =================
  const filteredCustomers = useMemo(() => {
    return customers.filter((item: any) => {
      const keyword = search.toLowerCase();

      return (
        item.customer_name?.toLowerCase().includes(keyword) ||
        item.phone?.toLowerCase().includes(keyword)
      );
    });
  }, [customers, search]);

  // ================= PAGINATION =================
  const totalPage = Math.max(1, Math.ceil(filteredCustomers.length / limit));

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * limit,
    page * limit,
  );

  // ================= STATS =================
  const stats = [
    {
      title: "Lịch hẹn hôm nay",
      value: overview?.today_bookings || 0,
      icon: <Calendar size={22} />,
    },
    {
      title: "Khách hàng",
      value: overview?.total_customers || 0,
      icon: <Users size={22} />,
    },
    {
      title: "Doanh thu",
      value: formatCurrency(overview?.total_revenue || 0),
      icon: <DollarSign size={22} />,
    },
    {
      title: "Dịch vụ",
      value: overview?.total_services || 0,
      icon: <BarChart3 size={22} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-black">Dashboard Tổng Quan</h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-full max-w-md">
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
                placeholder="Tìm kiếm khách hàng..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div className="h-11 w-11 rounded-full bg-amber-200" />
          </div>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((card, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">{card.title}</span>

                <span className="text-amber-600">{card.icon}</span>
              </div>

              <div className="text-2xl font-bold text-black">{card.value}</div>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* REVENUE CHART */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-amber-700">
                Doanh thu theo tháng
              </h3>
            </div>

            {/* SIMPLE CHART */}
            <div className="flex h-72 items-end gap-3 rounded-2xl bg-gray-50 p-5">
              {(revenueStatistics?.monthlyRevenue || []).map(
                (item: any, index: number) => {
                  const maxRevenue = Math.max(
                    ...(revenueStatistics?.monthlyRevenue || []).map(
                      (i: any) => i.revenue || 0,
                    ),
                    1,
                  );

                  const height = ((item.revenue || 0) / maxRevenue) * 100;

                  return (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        className="w-full rounded-t-xl bg-amber-500 transition-all"
                        style={{
                          height: `${Math.min(Math.max(height, 8), 100)}%`,
                        }}
                      />

                      <span className="text-xs text-gray-500">
                        T{item.month}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* RECENT BOOKINGS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-amber-700">
              Dịch vụ được đặt nhiều
            </h3>

            <div className="space-y-4">
              {mostBookedServices.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-400">
                  Không có dữ liệu
                </div>
              )}

              {mostBookedServices.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium text-black">
                      {item.service_name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {item.total_bookings || 0} lượt đặt
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Top
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {/* TABLE HEADER */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-amber-700">
              Danh sách khách hàng
            </h3>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Khách hàng</th>
                    <th className="p-3 text-left">Số điện thoại</th>
                    <th className="p-3 text-left">Số lần đặt</th>
                    <th className="p-3 text-left">Tổng chi tiêu</th>
                    <th className="p-3 text-left">Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading &&
                    paginatedCustomers.map((item: any) => (
                      <tr
                        key={item.id}
                        className="border-t transition hover:bg-amber-50"
                      >
                        <td className="p-3 font-medium">#{item.id}</td>

                        <td className="p-3">
                          <div className="font-medium">
                            {item.customer_name}
                          </div>

                          <div className="text-xs text-gray-400">
                            {item.email || "—"}
                          </div>
                        </td>

                        <td className="p-3">{item.phone || "—"}</td>

                        <td className="p-3">{item.total_bookings || 0}</td>

                        <td className="p-3">
                          {formatCurrency(item.total_spent || 0)}
                        </td>

                        <td className="p-3">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            VIP
                          </span>
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

              {!loading && paginatedCustomers.length === 0 && (
                <div className="py-10 text-center text-gray-400">
                  Không có dữ liệu
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-gray-500">
              {paginatedCustomers.length} trên {filteredCustomers.length} khách
              hàng
            </p>

            <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
              {/* LIMIT */}
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="font-medium">Số hàng mỗi trang</span>

                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-4 pr-8 outline-none"
                >
                  {[10, 20, 50].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {/* PAGINATION */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Trang {page} trên {totalPage}
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
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={page === totalPage}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPage, prev + 1))
                    }
                  >
                    <ChevronRight size={18} />
                  </button>

                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={page === totalPage}
                    onClick={() => setPage(totalPage)}
                  >
                    <ChevronsRight size={18} />
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
