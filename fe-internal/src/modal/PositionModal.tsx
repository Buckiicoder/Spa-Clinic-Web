import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function PositionModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<any>({});
  const isEdit = !!initialData;

  // =====================================================
  // 🔹 INIT DATA
  // =====================================================
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          name: initialData.name || "",
          description: initialData.description || "",
        });
      } else {
        setForm({
          name: "",
          description: "",
        });
      }

      setErrors({});
    }
  }, [open, initialData]);

  if (!open) return null;

  // =====================================================
  // 🔹 VALIDATE
  // =====================================================
  const validate = () => {
    const newErrors: any = {};

    if (!form.name) {
      newErrors.name = "Vui lòng nhập tên chức danh";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // 🔹 UI
  // =====================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[420px] p-6 z-50 animate-fadeIn">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Chỉnh sửa chức danh" : "Thêm chức danh"}
        </h3>

        {/* Tên */}
        <div className="mb-3">
          <label className="text-sm text-gray-900">Tên chức danh</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              const value = e.target.value;

              setForm({ ...form, name: value });

              setErrors((prev: any) => ({
                ...prev,
                name: value ? "" : "Vui lòng nhập tên chức danh",
              }));
            }}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />

          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-4">
          <label className="text-sm text-gray-900">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full mt-1 border rounded-lg px-3 py-2"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Đóng
          </button>

          <button
            onClick={() => {
              const isValid = validate();
              if (!isValid) return;

              if (isEdit) {
                onSubmit({
                  id: initialData.id,
                  ...form, // 🔥 SPREAD
                });
              } else {
                onSubmit(form);
              }
            }}
            className="px-4 py-2 rounded-lg text-white bg-amber-500 hover:bg-amber-600"
          >
            {isEdit ? "Cập nhật" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
