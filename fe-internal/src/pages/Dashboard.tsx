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

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchDashboardOverview,
  selectDashboardOverview,
  selectDashboardLoading,
  fetchRevenueByDateRange,
  selectWeeklyRevenue,
} from "../features/dashboard/dashboardSlice";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const getWeekRange = (dateString: string) => {
  const date = new Date(dateString);

  const day = date.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);

  monday.setDate(date.getDate() + diffToMonday);

  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: monday,
    endDate: sunday,
  };
};

const CUSTOMER_COLORS = ["#d97706", "#f59e0b"];

export default function Dashboard() {
  const dispatch = useAppDispatch();

  const overview = useAppSelector(selectDashboardOverview);

  const customers = useMemo(
    () => overview?.customers?.vip_customers ?? [],
    [overview],
  );

  const mostBookedServices = useMemo(
    () => overview?.services?.top_booked_services ?? [],
    [overview],
  );
  console.log(overview?.services?.top_booked_services);

  const mostBookedPackages = useMemo(
    () => overview?.services?.top_booked_packages ?? [],
    [overview],
  );

  const topAttendanceStaffs = useMemo(
    () => overview?.staffs?.top_attendance_staffs ?? [],
    [overview],
  );

  const topDoctorRevenue = useMemo(
    () => overview?.staffs?.top_doctor_revenue ?? [],
    [overview],
  );

  const topTechnicianRevenue = useMemo(
    () => overview?.staffs?.top_technician_revenue ?? [],
    [overview],
  );

  const lowStockProducts = useMemo(
    () => overview?.products?.low_stock_products ?? [],
    [overview],
  );

  const revenueStatistics = useMemo(
    () =>
      overview?.revenues ?? {
        today_revenue: 0,
        month_revenue: 0,
        year_revenue: 0,
      },
    [overview],
  );

  const loading = useAppSelector(selectDashboardLoading);

  const weeklyRevenue = useAppSelector(selectWeeklyRevenue);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    const { startDate, endDate } = getWeekRange(selectedDate);

    dispatch(
      fetchRevenueByDateRange({
        startDate: startDate.toISOString().split("T")[0],

        endDate: endDate.toISOString().split("T")[0],
      }),
    );
  }, [selectedDate, dispatch]);

  useEffect(() => {
    document.title = "Spa Clinic Dashboard";

    dispatch(fetchDashboardOverview());
  }, [dispatch]);

  // ================= FILTER =================
  const filteredCustomers = useMemo(() => {
    return customers.filter((item: any) => {
      const keyword = search.toLowerCase();

      return (
        item.name?.toLowerCase().includes(keyword) ||
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
  const stats = useMemo(
    () => [
      {
        title: "Doanh thu hôm nay",
        value: formatCurrency(revenueStatistics.today_revenue),
        icon: <DollarSign size={22} />,
      },
      {
        title: "Doanh thu tháng",
        value: formatCurrency(revenueStatistics.month_revenue),
        icon: <Calendar size={22} />,
      },
      {
        title: "Doanh thu năm",
        value: formatCurrency(revenueStatistics.year_revenue),
        icon: <BarChart3 size={22} />,
      },
      {
        title: "Khách VIP",
        value: customers.length,
        icon: <Users size={22} />,
      },
    ],
    [revenueStatistics, customers],
  );

  const weeklyRevenueData = useMemo(() => {
    const { startDate } = getWeekRange(selectedDate);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(startDate);

      current.setDate(startDate.getDate() + i);

      const key = current.toISOString().split("T")[0];

      const found =
        weeklyRevenue.find((x: any) => x.revenue_date?.split("T")[0] === key) ||
        {};

      days.push({
        date: key,

        dayLabel: current.toLocaleDateString("vi-VN", {
          weekday: "short",
        }),

        revenue: Number(found.revenue || 0),
      });
    }

    return days;
  }, [selectedDate, weeklyRevenue]);

  const customerAnalytics = useMemo(() => {
    return [
      {
        name: "VIP",
        value: customers.length,
      },
    ];
  }, [customers]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
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
                Doanh thu theo tuần
              </h3>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="
        rounded-xl
        border
        border-gray-200
        px-3
        py-2
        text-sm
      "
              />
            </div>

            <div className="h-80 rounded-2xl bg-[#faf7f2] p-4">
              <ResponsiveContainer
                width="100%"
                height={window.innerWidth < 640 ? 250 : 320}
              >
                <BarChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="dayLabel" tick={{ fontSize: 12 }} />

                  <YAxis
                    tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
                  />

                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />

                  <Bar
                    dataKey="revenue"
                    radius={[10, 10, 0, 0]}
                    fill="#d97706"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-600">
              Xu hướng doanh thu
            </h4>

            <div className="h-80 rounded-2xl bg-[#faf7f2] p-4">
              <ResponsiveContainer
                width="100%"
                height={window.innerWidth < 640 ? 250 : 320}
              >
                <LineChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="dayLabel" />

                  <YAxis
                    tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
                  />

                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RECENT BOOKINGS */}
        {/* <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
                  <p className="font-medium text-black">{item.name}</p>

                  <p className="mt-1 text-xs text-gray-400">
                    {item.total_payments || 0} lượt đặt
                  </p>
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Top
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {/* DOCTOR PERFORMANCE */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* DOCTOR */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-amber-700">
              Hiệu suất bác sĩ
            </h3>

            <div className="space-y-5">
              {topDoctorRevenue.map((item: any) => (
                <div
                  key={item.doctor_id}
                  className="rounded-2xl border border-gray-100 bg-[#faf7f2] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-black">{item.name}</p>

                      <p className="text-xs text-gray-400">#{item.doctor_id}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Hồ sơ</p>

                      <p className="font-bold text-amber-700">
                        {item.total_profiles}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${Math.min(
                          item.total_revenue / 1000000,
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="text-sm font-medium text-gray-700">
                    {formatCurrency(item.total_revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TECHNICIAN */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-amber-700">
              Hiệu suất kỹ thuật viên
            </h3>

            <div className="space-y-5">
              {topTechnicianRevenue.map((item: any) => (
                <div
                  key={item.user_id}
                  className="rounded-2xl border border-gray-100 bg-[#faf7f2] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-black">{item.name}</p>

                      <p className="text-xs text-gray-400">#{item.user_id}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Sessions</p>

                      <p className="font-bold text-amber-700">
                        {item.total_sessions}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-orange-400"
                      style={{
                        width: `${Math.min(item.total_work_hours, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>{item.total_work_hours} giờ</span>

                    <span className="font-semibold text-amber-700">
                      {formatCurrency(item.realtime_salary)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-amber-700">
              Nhân viên chuyên cần
            </h3>

            <div className="space-y-3">
              {topAttendanceStaffs.map((item: any) => (
                <div
                  key={item.user_id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>

                    <p className="text-xs text-gray-400">
                      {item.position_name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-amber-700">
                      {item.total_work_days}
                    </p>

                    <p className="text-xs text-gray-400">ngày công</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SERVICE ANALYTICS */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          {/* MOST BOOKED */}
          <div className="grid rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-amber-700">
              Dịch vụ được đặt nhiều nhất
            </h3>

            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height={window.innerWidth < 640 ? 250 : 320}
              >
                <BarChart data={mostBookedServices}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={80}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="total_bookings"
                    fill="#d97706"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PACKAGE ANALYTICS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-lg font-semibold text-amber-700">
              Gói liệu trình bán chạy
            </h3>

            <div className="h-80">
              <ResponsiveContainer
                width="100%"
                height={window.innerWidth < 640 ? 250 : 320}
              >
                <BarChart data={mostBookedPackages}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={80}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="total_bookings"
                    fill="#d97706"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CUSTOMER ANALYTICS */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-amber-700">
            Phân bố khách hàng
          </h3>

          <div className="h-80">
            <ResponsiveContainer
              width="100%"
              height={window.innerWidth < 640 ? 250 : 320}
            >
              <PieChart>
                <Pie
                  data={customerAnalytics}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="70%"
                  label
                >
                  {customerAnalytics.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOW STOCK PRODUCTS */}
        {/* <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-red-500">
            Sản phẩm sắp hết hàng
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-100 bg-[#faf7f2] p-4"
              >
                <div className="mb-3 flex items-center gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />

                  <div>
                    <p className="font-semibold text-black">{item.name}</p>

                    <p className="text-xs text-gray-400">
                      {item.category_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tồn kho</span>

                  <span className="font-bold text-red-500">
                    {item.stock_quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* TABLE */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {/* TABLE HEADER */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-amber-700">
              Danh sách khách hàng
            </h3>
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

              {/* <div className="h-11 w-11 rounded-full bg-amber-200" /> */}
            </div>
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
                          <div className="font-medium">{item.name}</div>

                          <div className="text-xs text-gray-400">
                            {item.email || "—"}
                          </div>
                        </td>

                        <td className="p-3">{item.phone || "—"}</td>

                        <td className="p-3">{item.total_payments || 0}</td>

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
