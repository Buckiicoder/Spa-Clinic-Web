import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { useAppSelector } from "../app/hook";
import { selectServices } from "../features/service/serviceSlice";
import ServiceCategorySelect from "../components/ServiceCategorySelect";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

type ServicePackage = {
  id?: number;
  name: string;
  price: string;
  total_sessions: string;

  unit?: string;
  duration_per_unit?: string | number | null;
  is_active?: boolean;
};

export default function ServiceModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: Props) {
  const services = useAppSelector(selectServices);

  const [errors, setErrors] = useState<any>({});

  const defaultForm = {
    name: "",
    area: "",
    parent_id: null,
    description: "",
    duration: "",
    is_active: true,
    packages: [],
  };

  const [form, setForm] = useState<any>(defaultForm);

  const checkIsLeaf = (form: any) => {
    return (
      !!form.parent_id &&
      typeof form.area === "string" &&
      form.area.trim().length > 0
    );
  };

  const isLeaf = checkIsLeaf(form);

  // ================= INIT =================
  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        duration: initialData.duration || "",
        packages:
          initialData.packages?.length > 0
            ? initialData.packages.map((p: any) => ({
                id: p.id,
                name: p.name || "",
                price: p.price?.toString() || "",
                total_sessions: p.total_sessions?.toString() || "",
                unit: p.unit || "buổi",
                duration_per_unit: p.duration_per_unit?.toString() || "",
                is_active: p.is_active ?? true,
              }))
            : [],
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData, open]);

  useEffect(() => {
    setErrors({});
  }, [open]);

  if (!open) return null;

  // ================= VALIDATE =================

  const validate = () => {
    const newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập tên dịch vụ";
    }

    const isLeaf = checkIsLeaf(form);

    if (isLeaf) {
      if (form.packages.length === 0) {
        newErrors.packages = "Phải có ít nhất 1 gói";
      }

      form.packages.forEach((p: any, index: number) => {
        if (!p.name) {
          newErrors[`package_name_${index}`] = "Nhập tên gói";
        }

        if (!p.price) {
          newErrors[`package_price_${index}`] = "Nhập giá";
        }

        if (!p.total_sessions) {
          newErrors[`package_sessions_${index}`] = "Nhập số buổi";
        }
      });
    }

    return newErrors;
  };

  // ================= PACKAGE =================
  const addPackage = () => {
    const newForm = structuredClone(form);

    newForm.packages.push({
      name: "",
      price: "",
      total_sessions: "",
      unit: "buổi",
      duration_per_unit: "",
      is_active: true,
    });

    setForm(newForm);
  };

  const updatePackage = (index: number, field: string, value: any) => {
    const newForm = structuredClone(form);
    newForm.packages[index][field] = value;
    setForm(newForm);
  };

  const removePackage = (index: number) => {
    const newForm = structuredClone(form);
    newForm.packages.splice(index, 1);
    setForm(newForm);
  };

  // ================= SUBMIT =================
  const handleSubmit = () => {
    const isLeaf = checkIsLeaf(form); // 🔥 tính lại tại thời điểm submit

    const validateErrors = validate();

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    onSubmit({
      ...form,
      duration: form.duration ? Number(form.duration) : null,
      parent_id: form.parent_id || null,
      area: isLeaf ? form.area.trim() : null,
      packages: isLeaf
        ? form.packages.map((p: ServicePackage) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            total_sessions: Number(p.total_sessions),
            unit: p.unit || "buổi",
            duration_per_unit:
              p.duration_per_unit !== "" && p.duration_per_unit !== null
                ? Number(p.duration_per_unit)
                : null,
            is_active: p.is_active ?? true,
          }))
        : [],
    });
  };

  const handleClose = () => {
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-[920px] rounded-2xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {initialData ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* ==== THÔNG TIN CƠ BẢN ==== */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* NAME */}
              <div>
                <label className="text-sm font-medium">Tên dịch vụ *</label>

                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-amber-400"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* <div className="text-xs text-gray-500 mt-1">
                {isRoot && "Dịch vụ tổng"}
                {isGroup && "Nhóm dịch vụ"}
                {isLeaf && "Dịch vụ chi tiết (có thể bán)"}
              </div> */}

              {/* AREA */}
              {form.parent_id && (
                <div>
                  <label className="text-sm font-medium">
                    Vùng / Công nghệ *
                  </label>
                  <input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="VD: mắt, nách, trứng cá..."
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                  />

                  {errors.area && (
                    <p className="text-xs text-red-500 mt-1">{errors.area}</p>
                  )}
                </div>
              )}

              {/* PARENT */}
              <div>
                <label className="text-sm font-medium mb-1">
                  Phân loại dịch vụ
                </label>

                <ServiceCategorySelect
                  services={services}
                  value={form.parent_id}
                  onChange={(id) =>
                    setForm((prev: any) => ({
                      ...prev,
                      parent_id: id,
                    }))
                  }
                />
              </div>

              {/* DURATION */}
              <div>
                <label className="text-sm font-medium mb-1">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  className="mt-0 w-full rounded-xl border px-3 py-2"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-3">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>
          </div>

          {/* ==== PACKAGES ==== */}
          {isLeaf && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  Gói dịch vụ
                </h3>

                <button
                  type="button"
                  onClick={addPackage}
                  className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
                >
                  <Plus size={14} /> Thêm gói
                </button>
              </div>

              {errors.packages && (
                <p className="text-xs text-red-500 mb-2">{errors.packages}</p>
              )}

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {form.packages.map((p: ServicePackage, pkgIndex: number) => (
                  <div
                    key={pkgIndex}
                    className="border rounded-xl p-3 bg-gray-50 space-y-3"
                  >
                    <div className="grid grid-cols-6 gap-3">
                      <input
                        placeholder="Tên gói (VD: Cơ bản)"
                        value={p.name}
                        onChange={(e) =>
                          updatePackage(pkgIndex, "name", e.target.value)
                        }
                        className="rounded border px-3 py-2 col-span-2"
                      />

                      <input
                        placeholder="Giá (VNĐ)"
                        value={p.price}
                        onChange={(e) =>
                          updatePackage(pkgIndex, "price", e.target.value)
                        }
                        className="rounded border px-3 py-2"
                      />

                      <input
                        placeholder="Số buổi"
                        value={p.total_sessions}
                        onChange={(e) =>
                          updatePackage(
                            pkgIndex,
                            "total_sessions",
                            e.target.value,
                          )
                        }
                        className="rounded border px-3 py-2"
                      />

                      <input
                        placeholder="Thời gian/buổi (phút)"
                        value={p.duration_per_unit || ""}
                        onChange={(e) =>
                          updatePackage(
                            pkgIndex,
                            "duration_per_unit",
                            e.target.value,
                          )
                        }
                        className="rounded border px-3 py-2"
                      />

                      <button
                        type="button"
                        onClick={() => removePackage(pkgIndex)}
                        className="text-sm text-red-500"
                      >
                        Xóa gói
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE */}
          <div className="flex items-center gap-2">
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
            <span className="text-sm">Đang hoạt động</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-xl border px-5 py-2 hover:bg-gray-100"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-amber-500 px-5 py-2 text-white hover:bg-amber-600"
          >
            {initialData ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  );
}
