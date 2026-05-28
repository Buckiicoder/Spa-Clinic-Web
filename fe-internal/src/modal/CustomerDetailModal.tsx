import { useEffect, useMemo, useState } from "react";

import { X, Image as ImageIcon, Save } from "lucide-react";

import { useAppDispatch } from "../app/hook";

import { updateCustomer } from "../features/customer/customerSlice";
import { getImageUrl } from "../features/product/productFunction";
import { uploadProductImage } from "../features/product/productSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
  loading?: boolean;
}

export default function CustomerDetailModal({
  open,
  onClose,
  data,
  loading,
}: Props) {
  const dispatch = useAppDispatch();

  const customer = data?.customer;

  const profiles = data?.profiles || [];

  const [submitting, setSubmitting] = useState(false);

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

    referrer_id: "",

    is_active: true,
  };

  const [form, setForm] = useState(defaultForm);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",

        gender: customer.gender || "",

        dob: customer.dob ? customer.dob.split("T")[0] : "",

        city: customer.city || "",
        ward: customer.ward || "",
        address_detail: customer.address_detail || "",

        avatar: customer.avatar || "",

        source: customer.source || "",
        note: customer.note || "",
        status: customer.status || "active",

        referrer_id: customer.referrer_id?.toString() || "",

        is_active: customer.is_active ?? true,
      });
    }
  }, [customer]);

  if (!open || !customer) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 rounded-2xl bg-white px-8 py-6 shadow-xl">
          Đang tải thông tin khách hàng...
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      await dispatch(
        updateCustomer({
          id: customer.id,
          data: {
            ...form,
            referrer_id: form.referrer_id ? Number(form.referrer_id) : null,
          },
        }),
      ).unwrap();

      alert("Cập nhật khách hàng thành công");
    } catch (err: any) {
      console.log(err);

      alert(err?.message || "Cập nhật khách hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChooseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const imageUrl = await dispatch(uploadProductImage(file)).unwrap();

      setForm((prev: any) => ({
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 flex h-[92vh] w-[1400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold">Chi tiết khách hàng</h2>

            <p className="mt-1 text-sm text-gray-500">
              Quản lý thông tin khách hàng, dịch vụ và thanh toán
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-[#f7f7f7] p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="col-span-4 space-y-6">
              {/* CUSTOMER */}
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex flex-col items-center gap-4">
                    {/* avatar preview */}
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border bg-gray-50">
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
                        <ImageIcon size={34} className="text-gray-400" />
                      )}
                    </div>

                    {/* upload button */}
                    <label className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600">
                      {uploading ? "Đang tải ảnh..." : "Chọn ảnh"}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChooseImage}
                      />
                    </label>

                    {/* remove image */}
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

                  <div>
                    <h3 className="text-xl font-bold">{customer.name}</h3>

                    <p className="text-sm text-gray-500">{customer.phone}</p>

                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        {customer.rank || "member"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {customer.is_active
                          ? "Đang hoạt động"
                          : "Ngưng hoạt động"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FORM */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Họ tên
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
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Số điện thoại
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
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Email
                    </label>

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

                  <div className="grid grid-cols-2 gap-3">
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
                        <option value="">Chọn</option>

                        <option value="male">Nam</option>

                        <option value="female">Nữ</option>
                      </select>
                    </div>

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
                  </div>

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

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Địa chỉ
                    </label>

                    <textarea
                      rows={3}
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

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ghi chú
                    </label>

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

                  <div className="flex items-center gap-3">
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

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-600"
                  >
                    <Save size={18} />

                    {loading ? "Đang cập nhật..." : "Cập nhật khách hàng"}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-span-8 space-y-6">
              {/* STAT */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Tổng chi tiêu</p>

                  <h3 className="mt-2 text-2xl font-bold text-amber-600">
                    {Number(customer.total_spending || 0).toLocaleString()}đ
                  </h3>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Điểm tích lũy</p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {customer.loyalty_points || 0}
                  </h3>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Tổng lượt khám</p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {customer.total_visits || 0}
                  </h3>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">Liệu trình</p>

                  <h3 className="mt-2 text-2xl font-bold">{profiles.length}</h3>
                </div>
              </div>

              {/* PROFILES */}
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <h3 className="mb-5 text-xl font-bold">Hồ sơ dịch vụ</h3>

                <div className="space-y-4">
                  {profiles.map((profile: any) => (
                    <div key={profile.id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">
                            {profile.service_name}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            {profile.package_name}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {profile.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Buổi sử dụng</p>

                          <p className="font-semibold">
                            {profile.used_sessions}/{profile.total_sessions}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Bác sĩ</p>

                          <p className="font-semibold">
                            {profile.doctor_name || "--"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">KTV</p>

                          <p className="font-semibold">
                            {profile.technician_name || "--"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Khu vực</p>

                          <p className="font-semibold">
                            {profile.service_area || "--"}
                          </p>
                        </div>
                      </div>

                      {/* PAYMENTS */}
                      {profile.payments?.length > 0 && (
                        <div className="mt-5 border-t pt-4">
                          <h5 className="mb-3 font-semibold">Thanh toán</h5>

                          <div className="space-y-3">
                            {profile.payments.map((payment: any) => (
                              <div
                                key={payment.payment_id}
                                className="rounded-xl border bg-gray-50 p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold">
                                      {payment.payment_code}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      {payment.status}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <p className="font-bold text-amber-600">
                                      {Number(
                                        payment.final_amount || 0,
                                      ).toLocaleString()}
                                      đ
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      Đã thanh toán:{" "}
                                      {Number(
                                        payment.paid_amount || 0,
                                      ).toLocaleString()}
                                      đ
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {profiles.length === 0 && (
                    <div className="rounded-2xl border border-dashed py-12 text-center text-gray-400">
                      Khách hàng chưa có liệu trình
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
