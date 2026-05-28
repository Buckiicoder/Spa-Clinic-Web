import { useEffect, useMemo, useState } from "react";

import { X, Calendar, Percent, BadgeDollarSign } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchServices,
  selectServices,
} from "../features/service/serviceSlice";

import {
  formatMoneyInput,
  parseMoneyInput,
} from "../features/product/productFunction";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

const customerRanks = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "DIAMOND",
  "VIP",
  "SUPER_VIP",
];

export default function DiscountModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: Props) {
  const dispatch = useAppDispatch();

  const services = useAppSelector(selectServices);

  const defaultForm = {
    code: "",

    name: "",

    description: "",

    discount_type: "PERCENT",

    discount_value: "",

    max_discount_amount: "",

    min_order_amount: "",

    usage_limit: "",

    usage_limit_per_customer: "1",

    minimum_customer_rank: "",

    first_visit_only: false,

    start_date: "",

    end_date: "",

    is_active: true,

    service_ids: [] as number[],

    service_package_ids: [] as number[],
  };

  const [form, setForm] = useState(defaultForm);

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    setErrors({});
  }, [open]);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code || "",
        name: initialData.name || "",
        description: initialData.description || "",
        discount_type: initialData.discount_type || "PERCENT",
        discount_value: initialData.discount_value?.toString() || "",
        max_discount_amount: initialData.max_discount_amount?.toString() || "",
        min_order_amount: initialData.min_order_amount?.toString() || "",
        usage_limit: initialData.usage_limit?.toString() || "",
        usage_limit_per_customer:
          initialData.usage_limit_per_customer?.toString() || "1",
        minimum_customer_rank: initialData.minimum_customer_rank || "",
        first_visit_only: initialData.first_visit_only || false,
        start_date: initialData.start_date
          ? initialData.start_date.slice(0, 16)
          : "",
        end_date: initialData.end_date ? initialData.end_date.slice(0, 16) : "",
        is_active: initialData.is_active ?? true,
        service_ids: initialData.services?.map((item: any) => item.id) || [],

        service_package_ids:
          initialData.service_packages?.map((item: any) => item.id) || [],
      });
    } else {
      setForm({
        ...defaultForm,
      });
    }
  }, [initialData, open]);

  const servicePackages = useMemo(() => {
    return services.flatMap((service: any) =>
      (service.packages || []).map((pkg: any) => ({
        ...pkg,
        service_name: service.name,
      })),
    );
  }, [services]);

  if (!open) return null;

  const validate = () => {
    const newErrors: any = {};

    if (!form.code.trim()) {
      newErrors.code = "Vui lòng nhập mã giảm giá";
    }

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập tên mã giảm giá";
    }

    if (!form.discount_value) {
      newErrors.discount_value = "Vui lòng nhập giá trị giảm";
    }

    if (!form.start_date) {
      newErrors.start_date = "Vui lòng chọn ngày bắt đầu";
    }

    if (!form.end_date) {
      newErrors.end_date = "Vui lòng chọn ngày kết thúc";
    }

    if (
      form.start_date &&
      form.end_date &&
      new Date(form.end_date) <= new Date(form.start_date)
    ) {
      newErrors.end_date = "Ngày kết thúc phải lớn hơn ngày bắt đầu";
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validateErrors = validate();

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);

      return;
    }

    onSubmit({
      ...form,

      discount_value: Number(form.discount_value),

      max_discount_amount: form.max_discount_amount
        ? Number(form.max_discount_amount)
        : null,

      min_order_amount: form.min_order_amount
        ? Number(form.min_order_amount)
        : 0,

      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,

      usage_limit_per_customer: Number(form.usage_limit_per_customer || 1),

      minimum_customer_rank: form.minimum_customer_rank || null,

      description: form.description || null,
    });
  };

  const toggleService = (id: number) => {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(id)
        ? prev.service_ids.filter((x) => x !== id)
        : [...prev.service_ids, id],
    }));
  };

  const togglePackage = (id: number) => {
    setForm((prev) => ({
      ...prev,
      service_package_ids: prev.service_package_ids.includes(id)
        ? prev.service_package_ids.filter((x) => x !== id)
        : [...prev.service_package_ids, id],
    }));
  };

  const handleClose = () => {
    setForm(defaultForm);

    setErrors({});

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="relative z-10 max-h-[95vh] w-[1100px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold">
              {initialData ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quản lý voucher và áp dụng cho dịch vụ / gói liệu trình
            </p>
          </div>

          <button
            onClick={handleClose}
            className="rounded-xl p-2 transition hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="col-span-7 space-y-5">
            {/* basic */}
            <div className="rounded-2xl border p-5">
              <h3 className="mb-4 text-lg font-semibold">Thông tin cơ bản</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Mã giảm giá *
                  </label>

                  <input
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="VD: SUMMER2026"
                    className="w-full rounded-xl border px-4 py-3"
                  />

                  {errors.code && (
                    <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Tên mã giảm giá *
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Tên chương trình"
                    className="w-full rounded-xl border px-4 py-3"
                  />

                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Mô tả
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>
            </div>

            {/* discount */}
            <div className="rounded-2xl border p-5">
              <h3 className="mb-4 text-lg font-semibold">Giá trị giảm giá</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Loại giảm giá
                  </label>

                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_type: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>

                    <option value="FIXED">Tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Giá trị giảm *
                  </label>

                  <div className="relative">
                    <input
                      value={formatMoneyInput(form.discount_value)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          discount_value: parseMoneyInput(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border px-4 py-3 pr-12"
                    />

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {form.discount_type === "PERCENT" ? (
                        <Percent size={18} />
                      ) : (
                        <BadgeDollarSign size={18} />
                      )}
                    </div>
                  </div>

                  {errors.discount_value && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.discount_value}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Giảm tối đa
                  </label>

                  <input
                    value={formatMoneyInput(form.max_discount_amount)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        max_discount_amount: parseMoneyInput(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                    placeholder="Không giới hạn"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Đơn tối thiểu
                  </label>

                  <input
                    value={formatMoneyInput(form.min_order_amount)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        min_order_amount: parseMoneyInput(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>
            </div>

            {/* conditions */}
            <div className="rounded-2xl border p-5">
              <h3 className="mb-4 text-lg font-semibold">Điều kiện áp dụng</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Giới hạn lượt dùng
                  </label>

                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        usage_limit: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Giới hạn / khách
                  </label>

                  <input
                    type="number"
                    value={form.usage_limit_per_customer}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        usage_limit_per_customer: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Hạng khách tối thiểu
                  </label>

                  <select
                    value={form.minimum_customer_rank}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minimum_customer_rank: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  >
                    <option value="">Tất cả khách hàng</option>

                    {customerRanks.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-9">
                  <input
                    type="checkbox"
                    checked={form.first_visit_only}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        first_visit_only: e.target.checked,
                      })
                    }
                  />

                  <span className="text-sm">Chỉ áp dụng khách lần đầu</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-5 space-y-5">
            {/* time */}
            <div className="rounded-2xl border p-5">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Calendar size={18} />
                Thời gian áp dụng
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Bắt đầu *
                  </label>

                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />

                  {errors.start_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.start_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Kết thúc *
                  </label>

                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border px-4 py-3"
                  />

                  {errors.end_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.end_date}
                    </p>
                  )}
                </div>

                <label className="flex items-center gap-3">
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

                  <span className="text-sm font-medium">Đang hoạt động</span>
                </label>
              </div>
            </div>

            {/* services */}
            <div className="rounded-2xl border p-5">
              <h3 className="mb-4 text-lg font-semibold">
                Áp dụng cho dịch vụ
              </h3>

              <div className="max-h-56 space-y-2 overflow-y-auto">
                {services.map((service: any) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={form.service_ids.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                    />

                    <div>
                      <div className="font-medium">{service.name}</div>

                      <div className="text-xs text-gray-400">
                        {service.area}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* packages */}
            <div className="rounded-2xl border p-5">
              <h3 className="mb-4 text-lg font-semibold">
                Áp dụng cho gói dịch vụ
              </h3>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {servicePackages.map((pkg: any) => (
                  <label
                    key={pkg.id}
                    className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={form.service_package_ids.includes(pkg.id)}
                      onChange={() => togglePackage(pkg.id)}
                    />

                    <div>
                      <div className="font-medium">{pkg.name}</div>

                      <div className="text-xs text-gray-400">
                        {pkg.service_name}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-5">
          <button
            onClick={handleClose}
            className="rounded-xl border px-5 py-3 transition hover:bg-gray-100"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            {initialData ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
