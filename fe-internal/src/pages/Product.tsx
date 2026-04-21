import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
} from "lucide-react";

export default function Product() {
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // mock data tạm thời
  const products = [
    {
      id: 1,
      name: "Áo",
      sku: "-",
      originalPrice: 30000,
      currentPrice: 30000,
      unit: "cái",
      active: true,
    },
    {
      id: 2,
      name: "Quần jean",
      sku: "QJ001",
      originalPrice: 450000,
      currentPrice: 399000,
      unit: "cái",
      active: false,
    },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      const matchStatus = onlyActive ? item.active : true;

      return matchSearch && matchStatus;
    });
  }, [products, search, onlyActive]);

  const totalPage = Math.max(1, Math.ceil(filteredProducts.length / limit));

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * limit,
    page * limit,
  );

  const formatPrice = (value: number) =>
    value.toLocaleString("vi-VN") + "đ";

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>

          <button
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            onClick={() => {
              // TODO: mở modal thêm sản phẩm
            }}
          >
            <Plus size={18} />
            Thêm sản phẩm
          </button>
        </div>

        {/* Filter */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
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
                placeholder="Tìm kiếm theo tên, SKU, mã vạch..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* Toggle */}
            <label className="flex cursor-pointer items-center gap-3 whitespace-nowrap text-base font-medium text-gray-800">
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

              Chỉ đang bán
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-16 px-4 py-4"></th>

                  {[
                    "Tên",
                    "SKU",
                    "Giá bán",
                    "Giá bán hiện tại",
                    "ĐVT",
                    "Trạng thái",
                    "Thao tác",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-4 text-left font-semibold"
                    >
                      <div className="flex items-center gap-1">
                        {header}
                        {header !== "Thao tác" && (
                          <ChevronDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      {/* ảnh */}
                      <td className="px-4 py-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
                          <ImageIcon size={24} />
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-900">
                        {item.name}
                      </td>

                      <td className="px-4 py-4 text-gray-600">{item.sku}</td>

                      <td className="px-4 py-4 text-gray-900">
                        {formatPrice(item.originalPrice)}
                      </td>

                      <td className="px-4 py-4 text-gray-900">
                        {formatPrice(item.currentPrice)}
                      </td>

                      <td className="px-4 py-4 text-gray-600">{item.unit}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            item.active
                              ? "border-green-300 bg-green-50 text-green-600"
                              : "border-red-300 bg-red-50 text-red-600"
                          }`}
                        >
                          {item.active ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
                            onClick={() => {
                              // TODO: mở modal sửa
                            }}
                          >
                            <Pencil size={16} />
                            Sửa
                          </button>

                          <button
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-14 text-center text-gray-400"
                    >
                      Không có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            0 trên {filteredProducts.length} hàng được chọn.
          </p>

          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            {/* limit */}
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="font-medium">Số hàng mỗi trang</span>

              <div className="relative">
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
            </div>

            {/* pagination */}
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
                  onClick={() => setPage((prev) => Math.min(totalPage, prev + 1))}
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
  );
}