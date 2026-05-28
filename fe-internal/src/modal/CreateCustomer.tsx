import { useEffect, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

import { useAppDispatch } from "../app/hook";
import { uploadProductImage } from "../features/product/productSlice";
import { getImageUrl } from "../features/product/productFunction";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CustomerCreateModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const dispatch = useAppDispatch();

  const [errors, setErrors] = useState<any>({});

  const [uploading, setUploading] = useState(false);

  const defaultForm = {
    name: "",
    phone: "",
    email: "",

    gender: "",

    dob: "",

    city: "",
    ward: "",
    address_detail: "",

    avatar: "",

    source: "",
    note: "",

    status: "active",
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (open) {
      setForm(defaultForm);
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  // ================= VALIDATE =================

  const validate = () => {
    const newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập tên khách hàng";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    }

    return newErrors;
  };

  // ================= UPLOAD IMAGE =================

  const handleChooseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const imageUrl = await dispatch(uploadProductImage(file)).unwrap();

      setForm((prev) => ({
        ...prev,
        avatar: imageUrl,
      }));
    } catch (err) {
      console.log(err);

      alert("Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  // ================= SUBMIT =================

  const handleSubmit = () => {
    const validateErrors = validate();

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    onSubmit({
      ...form,
    });
  };

  // ================= CLOSE =================

  const handleClose = () => {
    setForm(defaultForm);
    setErrors({});

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="relative z-10 w-[900px] rounded-2xl bg-white p-6 shadow-xl">
        {/* header */}
        <div className="mb-5 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">Thêm khách hàng</h2>

          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* body */}
        <div className="grid grid-cols-12 gap-6">
          {/* avatar */}
          <div className="col-span-3 flex flex-col items-center gap-4 border-r pr-4">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border bg-gray-50">
              {form.avatar ? (
                <img
                  src={getImageUrl(form.avatar)}
                  alt="avatar"
                  onError={(e) => {
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
                className="hidden"
                onChange={handleChooseImage}
              />
            </label>

            {form.avatar && (
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    avatar: "",
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
            {/* name */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Tên khách hàng *
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* phone */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Số điện thoại *
              </label>

              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />

              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* email */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>

              <input
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            {/* gender */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Giới tính
              </label>

              <select
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              >
                <option value="">Chọn giới tính</option>

                <option value="male">Nam</option>

                <option value="female">Nữ</option>

                <option value="other">Khác</option>
              </select>
            </div>

            {/* dob */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Ngày sinh
              </label>

              <input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dob: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            {/* status */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Trạng thái
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              >
                <option value="active">Active</option>

                <option value="inactive">Inactive</option>

                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* city */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Thành phố
              </label>

              <input
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            {/* ward */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Phường/Xã
              </label>

              <input
                value={form.ward}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ward: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            {/* address */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Địa chỉ chi tiết
              </label>

              <input
                value={form.address_detail}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address_detail: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            {/* source */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nguồn khách
              </label>

              <input
                value={form.source}
                onChange={(e) =>
                  setForm({
                    ...form,
                    source: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            {/* note */}
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Ghi chú</label>

              <textarea
                rows={4}
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value,
                  })
                }
                className="w-full rounded-xl border px-3 py-2"
              />
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
            Thêm khách hàng
          </button>
        </div>
      </div>
    </div>
  );
}
