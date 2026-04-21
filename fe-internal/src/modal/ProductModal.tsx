import { useEffect, useState } from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  getImageUrl,
  formatMoneyInput,
  parseMoneyInput,
} from "../features/product/productFunction";
import {
  fetchProductCategories,
  createProductCategory,
  selectProductCategories,
} from "../features/productCategory/productCategorySlice";
import { uploadProductImage } from "../features/product/productSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function ProductModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<any>({});
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [uploading, setUploading] = useState(false);
  const defaultForm = {
    code: "",
    barcode: "",
    name: "",
    description: "",
    category_id: "",
    unit: "cái",
    sale_price: "",
    current_price: "",
    stock_quantity: "0",
    image_url: "",
    is_active: true,
  };

  const [form, setForm] = useState(defaultForm);

  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectProductCategories);

  useEffect(() => {
    dispatch(fetchProductCategories());
  }, [dispatch]);

  useEffect(() => {
    setErrors({});
  }, [open]);

  useEffect(() => {
    if (open) {
      setOpenCategoryModal(false);
      setCategoryError("");
      setNewCategoryName("");
      setNewCategoryDescription("");
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code || "",
        barcode: initialData.barcode || "",
        name: initialData.name || "",
        description: initialData.description || "",
        category_id: initialData.category_id?.toString() || "",
        unit: initialData.unit || "cái",
        sale_price: initialData.sale_price?.toString() || "",
        current_price: initialData.current_price?.toString() || "",
        stock_quantity: initialData.stock_quantity?.toString() || "0",
        image_url: initialData.image_url || "",
        is_active: initialData.is_active ?? true,
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const validate = () => {
    const newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    }

    if (!form.category_id) {
      newErrors.category_id = "Vui lòng chọn phân loại";
    }

    if (!form.sale_price) {
      newErrors.sale_price = "Vui lòng nhập giá niêm yết";
    }

    if (!form.current_price) {
      newErrors.current_price = "Vui lòng nhập giá hiện tại";
    }

    if (Number(form.current_price || 0) > Number(form.sale_price || 0)) {
      newErrors.current_price = "Giá hiện tại không được lớn hơn giá niêm yết";
    }

    return newErrors;
  };

  const handleChooseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const imageUrl = await dispatch(uploadProductImage(file)).unwrap();

      setForm((prev) => ({
        ...prev,
        image_url: imageUrl,
      }));
    } catch (err) {
      console.log(err);
      alert("Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const validateErrors = validate();

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    onSubmit({
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
      sale_price: Number(form.sale_price),
      current_price: Number(form.current_price),
      stock_quantity: Number(form.stock_quantity),
    });
  };

  const handleCreateCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        setCategoryError("Vui lòng nhập tên phân loại");
        return;
      }

      const result = await dispatch(
        createProductCategory({
          name: newCategoryName,
          description: newCategoryDescription,
        }),
      ).unwrap();

      setForm((prev) => ({
        ...prev,
        category_id: result.id.toString(),
      }));

      setNewCategoryName("");
      setNewCategoryDescription("");
      setCategoryError("");
      setOpenCategoryModal(false);
    } catch (err: any) {
      setCategoryError(err?.message || "Không thể tạo phân loại");
    }
  };

  const handleClose = () => {
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-[850px] rounded-2xl bg-white p-6 shadow-xl">
        {/* header */}
        <div className="mb-5 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">
            {initialData ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* ảnh */}
          <div className="col-span-3 flex flex-col items-center gap-4 border-r pr-4">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border bg-gray-50">
              {form.image_url ? (
                <img
                  src={getImageUrl(form.image_url)}
                  alt="preview"
                  onError={(e) => {
                    console.log("Ảnh lỗi:", getImageUrl(form.image_url));
                    e.currentTarget.style.display = "none";
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="text-gray-400" size={42} />
              )}
            </div>

            <label className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
              {uploading ? "Đang tải ảnh..." : "Chọn ảnh"}

              <input
                type="file"
                accept="image/*"
                onChange={handleChooseImage}
                className="hidden"
              />
            </label>

            {form.image_url && (
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    image_url: "",
                  })
                }
                className="text-xs text-red-500 hover:underline"
              >
                Xóa ảnh
              </button>
            )}
          </div>

          {/* form */}
          <div className="col-span-9 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Mã sản phẩm *
              </label>

              <input
                value={form.code}
                disabled
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Mã vạch</label>

              <input
                value={form.barcode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    barcode: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Tên sản phẩm *
              </label>

              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border px-3 py-2"
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium">Phân loại *</label>

                <button
                  type="button"
                  onClick={() => setOpenCategoryModal(true)}
                  className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
                >
                  <Plus size={14} />
                  Thêm phân loại
                </button>
              </div>

              <select
                value={form.category_id}
                onChange={(e) => {
                  setForm({
                    ...form,
                    category_id: e.target.value,
                  });

                  setErrors((prev: any) => ({
                    ...prev,
                    category_id: e.target.value
                      ? ""
                      : "Vui lòng chọn phân loại",
                  }));
                }}
                className="w-full rounded-xl border px-3 py-2"
              >
                <option value="">Chọn phân loại</option>

                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.category_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.category_id}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Giá niêm yết *
              </label>

              <input
                type="text"
                value={formatMoneyInput(form.sale_price)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sale_price: parseMoneyInput(e.target.value),
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
                placeholder="0"
              />

              {errors.sale_price && (
                <p className="mt-1 text-xs text-red-500">{errors.sale_price}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Giá bán hiện tại *
              </label>

              <input
                type="text"
                value={formatMoneyInput(form.current_price)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    current_price: parseMoneyInput(e.target.value),
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
                placeholder="0"
              />

              {errors.current_price && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.current_price}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tồn kho</label>

              <input
                type="number"
                value={form.stock_quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock_quantity: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Đơn vị</label>

              <input
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Mô tả</label>

              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active: e.target.checked,
                  })
                }
              />

              <span className="text-sm text-gray-700">Đang kinh doanh</span>
            </div>
          </div>
        </div>

        {/* action */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button
            onClick={handleClose}
            className="rounded-xl border px-5 py-2 text-gray-700 transition hover:bg-gray-100"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-amber-500 px-5 py-2 font-medium text-white transition hover:bg-amber-600"
          >
            {initialData ? "Cập nhật" : "Thêm sản phẩm"}
          </button>
        </div>
      </div>

      {openCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={(e) => {
              e.stopPropagation();
              setOpenCategoryModal(false);
            }}
          />

          <div className="relative z-10 w-[420px] rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Thêm phân loại sản phẩm</h3>

              <button
                onClick={() => {
                  setOpenCategoryModal(false);
                  setCategoryError("");
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                }}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tên phân loại *
                </label>

                <input
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setCategoryError("");
                  }}
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="Ví dụ: Serum, Thuốc, Máy móc..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Mô tả</label>

                <textarea
                  rows={3}
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                  placeholder="Mô tả phân loại..."
                />
              </div>

              {categoryError && (
                <p className="text-sm text-red-500">{categoryError}</p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setOpenCategoryModal(false)}
                className="rounded-xl border px-4 py-2 hover:bg-gray-100"
              >
                Hủy
              </button>

              <button
                onClick={handleCreateCategory}
                className="rounded-xl bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
              >
                Thêm phân loại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
