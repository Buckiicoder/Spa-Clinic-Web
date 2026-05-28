import { useEffect, useMemo, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Percent,
  Plus,
  Search,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";

import DiscountModal from "../modal/DiscountModal";
import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  fetchDiscounts,
  selectDiscounts,
  selectDiscountLoading,
} from "../features/discount/discountSlice";

import { formatPrice } from "../features/product/productFunction";

export default function Discount() {
  const dispatch = useAppDispatch();

  const discounts = useAppSelector(selectDiscounts);

  const loading = useAppSelector(selectDiscountLoading);

  const [search, setSearch] = useState("");

  const [onlyActive, setOnlyActive] = useState(false);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [openModal, setOpenModal] = useState(false);

  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchDiscounts());
  }, [dispatch]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((item: any) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.name?.toLowerCase().includes(keyword) ||
        item.code?.toLowerCase().includes(keyword);

      const matchStatus = onlyActive ? item.is_active : true;

      return matchSearch && matchStatus;
    });
  }, [discounts, search, onlyActive]);

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPage = Math.max(1, Math.ceil(filteredDiscounts.length / limit));

  const paginatedDiscounts = filteredDiscounts.slice(
    (page - 1) * limit,
    page * limit,
  );

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (e: React.MouseEvent, discount: any) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa mã giảm giá "${discount.name}" không?`,
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteDiscount(discount.id)).unwrap();
    } catch (err) {
      console.log(err);

      alert("Xóa mã giảm giá thất bại");
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedDiscount) {
        await dispatch(
          updateDiscount({
            id: selectedDiscount.id,
            data,
          }),
        ).unwrap();
      } else {
        await dispatch(createDiscount(data)).unwrap();
      }

      setOpenModal(false);

      setSelectedDiscount(null);
    } catch (err) {
      console.log(err);

      alert("Lưu mã giảm giá thất bại");
    }
  };

  const handleOpenEdit = (discount: any) => {
    setSelectedDiscount(discount);

    setOpenModal(true);
  };

  const renderDiscountValue = (item: any) => {
    if (item.discount_type === "PERCENT") {
      return `${item.discount_value}%`;
    }

    return formatPrice(item.discount_value);
  };

  const renderCustomerRank = (rank: string | null) => {
    if (!rank) return "Tất cả khách";

    switch (rank) {
      case "BRONZE":
        return "Bronze";

      case "SILVER":
        return "Silver";

      case "GOLD":
        return "Gold";

      case "DIAMOND":
        return "Diamond";

      case "VIP":
        return "VIP";

      case "SUPER_VIP":
        return "Super VIP";

      default:
        return rank;
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-black">Mã giảm giá</h1>

          <button
            onClick={() => {
              setSelectedDiscount(null);

              setOpenModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Thêm mã giảm giá
          </button>
        </div>

        {/* FILTER */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
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
                placeholder="Tìm kiếm theo tên hoặc mã giảm giá..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* TOGGLE */}
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
              Chỉ đang hoạt động
            </label>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-gray-700">
                <tr>
                  <th className="p-3 text-left">ID</th>

                  <th className="p-3 text-left">Mã giảm giá</th>

                  <th className="p-3 text-left">Tên chương trình</th>

                  <th className="p-3 text-left">Loại giảm</th>

                  <th className="p-3 text-left">Giá trị</th>

                  <th className="p-3 text-left">Đơn tối thiểu</th>

                  <th className="p-3 text-left">Giới hạn</th>

                  <th className="p-3 text-left">Rank áp dụng</th>

                  <th className="p-3 text-left">Hạn sử dụng</th>

                  <th className="p-3 text-left">Trạng thái</th>

                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  paginatedDiscounts.map((item: any) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEdit(item)}
                      className="cursor-pointer border-t transition hover:bg-amber-50"
                    >
                      <td className="p-3 font-medium">{item.id}</td>

                      <td className="p-3">
                        <div className="font-semibold text-amber-700">
                          {item.code}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium">{item.name}</div>

                        {item.description && (
                          <div className="mt-1 line-clamp-1 text-xs text-gray-400">
                            {item.description}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.discount_type === "PERCENT"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.discount_type === "PERCENT"
                            ? "Phần trăm"
                            : "Tiền mặt"}
                        </span>
                      </td>

                      <td className="p-3 font-semibold text-red-600">
                        {renderDiscountValue(item)}
                      </td>

                      <td className="p-3">
                        {formatPrice(item.min_order_amount || 0)}
                      </td>

                      <td className="p-3">
                        {item.used_count || 0}/{item.usage_limit || "∞"}
                      </td>

                      <td className="p-3">
                        {renderCustomerRank(item.minimum_customer_rank)}
                      </td>

                      <td className="p-3">
                        <div>
                          {new Date(item.start_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>

                        <div className="text-xs text-gray-400">
                          đến{" "}
                          {new Date(item.end_date).toLocaleDateString("vi-VN")}
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.is_active
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              handleOpenEdit(item);
                            }}
                            className="rounded-lg bg-amber-500 px-3 py-1 text-xs text-white transition hover:bg-amber-600"
                          >
                            Sửa
                          </button>

                          <button
                            onClick={(e) => handleDelete(e, item)}
                            className="rounded-lg border px-3 py-1 text-xs transition hover:bg-gray-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* LOADING */}
            {loading && (
              <div className="py-10 text-center text-gray-400">
                Đang tải dữ liệu...
              </div>
            )}

            {/* EMPTY */}
            {!loading && paginatedDiscounts.length === 0 && (
              <div className="py-10 text-center text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-500">
            Tổng cộng {filteredDiscounts.length} mã giảm giá
          </p>

          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            {/* LIMIT */}
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

      <DiscountModal
        open={openModal}
        initialData={selectedDiscount}
        onClose={() => {
          setOpenModal(false);

          setSelectedDiscount(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
