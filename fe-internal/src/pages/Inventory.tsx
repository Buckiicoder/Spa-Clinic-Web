import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PackagePlus,
  Search,
  X,
  Trash2,
  Plus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  fetchInventoryTransactions,
  selectInventoryTransactionLoading,
  selectInventoryTransactions,
  createInventoryTransaction,
} from "../features/inventoryTransaction/inventoryTransactionSlice";
import { formatPrice } from "../features/product/productFunction";
import InventoryModal from "../modal/InventoryModal";

export default function Inventory() {
  const dispatch = useAppDispatch();

  const transactions = useAppSelector(selectInventoryTransactions);
  const loading = useAppSelector(selectInventoryTransactionLoading);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [openModal, setOpenModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchInventoryTransactions());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    return transactions.filter((item: any) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.code.toLowerCase().includes(keyword) ||
        (item.note || "").toLowerCase().includes(keyword);

      const matchType = typeFilter === "ALL" ? true : item.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [transactions, search, typeFilter]);

  const totalPage = Math.max(1, Math.ceil(filteredData.length / limit));

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Quản lý nhập / xuất kho
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Theo dõi toàn bộ các phiếu nhập và xuất kho của sản phẩm
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <PackagePlus size={18} />
            Nhập kho
          </button>
        </div>

        {/* Filter */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
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
                placeholder="Tìm kiếm theo mã phiếu hoặc ghi chú..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-1">
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  typeFilter === "ALL"
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Tất cả
              </button>

              <button
                className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                onClick={() => {
                  setSelectedTransaction(null);
                  setOpenModal(true);
                }}
              >
                <Plus size={18} />
                Nhập kho
              </button>

              <button
                onClick={() => setTypeFilter("EXPORT")}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  typeFilter === "EXPORT"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Xuất kho
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Tổng phiếu</p>
            <h2 className="mt-2 text-3xl font-bold text-black">
              {transactions.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="text-sm text-green-700">Phiếu nhập</p>
            <h2 className="mt-2 text-3xl font-bold text-green-700">
              {transactions.filter((x: any) => x.type === "IMPORT").length}
            </h2>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-red-700">Phiếu xuất</p>
            <h2 className="mt-2 text-3xl font-bold text-red-700">
              {transactions.filter((x: any) => x.type === "EXPORT").length}
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-amber-50 text-gray-700">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Mã phiếu</th>
                  <th className="p-4 text-left">Loại</th>
                  <th className="p-4 text-left">Ngày tạo</th>
                  <th className="p-4 text-left">Ngày giao dịch</th>
                  <th className="p-4 text-left">Chi phí phát sinh</th>
                  <th className="p-4 text-left">Ghi chú</th>
                  <th className="p-4 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  paginatedData.map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-t transition hover:bg-amber-50"
                    >
                      <td className="p-4 font-medium">#{item.id}</td>

                      <td className="p-4">
                        <div className="font-semibold text-gray-900">
                          {item.code}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.type === "IMPORT"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.type === "IMPORT" ? "Nhập kho" : "Xuất kho"}
                        </span>
                      </td>

                      <td className="p-4 text-gray-600">
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </td>

                      <td className="p-4 text-gray-600">
                        {new Date(item.transaction_date).toLocaleDateString(
                          "vi-VN",
                        )}
                      </td>

                      <td className="p-4 font-medium text-gray-900">
                        {formatPrice(item.total_extra_cost || 0)}
                      </td>

                      <td className="max-w-[260px] p-4 text-gray-500">
                        <div className="truncate">
                          {item.note || "Không có"}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="rounded-lg bg-amber-500 px-3 py-1 text-xs text-white transition hover:bg-amber-600">
                            Chi tiết
                          </button>

                          <button className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
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

            {!loading && paginatedData.length === 0 && (
              <div className="py-14 text-center text-gray-400">
                Không có phiếu nhập / xuất kho nào
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            Hiển thị {paginatedData.length} / {filteredData.length} phiếu
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
                {[10, 20, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Trang {page} trên {totalPage}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronsLeft size={18} />
                </button>

                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  disabled={page === totalPage}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPage, prev + 1))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  disabled={page === totalPage}
                  onClick={() => setPage(totalPage)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gọi modal để nhập, xuất kho */}
      <InventoryModal
        open={openModal}
        initialData={selectedTransaction}
        onClose={() => {
          setOpenModal(false);
          setSelectedTransaction(null);
        }}
        onSubmit={async (data) => {
          try {
            if (selectedTransaction) {
              await dispatch(
                updateInventoryTransaction({
                  id: selectedTransaction.id,
                  data,
                }),
              ).unwrap();
            } else {
              await dispatch(createInventoryTransaction(data)).unwrap();
            }

            setOpenModal(false);
            setSelectedTransaction(null);
          } catch (error) {
            console.error(error);
            alert("Lưu phiếu nhập thất bại");
          }
        }}
      />
    </div>
  );
}
