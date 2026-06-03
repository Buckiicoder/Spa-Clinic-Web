import { useEffect, useMemo, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  User,
  Phone,
  Mail,
} from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { getImageUrl } from "../features/product/productFunction";

import {
  fetchCustomers,
  fetchCustomerDetail,
  selectCustomers,
  selectCustomerLoading,
  selectCustomerPagination,
  createCustomer,
} from "../features/customer/customerSlice";
import CustomerDetailModal from "../modal/CustomerDetailModal";
import CreateCustomer from "../modal/CreateCustomer";

export default function Customer() {
  const rankLabels: Record<string, string> = {
    BRONZE: "Đồng",
    SILVER: "Bạc",
    GOLD: "Vàng",
    DIAMOND: "Kim cương",
    VIP: "VIP",
    SUPER_VIP: "VIP Đặc biệt",
  };

  const getRankLabel = (rank?: string) => {
    return rankLabels[rank || "BRONZE"] || rank || "Đồng";
  };

  const dispatch = useAppDispatch();
  // const navigate = useNavigate();

  const customers = useAppSelector(selectCustomers);
  const loading = useAppSelector(selectCustomerLoading);
  const pagination = useAppSelector(selectCustomerPagination);

  const [openDetail, setOpenDetail] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");

  const [onlyActive, setOnlyActive] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(
      fetchCustomers({
        page,
        limit,
      }),
    );
  }, [dispatch, page, limit]);

  // ================= FILTER =================

  const filteredCustomers = useMemo(() => {
    return customers.filter((item: any) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.name?.toLowerCase().includes(keyword) ||
        item.phone?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      const matchRank = rankFilter === "all" ? true : item.rank === rankFilter;

      const matchActive = onlyActive ? item.is_active : true;

      return matchSearch && matchStatus && matchRank && matchActive;
    });
  }, [customers, search, statusFilter, rankFilter, onlyActive]);

  // ================= PAGINATION =================

  const totalPage = Math.max(1, Math.ceil(pagination.total / limit));

  const paginatedCustomers = filteredCustomers;

  // ================= UI =================

  const handleOpenDetail = async (customer: any) => {
    try {
      setDetailLoading(true);

      const result = await dispatch(fetchCustomerDetail(customer.id)).unwrap();

      setSelectedCustomer(result);

      setOpenDetail(true);
    } catch (err) {
      console.log(err);

      alert("Không thể tải thông tin khách hàng");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCustomer = async (data: any) => {
    try {
      await dispatch(createCustomer(data)).unwrap();

      setOpenCreateModal(false);

      dispatch(fetchCustomers({}));
    } catch (err: any) {
      console.log(err);

      alert(err?.message || "Không thể tạo khách hàng");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* ================= HEADER ================= */}
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Khách hàng</h1>

            <p className="mt-1 text-sm text-gray-500">
              Quản lý danh sách khách hàng trong hệ thống
            </p>
          </div>

          <button
            onClick={() => {
              setOpenCreateModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={18} />
            Thêm khách hàng
          </button>
        </div>

        {/* ================= FILTER ================= */}
        <div className="mb-6 flex flex-col gap-4">
          {/* search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
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
                placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* active toggle */}
            <label className="flex cursor-pointer items-center gap-3 whitespace-nowrap text-sm font-medium text-gray-800">
              <button
                type="button"
                onClick={() => {
                  setOnlyActive(!onlyActive);
                  setPage(1);
                }}
                className={`relative h-7 w-12 rounded-full transition ${
                  onlyActive ? "bg-black" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    onlyActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
              Chỉ khách đang hoạt động
            </label>
          </div>

          {/* select filters */}
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none"
            >
              <option value="all">Tất cả trạng thái</option>

              <option value="active">Hoạt động</option>

              <option value="inactive">Không hoạt động</option>

              <option value="blocked">Đã khóa</option>
            </select>

            {/* rank */}
            <select
              value={rankFilter}
              onChange={(e) => {
                setRankFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none"
            >
              <option value="all">Tất cả hạng khách</option>

              <option value="BRONZE">Đồng</option>

              <option value="SILVER">Bạc</option>

              <option value="GOLD">Vàng</option>

              <option value="DIAMOND">Kim cương</option>

              <option value="VIP">VIP</option>

              <option value="SUPER_VIP">VIP Đặc biệt</option>
            </select>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-gray-700">
                <tr>
                  <th className="p-3 text-left">ID</th>

                  <th className="p-3 text-left">Khách hàng</th>

                  <th className="p-3 text-left">Số điện thoại</th>

                  <th className="p-3 text-left">Email</th>

                  <th className="p-3 text-left">Giới tính</th>

                  <th className="p-3 text-left">Hạng</th>

                  <th className="p-3 text-left">Nguồn khách</th>

                  <th className="p-3 text-left">Tổng chi tiêu</th>

                  <th className="p-3 text-left">Lượt đến</th>

                  <th className="p-3 text-left">Liệu trình</th>

                  <th className="p-3 text-left">Trạng thái</th>

                  <th className="p-3 text-left">Hoạt động</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  paginatedCustomers.map((item: any) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        handleOpenDetail(item);
                      }}
                      className="cursor-pointer border-t transition hover:bg-amber-50"
                    >
                      {/* id */}
                      <td className="p-3 font-medium">#{item.id}</td>

                      {/* customer */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {item.avatar ? (
                            <img
                              src={getImageUrl(item.avatar)}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              className="h-11 w-11 rounded-full border object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border bg-gray-100 text-gray-400">
                              <User size={18} />
                            </div>
                          )}

                          <div>
                            <div className="font-semibold text-gray-900">
                              {item.name || "Chưa có tên"}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-400">
                              {item.city || "Chưa có địa chỉ"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* phone */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />

                          {item.phone || "-"}
                        </div>
                      </td>

                      {/* email */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />

                          <span className="max-w-[180px] truncate">
                            {item.email || "-"}
                          </span>
                        </div>
                      </td>

                      {/* gender */}
                      <td className="p-3 capitalize">{item.gender || "-"}</td>

                      {/* rank */}
                      <td className="p-3">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {getRankLabel(item.rank)}
                        </span>
                      </td>

                      {/* source */}
                      <td className="p-3">{item.source || "-"}</td>

                      {/* spending */}
                      <td className="p-3 font-medium">
                        {Number(item.total_spending || 0).toLocaleString(
                          "vi-VN",
                        )}{" "}
                        đ
                      </td>

                      {/* visits */}
                      <td className="p-3">{item.total_visits || 0}</td>

                      {/* profiles */}
                      <td className="p-3">{item.total_profiles || 0}</td>

                      {/* customer status */}
                      <td className="p-3">
                        <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      item.status === "active"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {item.status === "active"
      ? "Hoạt động"
      : "Ngừng hoạt động"}
  </span>
                      </td>

                      {/* active */}
                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {item.is_active ? "Đang hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* loading */}
            {loading && (
              <div className="py-10 text-center text-gray-400">
                Đang tải dữ liệu...
              </div>
            )}

            {/* empty */}
            {!loading && paginatedCustomers.length === 0 && (
              <div className="py-10 text-center text-gray-400">
                Không có dữ liệu khách hàng
              </div>
            )}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
             Tổng {pagination.total} khách hàng
          </p>

          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            {/* limit */}
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

            {/* pagination */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Trang {page} trên {totalPage}
              </span>

              <div className="flex items-center gap-2">
                {/* first */}
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft size={18} />
                </button>

                {/* prev */}
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* next */}
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={page === totalPage}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPage, prev + 1))
                  }
                >
                  <ChevronRight size={18} />
                </button>

                {/* last */}
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

      <CustomerDetailModal
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setSelectedCustomer(null);
        }}
        data={selectedCustomer}
        loading={detailLoading}
      />

      <CreateCustomer
        open={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
        }}
        onSubmit={handleCreateCustomer}
      />
    </div>
  );
}
