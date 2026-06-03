import { useEffect, useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  DollarSign,
  Search,
  Users,
  RefreshCcw,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../app/hook";

import {
  fetchPayrolls,
  selectPayrollLoading,
  selectPayrolls,
  runDailyPayrollSync,
} from "../../features/payroll/payrollSlice";

import { formatPrice } from "../../utils/generalFunction";

interface Props {
  embedded?: boolean;
}

export default function PayrollTable({ embedded = false }: Props) {
  const dispatch = useAppDispatch();

  const payrolls = useAppSelector(selectPayrolls);

  const loading = useAppSelector(selectPayrollLoading);

  const [search, setSearch] = useState("");

  const [employeeType, setEmployeeType] = useState("ALL");

  const [position, setPosition] = useState("ALL");

  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1),
  );

  const [selectedYear, setSelectedYear] = useState(
    String(currentDate.getFullYear()),
  );

  const [sortSalary, setSortSalary] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchPayrolls());
  }, [dispatch]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredPayrolls = useMemo(() => {
    let data = [...payrolls];

    // SEARCH
    if (search) {
      const keyword = search.toLowerCase();

      data = data.filter((item: any) => {
        return (
          item.staff_name?.toLowerCase().includes(keyword) ||
          item.staff_phone?.includes(keyword)
        );
      });
    }

    // EMPLOYEE TYPE
    if (employeeType !== "ALL") {
      data = data.filter((item: any) => item.employee_type === employeeType);
    }

    // MONTH
    if (selectedMonth !== "ALL") {
      data = data.filter(
        (item: any) => String(item.month) === selectedMonth,
      );
    }

    // YEAR
    if (selectedYear !== "ALL") {
      data = data.filter(
        (item: any) => String(item.year) === selectedYear,
      );
    }

    // POSITION
    if (position !== "ALL") {
      data = data.filter((item: any) => item.position_name === position);
    }

    // SORT SALARY
    data.sort((a: any, b: any) => {
      if (sortSalary === "asc") {
        return a.net_salary - b.net_salary;
      }

      return b.net_salary - a.net_salary;
    });

    return data;
  }, [
    payrolls,
    search,
    employeeType,
    position,
    selectedMonth,
    selectedYear,
    sortSalary,
  ]);

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPage = Math.max(1, Math.ceil(filteredPayrolls.length / limit));

  const paginatedPayrolls = filteredPayrolls.slice(
    (page - 1) * limit,
    page * limit,
  );

  // ======================================================
  // POSITIONS
  // ======================================================

  const positions = useMemo(() => {
    const unique = new Set(payrolls.map((item: any) => item.position_name));

    return Array.from(unique);
  }, [payrolls]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 6 }, (_, index) => String(currentYear - index));
  }, []);

  return (
    <div className={embedded ? "" : "min-h-screen bg-[#f7f7f7] p-6"}>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Quản lý lương nhân viên
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Theo dõi lương, công, hoa hồng và phụ cấp nhân viên
            </p>
          </div>

          {/* <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <Users size={16} />
                Tổng nhân viên: <b/>
                {
                  filteredPayrolls.length
                }
              </div>
            </div>
          </div> */}

          <div className="flex items-center gap-3">
            {/* SYNC PAYROLL */}
            <button
              onClick={async () => {
                try {
                  await dispatch(runDailyPayrollSync()).unwrap();
                } catch (err) {
                  console.error(err);
                }
              }}
              disabled={loading}
              className="flex h-12 items-center gap-2 rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCcw size={16} />

              {loading ? "Đang tính lương..." : "Tính lại toàn bộ lương"}
            </button>

            {/* TOTAL */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <Users size={16} />
                Tổng nhân viên:
                <b>{filteredPayrolls.length}</b>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* FILTER */}
        {/* ================================================= */}

        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* LEFT */}
          <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
            {/* SEARCH */}
            <div className="relative w-full max-w-xl">
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
                placeholder="Tìm nhân viên theo tên hoặc mã..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* EMPLOYEE TYPE */}
            <select
              value={employeeType}
              onChange={(e) => {
                setEmployeeType(e.target.value);

                setPage(1);
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none"
            >
              <option value="ALL">Tất cả loại nhân viên</option>

              <option value="FULLTIME">Fulltime</option>

              <option value="PARTTIME">Parttime</option>
            </select>

            {/* POSITION */}
            <select
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);

                setPage(1);
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none"
            >
              <option value="ALL">Tất cả chức vụ</option>

              {positions.map((item) => (
                <option key={String(item)} value={String(item)}>
                  {String(item)}
                </option>
              ))}
            </select>

            {/* MONTH */}
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);

                setPage(1);
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={String(month)}>
                  Tháng {month}
                </option>
              ))}
            </select>

            {/* YEAR */}
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);

                setPage(1);
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-gray-700">
                <tr>
                  <th className="whitespace-nowrap p-4 text-left">Nhân viên</th>

                  <th className="whitespace-nowrap p-4 text-left">Chức vụ</th>

                  <th className="whitespace-nowrap p-4 text-left">Loại</th>

                  <th className="whitespace-nowrap p-4 text-left">
                    Công / Giờ
                  </th>

                  <th className="whitespace-nowrap p-4 text-left">
                    Lương tạm tính
                  </th>

                  <th className="whitespace-nowrap p-4 text-left">Hoa hồng</th>

                  <th className="whitespace-nowrap p-4 text-left">Phụ cấp</th>

                  <th className="whitespace-nowrap p-4 text-left">Giảm trừ</th>

                  <th className="whitespace-nowrap p-4 text-left">Đi muộn</th>

                  <th className="whitespace-nowrap p-4 text-left">
                    <button
                      onClick={() =>
                        setSortSalary((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        )
                      }
                      className="flex items-center gap-2 font-semibold"
                    >
                      Lương thực nhận
                      {sortSalary === "asc" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      )}
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  paginatedPayrolls.map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-t transition hover:bg-amber-50"
                    >
                      {/* STAFF */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-semibold text-black">
                              {item.staff_name}
                            </div>

                            <div className="text-xs text-gray-400">
                              {item.staff_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* POSITION */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Briefcase size={15} className="text-gray-400" />

                          {item.position_name}
                        </div>
                      </td>

                      {/* TYPE */}
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.employee_type === "FULLTIME"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.employee_type === "FULLTIME"
                            ? "Fulltime"
                            : "Parttime"}
                        </span>
                      </td>

                      {/* WORK */}
                      <td className="p-4">
                        {item.employee_type === "FULLTIME" ? (
                          <div>
                            <div className="font-medium">
                              {item.actual_work_days} công
                            </div>

                            <div className="text-xs text-gray-400">
                              Chuẩn: {item.standard_work_days}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">
                              {item.actual_work_hours} giờ
                            </div>

                            <div className="text-xs text-gray-400">
                              Theo giờ
                            </div>
                          </div>
                        )}
                      </td>

                      {/* BASE */}
                      <td className="p-4 font-medium">
                        {formatPrice(item.gross_salary)}
                      </td>

                      {/* COMMISSION */}
                      <td className="p-4">
                        <span className="font-medium text-green-600">
                          +{formatPrice(item.commission_total)}
                        </span>
                      </td>

                      {/* ALLOWANCE */}
                      <td className="p-4">
                        <span className="font-medium text-blue-600">
                          +{formatPrice(item.allowance_total)}
                        </span>
                      </td>

                      {/* DEDUCTION */}
                      <td className="p-4">
                        <span className="font-medium text-red-600">
                          -{formatPrice(item.deduction_total)}
                        </span>
                      </td>

                      {/* LATE */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock3 size={15} className="text-gray-400" />

                          <span>{item.late_count || 0} lần</span>
                        </div>
                      </td>

                      {/* NET */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold text-amber-700">
                          <DollarSign size={16} />

                          {formatPrice(item.net_salary)}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* LOADING */}
            {loading && (
              <div className="py-10 text-center text-gray-400">
                Đang tải bảng lương...
              </div>
            )}

            {/* EMPTY */}
            {!loading && paginatedPayrolls.length === 0 && (
              <div className="py-10 text-center text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            Tổng {filteredPayrolls.length} nhân viên
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* LIMIT */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Số hàng</span>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));

                  setPage(1);
                }}
                className="h-10 rounded-xl border border-gray-200 px-4"
              >
                {[10, 20, 50].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Trang {page} / {totalPage}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronsLeft size={18} />
                </button>

                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  disabled={page === totalPage}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPage, prev + 1))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  disabled={page === totalPage}
                  onClick={() => setPage(totalPage)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-100 disabled:opacity-50"
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
