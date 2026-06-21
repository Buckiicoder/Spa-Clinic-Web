import { useEffect, useMemo, useState } from "react";
import { Trash2, X, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  fetchProducts,
  selectProducts,
} from "../features/product/productSlice";

import {
  fetchTechnicians,
  selectTechnicians,
} from "../features/technician/technicianSlice";
import { formatPrice, getImageUrl } from "../features/product/productFunction";
import Toast from "../components/Toast";

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
  onSubmit: (data: any) => Promise<void>;
  onConfirm?: (data: any, transactionId?: number) => Promise<void>;
  currentUserId: number;
}

export default function ExportInventoryModal({
  open,
  onClose,
  onSubmit,
  onConfirm,
  currentUserId,
  initialData,
}: Props) {
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectProducts);
  const technicians = useAppSelector(selectTechnicians);

  const [searchProduct, setSearchProduct] = useState("");

  const [localStatus, setLocalStatus] = useState<
    "DRAFT" | "CONFIRMED" | "CANCELLED" | undefined
  >(initialData?.status);

  const [toast, setToast] = useState<any>(null);

  const [form, setForm] = useState({
    code: `XK${Date.now().toString().slice(-6)}`,
    type: "EXPORT",
    transaction_date: new Date().toISOString().split("T")[0],
    note: "",
    issued_by: Number(currentUserId), // AUTO
    received_by: null as number | null,
    total_extra_cost: 0,
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initialData;
  // const isConfirmed = initialData?.status === "CONFIRMED";
  // const isCancelled = initialData?.status === "CANCELLED";
  // const readonly = localStatus === "CONFIRMED" || localStatus === "CANCELLED";

  // ================= FETCH DATA =================
  useEffect(() => {
    if (open) {
      dispatch(fetchProducts());
      dispatch(fetchTechnicians());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (open) {
      setLocalStatus(initialData?.status);
    }
  }, [open, initialData]);

  // ================= RESET =================
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        code: initialData.code,
        type: "EXPORT",
        transaction_date: initialData.transaction_date?.split("T")[0],
        note: initialData.note || "",
        issued_by: Number(initialData.issued_by),
        received_by: initialData.received_by
          ? Number(initialData.received_by)
          : null,
        total_extra_cost: Number(initialData.total_extra_cost || 0),
      });

      setItems(
        initialData.items?.map((i: any) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          note: i.note || "",
        })) || [],
      );
    } else {
      setForm({
        code: `XK${Date.now().toString().slice(-6)}`,
        type: "EXPORT",
        transaction_date: new Date().toISOString().split("T")[0],
        note: "",
        issued_by: Number(currentUserId),
        received_by: null,
        total_extra_cost: 0,
      });

      setItems([]);
    }
  }, [open, initialData, currentUserId]);

  // ================= PRODUCT FILTER =================
  const filteredProducts = useMemo(() => {
    const k = searchProduct.toLowerCase();

    return products.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(k) || p.code?.toLowerCase().includes(k),
    );
  }, [products, searchProduct]);

  // ================= SELECT PRODUCT =================
  const handleSelectProduct = (product: any) => {
    const existed = items.find((x) => x.product_id === product.id);

    if (existed) {
      setItems((prev) =>
        prev.map((x) =>
          x.product_id === product.id ? { ...x, quantity: x.quantity + 1 } : x,
        ),
      );
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        quantity: 1,
        unit_price: product.current_price || 0,
        note: "",
      },
    ]);
  };

  // ================= TOTAL =================
  const totalAmount = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  }, [items]);

  // ================= VALIDATE =================
  const validate = () => {
    if (!form.received_by) {
      setError("Vui lòng chọn nhân viên nhận hàng");
      return false;
    }

    if (items.length === 0) {
      setError("Phải có ít nhất 1 sản phẩm");
      return false;
    }

    const invalid = items.find(
      (i) => !i.product_id || i.quantity <= 0 || i.unit_price < 0,
    );

    if (invalid) {
      setError("Dữ liệu sản phẩm không hợp lệ");
      return false;
    }

    setError("");
    return true;
  };

  // ================= SUBMIT =================
  const handleSubmitForm = async () => {
    setSaving(true);

    try {
      await onSubmit({
        ...form,
        status: "DRAFT",
        issued_by: Number(form.issued_by),
        received_by: form.received_by ? Number(form.received_by) : null,
        items: items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          note: i.note || "",
        })),
      });

      setLocalStatus("DRAFT");

      setToast({
        type: "success",
        message: "Đã lưu nháp phiếu xuất kho",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmForm = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      const payload = {
        ...form,
        status: "CONFIRMED",
        issued_by: Number(form.issued_by),
        received_by: form.received_by ? Number(form.received_by) : null,
        items: items.map((i) => ({
          product_id: Number(i.product_id),
          quantity: Number(i.quantity),
          unit_price: Number(i.unit_price),
          note: i.note || "",
        })),
      };

      await onConfirm?.(payload, initialData?.id);

      setLocalStatus("CONFIRMED");

      setToast({
        type: "success",
        message: "Xác nhận xuất kho thành công",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold">Phiếu xuất kho</h2>
            <p className="text-sm text-gray-500">Xuất hàng cho nhân viên</p>
          </div>

          {localStatus && (
            <span
              className={`rounded-full px-4 py-1 text-xs font-semibold ${
                localStatus === "CONFIRMED"
                  ? "bg-green-100 text-green-700"
                  : localStatus === "CANCELLED"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {localStatus === "DRAFT"
                ? "Nháp"
                : localStatus === "CONFIRMED"
                  ? "Đã xác nhận"
                  : "Đã hủy"}
            </span>
          )}

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STAFF SELECT */}
        <div className="mt-4">
          <label className="text-sm font-medium">Nhân viên cần xuất kho</label>

          <select
            className="mt-1 w-full rounded-xl border p-2"
            value={form.received_by || ""}
            onChange={(e) =>
              setForm({
                ...form,
                received_by: Number(e.target.value),
              })
            }
          >
            <option value="">-- Chọn nhân viên --</option>
            {technicians?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT SEARCH */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2 text-gray-400" />
            <input
              className="w-full rounded-xl border px-12 py-2"
              placeholder="Tìm sản phẩm..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />
          </div>

          <div className="grid max-h-[280px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 lg:grid-cols-3 mt-3 mb-3">
            {filteredProducts.map((p: any) => (
              <button
                key={p.id}
                disabled={localStatus === "CONFIRMED" || localStatus === "CANCELLED"}
                onClick={() => handleSelectProduct(p)}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left transition hover:border-amber-400 hover:bg-amber-50"
              >
                {p.image_url ? (
                  <img
                    src={getImageUrl(p.image_url)}
                    alt={p.name}
                    className="h-16 w-16 rounded-xl border object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl border bg-gray-100" />
                )}

                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.code}</div>

                  <div className="mt-1 text-sm font-semibold text-amber-700">
                    {formatPrice(p.current_price)}
                  </div>

                  <div className="text-xs text-gray-500">
                    Tồn kho: {p.stock_quantity}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-center">Số lượng</th>
                <th className="p-3 text-center">Đơn giá</th>
                <th className="p-3 text-center">Thành tiền</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              )}

              {items.map((item, idx) => {
                const product = products.find(
                  (p: any) => Number(p.id) === Number(item.product_id),
                );

                return (
                  <tr key={idx} className="border-t text-center">
                    {/* PRODUCT */}
                    <td className="p-3 text-left">
                      <div className="font-medium text-gray-900">
                        {product?.name || "Sản phẩm không xác định"}
                      </div>

                      <div className="text-xs text-gray-400">
                        {product?.code || ""}
                      </div>
                    </td>

                    {/* QUANTITY */}
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        disabled={localStatus === "CONFIRMED" || localStatus === "CANCELLED"}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].quantity = Number(e.target.value);
                          setItems(copy);
                        }}
                        className="w-20 rounded-lg border px-2 py-1 text-center"
                      />
                    </td>

                    {/* PRICE */}
                    <td className="p-3">{formatPrice(item.unit_price)}</td>

                    {/* TOTAL */}
                    <td className="p-3 font-medium text-amber-700">
                      {formatPrice(item.unit_price * item.quantity)}
                    </td>

                    {/* ACTION */}
                    <td className="p-3">
                      <div className="flex justify-center">
                        <button
                          disabled={localStatus === "CONFIRMED" || localStatus === "CANCELLED"}
                          onClick={() =>
                            setItems(items.filter((_, i) => i !== idx))
                          }
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
          <div className="text-lg font-bold">
            Tổng: {formatPrice(totalAmount)}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border px-5 py-2 text-gray-700"
            >
              Đóng
            </button>

            {localStatus !== "CONFIRMED" && localStatus !== "CANCELLED" && (
              <>
                <button
                  disabled={saving}
                  onClick={handleSubmitForm}
                  className="rounded-xl bg-gray-700 px-5 py-2 text-white"
                >
                  {saving ? "Đang lưu..." : isEdit ? "Lưu nháp" : "Tạo nháp"}
                </button>

                <button
                  disabled={saving}
                  onClick={handleConfirmForm}
                  className="rounded-xl bg-green-600 px-5 py-2 text-white"
                >
                  {saving
                    ? "Đang xử lý..."
                    : isEdit
                      ? "Lưu & Xác nhận"
                      : "Tạo & Xác nhận"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
