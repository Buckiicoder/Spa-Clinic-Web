import { useEffect, useMemo, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProducts,
  selectProducts,
  selectProductLoading,
} from "../features/product/productSlice";
import ProductModal from "../modal/ProductModal";
import { getImageUrl, formatPrice } from "../features/product/productFunction";


export default function Product() {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductLoading);

  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        (item.barcode || "").toLowerCase().includes(keyword);

      const matchStatus = onlyActive ? item.is_active : true;

      return matchSearch && matchStatus;
    });
  }, [products, search, onlyActive]);

  const totalPage = Math.max(1, Math.ceil(filteredProducts.length / limit));

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * limit,
    page * limit,
  );

  const handleSubmit = async (data: any) => {
    try {
      if (selectedProduct) {
        await dispatch(
          updateProduct({
            id: selectedProduct.id,
            data,
          }),
        ).unwrap();
      } else {
        await dispatch(createProduct(data)).unwrap();
      }

      setOpenModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleDelete = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`,
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteProduct(product.id)).unwrap();
    } catch (err) {
      console.log(err);
      alert("Xóa sản phẩm thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-black">Sản phẩm</h1>

          <button
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            onClick={() => {
              setSelectedProduct(null);
              setOpenModal(true);
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
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Mã</th>
                  <th className="p-3 text-left">Ảnh</th>
                  <th className="p-3 text-left">Tên sản phẩm</th>
                  <th className="p-3 text-left">Mã</th>
                  <th className="p-3 text-left">Giá niêm yết</th>
                  <th className="p-3 text-left">Giá hiện tại</th>
                  <th className="p-3 text-left">Tồn kho</th>
                  <th className="p-3 text-left">ĐVT</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  paginatedProducts.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEdit(item)}
                      className="cursor-pointer border-t transition hover:bg-amber-50"
                    >
                      <td className="p-3 font-medium">{item.code}</td>

                      <td className="px-1 py-3">
                        {item.image_url ? (
    <img
      src={getImageUrl(item.image_url)}
      alt={item.name}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
      className="h-12 w-12 rounded-lg border object-cover"
    />
  ) : (
    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-gray-50 text-gray-400">
      <ImageIcon size={18} />
    </div>
  )}
                      </td>

                      <td className="p-3">
                        <div className="font-medium">{item.name}</div>

                        {item.category_name && (
                          <div className="text-xs text-gray-400">
                            {item.category_name}
                          </div>
                        )}
                      </td>

                      <td className="p-3">{item.code}</td>

                      <td className="p-3">{formatPrice(item.sale_price)}</td>

                      <td className="p-3">{formatPrice(item.current_price)}</td>

                      <td className="p-3">{item.stock_quantity}</td>

                      <td className="p-3">{item.unit}</td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.is_active ? "Đang bán" : "Ngừng bán"}
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

            {loading && (
              <div className="py-10 text-center text-gray-400">
                Đang tải dữ liệu...
              </div>
            )}

            {!loading && paginatedProducts.length === 0 && (
              <div className="py-10 text-center text-gray-400">
                Không có dữ liệu
              </div>
            )}
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

      <ProductModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedProduct(null);
        }}
        initialData={selectedProduct}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
