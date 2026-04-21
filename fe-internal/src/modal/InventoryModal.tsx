import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useAppSelector } from "../app/hook";
import { Image as ImageIcon, Search } from "lucide-react";
import { useAppDispatch } from "../app/hook";
import {
  fetchProducts,
  selectProducts,
} from "../features/product/productSlice";
import { formatPrice, getImageUrl } from "../features/product/productFunction";
import ProductModal from "./ProductModal";
import { createProduct } from "../features/product/productSlice";

interface InventoryItem {
  product_id: number | null;
  quantity: number;
  unit_price: number;
  note: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function InventoryModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: Props) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);

  useEffect(() => {
    if (open) {
      dispatch(fetchProducts());
    }
  }, [dispatch, open]);

  const [searchProduct, setSearchProduct] = useState("");

  const [openProductModal, setOpenProductModal] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "IMPORT",
    transaction_date: new Date().toISOString().split("T")[0],
    note: "",
    total_extra_cost: 0,
  });

  const [items, setItems] = useState<InventoryItem[]>([]);

  const [errors, setErrors] = useState({
    product: "",
    quantity: "",
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        code: initialData.code,
        type: initialData.type,
        transaction_date: initialData.transaction_date?.split("T")[0],
        note: initialData.note || "",
        total_extra_cost: Number(initialData.total_extra_cost || 0),
      });

      setItems(
        initialData.items?.length
          ? initialData.items.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              note: item.note || "",
            }))
          : [
              {
                product_id: null,
                quantity: 1,
                unit_price: 0,
                note: "",
              },
            ],
      );
    } else {
      setForm({
        code: `NK${Date.now().toString().slice(-6)}`,
        type: "IMPORT",
        transaction_date: new Date().toISOString().split("T")[0],
        note: "",
        total_extra_cost: 0,
      });

      setItems([]);
    }
  }, [open, initialData]);

  const handleChangeItem = (
    index: number,
    field: keyof InventoryItem,
    value: any,
  ) => {
    const clone = [...items];
    clone[index] = {
      ...clone[index],
      [field]: value,
    };
    setItems(clone);
  };

  const handleRemoveRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (product: any) => {
    setErrors({ product: "", quantity: "" });

    const existedIndex = items.findIndex(
      (item) => Number(item.product_id) === Number(product.id),
    );

    if (existedIndex >= 0) {
      const clone = [...items];
      clone[existedIndex].quantity += 1;
      setItems(clone);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        product_id: Number(product.id),
        quantity: 1,
        unit_price: Number(product.current_price || 0),
        note: "",
      },
    ]);
  };

  const filteredProducts = useMemo(() => {
    const keyword = searchProduct.trim().toLowerCase();

    return products
      .filter((product: any) => {
        const matchKeyword =
          product.name?.toLowerCase().includes(keyword) ||
          product.code?.toLowerCase().includes(keyword);

        return matchKeyword;
      })
      .slice(0, 12);
  }, [products, searchProduct, items]);

  const totalAmount = useMemo(() => {
    const itemsTotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price;
    }, 0);

    return itemsTotal + Number(form.total_extra_cost || 0);
  }, [items, form.total_extra_cost]);

  const validateForm = () => {
    if (
      items.length === 0 ||
      totalAmount === Number(form.total_extra_cost || 0)
    ) {
      setErrors({
        product: "Vui lòng chọn ít nhất 1 sản phẩm nhập kho",
        quantity: "",
      });
      return false;
    }

    const invalidItem = items.find(
      (item) => !item.product_id || item.quantity <= 0 || item.unit_price < 0,
    );

    if (invalidItem) {
      setErrors({
        product: "",
        quantity: "Số lượng và đơn giá phải hợp lệ",
      });
      return false;
    }

    setErrors({ product: "", quantity: "" });
    return true;
  };

  const handleSubmitForm = () => {
    if (!validateForm()) return;

    onSubmit({
      ...form,
      total_extra_cost: Number(form.total_extra_cost || 0),
      items: items.map((item) => ({
        ...item,
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        total_price: item.quantity * item.unit_price,
      })),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-black">
              {initialData ? "Cập nhật phiếu kho" : "Tạo phiếu nhập kho"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Chọn sản phẩm và số lượng cần nhập vào kho
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Mã phiếu</label>
            <input
              disabled
              value={form.code}
              className="w-full rounded-xl border bg-gray-50 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Ngày nhập kho
            </label>
            <input
              type="date"
              value={form.transaction_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  transaction_date: e.target.value,
                })
              }
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Chi phí phát sinh (ship, thuế...)
            </label>

            <input
              type="number"
              value={form.total_extra_cost}
              onChange={(e) =>
                setForm({
                  ...form,
                  total_extra_cost: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Nhập chi phí thêm..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <textarea
              rows={1}
              value={form.note}
              onChange={(e) =>
                setForm({
                  ...form,
                  note: e.target.value,
                })
              }
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Nhập ghi chú cho phiếu nhập..."
            />
          </div>
        </div>

        <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between border-b bg-amber-50 px-4 py-3">
            <div>
              <h3 className="font-semibold text-gray-800">
                Danh sách sản phẩm
              </h3>
              <p className="text-xs text-gray-500">
                Thêm các sản phẩm cần nhập kho
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpenProductModal(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              <Plus size={16} />
              Thêm sản phẩm
            </button>
          </div>

          <div className="border-b bg-white p-4">
            <div className="mt-0 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Chọn sản phẩm
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tìm theo tên hoặc mã sản phẩm
                  </p>
                </div>

                <div className="relative w-full max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:border-2"
                  />
                </div>
              </div>

              <div className="grid max-h-[280px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left transition hover:border-amber-400 hover:bg-amber-50"
                    >
                      {product.image_url ? (
                        <img
                          src={getImageUrl(product.image_url)}
                          alt={product.name}
                          className="h-16 w-16 rounded-xl border object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-gray-100 text-gray-400">
                          <ImageIcon size={18} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900">
                          {product.name}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {product.code}
                        </div>

                        <div className="mt-2 text-sm font-semibold text-amber-700">
                          {formatPrice(product.current_price)}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          Tồn kho: {product.stock_quantity} {product.unit}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">
                    Không tìm thấy sản phẩm phù hợp
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white text-gray-600">
                <tr>
                  <th className="p-3 text-left">Sản phẩm</th>
                  <th className="p-3 text-left">Số lượng</th>
                  <th className="p-3 text-left">Đơn giá nhập</th>
                  <th className="p-3 text-left">Thành tiền</th>
                  <th className="p-3 text-left">Ghi chú</th>
                  <th className="p-3 text-center">#</th>
                </tr>
              </thead>

              <tbody>
                {items.filter((item) => item.product_id !== null).length ===
                  0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      Chưa có sản phẩm nào
                    </td>
                  </tr>
                )}

                {items
                  .map((item, originalIndex) => ({ item, originalIndex }))
                  .filter(({ item }) => item.product_id !== null)
                  .map(({ item, originalIndex }) => {
                    const selectedProduct = products.find(
                      (p: any) => Number(p.id) === Number(item.product_id),
                    );

                    return (
                      <tr key={originalIndex} className="border-t">
                        <td className="min-w-[280px] p-3">
                          <div className="font-medium text-gray-900">
                            {selectedProduct?.name || "Không xác định"}
                          </div>
                        </td>

                        <td className="p-3 w-[120px]">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleChangeItem(
                                originalIndex,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded-xl border px-3 py-2"
                          />
                        </td>

                        <td className="p-3 w-[180px]">
                          <input
                            type="number"
                            min={0}
                            value={item.unit_price}
                            onChange={(e) =>
                              handleChangeItem(
                                originalIndex,
                                "unit_price",
                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded-xl border px-3 py-2"
                          />
                        </td>

                        <td className="p-3 w-[160px] font-medium text-amber-700">
                          {formatPrice(item.quantity * item.unit_price)}
                        </td>

                        <td className="p-3 min-w-[200px]">
                          <input
                            value={item.note}
                            onChange={(e) =>
                              handleChangeItem(
                                originalIndex,
                                "note",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border px-3 py-2"
                            placeholder="Ghi chú"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(originalIndex)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {errors.product && (
              <div className="px-4 pb-3 text-sm font-medium text-red-500">
                {errors.product}
              </div>
            )}

            {errors.quantity && (
              <div className="px-4 pb-3 text-sm font-medium text-red-500">
                {errors.quantity}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
          <div>
            <p className="text-sm text-gray-500">Tổng giá trị phiếu nhập</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {formatPrice(totalAmount)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border px-5 py-2 text-gray-700 transition hover:bg-gray-100"
            >
              Hủy
            </button>

            <button
              onClick={handleSubmitForm}
              className={`rounded-xl px-5 py-2 font-medium text-white transition ${
                items.length === 0
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {initialData ? "Cập nhật phiếu" : "Lưu phiếu nhập"}
            </button>
          </div>
        </div>
      </div>
      <ProductModal
        open={openProductModal}
        onClose={() => setOpenProductModal(false)}
        initialData={null}
        onSubmit={async (data) => {
          try {
            const newProduct = await dispatch(createProduct(data)).unwrap();

            // load lại danh sách sản phẩm
            await dispatch(fetchProducts());

            // tự động chọn sản phẩm vừa tạo vào bảng nhập kho
            handleSelectProduct(newProduct);

            setOpenProductModal(false);
          } catch (error) {
            console.error(error);
            alert("Thêm sản phẩm thất bại");
          }
        }}
      />
    </div>
  );
}
