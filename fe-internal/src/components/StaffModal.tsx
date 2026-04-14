import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAppDispatch } from "../app/hook";
import { useSelector } from "react-redux";
import {
  fetchPositions,
  selectPositions,
} from "../features/position/positionSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function StaffModal({
  open,
  onClose,
  initialData,
  onSubmit,
}: Props) {
  const [tab, setTab] = useState("info");
  const [errors, setErrors] = useState<any>({});
  const dispatch = useAppDispatch();
  const positions = useSelector(selectPositions);

  useEffect(() => {
    dispatch(fetchPositions());
  }, [dispatch]);

  useEffect(() => {
    setErrors({});
  }, [open]);

  const originForm = {
    id: "",
    avatar: "",
    name: "",
    dob: "",
    gender: "male",
    phone: "",
    email: "",

    position: "",
    employee_type: "FULLTIME",

    experience_years: "",

    city: "",
    ward: "",
    address_detail: "",

    password: "",
    confirm_password: "",

    note: "",

    // salary
    salary_type: "FIXED",
    salary_amount: "",
    salary_template: "",
  };
  const [form, setForm] = useState(originForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...originForm,

        ...initialData,

        // ✅ map lại đúng field
        position: initialData.position_id?.toString() || "",

        // ✅ format date cho input type="date"
        dob: initialData.dob
          ? new Date(initialData.dob).toISOString().split("T")[0]
          : "",

        // ✅ convert number/string
        experience_years: initialData.experience_years
          ? String(initialData.experience_years)
          : "",
      });
    } else {
      setForm({ ...originForm });
    }
  }, [initialData]);

  if (!open) return null;

  const validate = () => {
    const newErrors: any = {};

    if (!form.name) newErrors.name = "Vui lòng nhập tên nhân viên";

    if (!form.phone) newErrors.phone = "Vui lòng nhập số điện thoại";

    if (!form.position) newErrors.position = "Vui lòng chọn chức danh";

    if (!form.salary_type) newErrors.salary_type = "Vui lòng chọn loại lương";

    if (!form.employee_type)
      newErrors.employee_type = "Vui lòng chọn loại nhân viên";

    return newErrors;
  };

  const handleSubmit = () => {
    const validateErrors = validate();

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    const payload: any = {
      ...form,
      experience_years: Number(form.experience_years || 0),
      salary_amount: Number(form.salary_amount || 0),
      dob: form.dob || "",
      avatar: form.avatar || "",
      note: form.note || "",
      position_id: Number(form.position),
    };

    delete payload.position;

    // ❗ fix email
    if (!form.email) {
      delete payload.email;
    }

    if (!form.password) {
      delete payload.password;
      delete payload.confirm_password;
    }
    
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white w-[900px] rounded-2xl p-6 z-50">
        {/* header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? "Chi tiết nhân viên" : "Thêm nhân viên"}
          </h3>

          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* tabs */}
        <div className="flex gap-4 border-b mb-4">
          {[
            { key: "info", label: "Thông tin" },
            { key: "salary", label: "Thiết lập lương" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2 text-sm ${
                tab === t.key
                  ? "border-b-2 border-amber-500 text-amber-600 font-bold"
                  : "text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ================= INFO TAB ================= */}
        {tab === "info" && (
          <div className="grid grid-cols-12 gap-6">
            {/* ================= CỘT 1: AVATAR ================= */}
            <div className="col-span-2 flex flex-col items-center gap-4 border-r pr-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mt-2">
                <span className="text-gray-400 text-xs">Ảnh</span>
              </div>

              <button className="px-3 py-1 text-sm bg-gray-100 rounded">
                Chọn ảnh
              </button>
            </div>

            {/* ================= CỘT 2 (TRÁI) ================= */}
            <div className="col-span-5 flex flex-col gap-3">
              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-semibold">Mã NV</label>
                <input
                  className="col-span-2 border px-3 py-1 rounded"
                  disabled
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                />
              </div>

              {/* Tên nhân viên */}
              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Tên nhân viên</label>

                <div className="col-span-2">
                  <input
                    className="w-full border px-3 py-1 rounded"
                    value={form.name}
                    onChange={(e) => {
                      const value = e.target.value;

                      setForm({ ...form, name: value });

                      setErrors((prev: any) => ({
                        ...prev,
                        name: value ? "" : "Vui lòng nhập tên nhân viên",
                      }));
                    }}
                  />

                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Ngày sinh</label>
                <input
                  type="date"
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Giới tính</label>
                <div className="col-span-2 flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={form.gender === "male"}
                      onChange={() => setForm({ ...form, gender: "male" })}
                    />{" "}
                    Nam
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={form.gender === "female"}
                      onChange={() => setForm({ ...form, gender: "female" })}
                    />{" "}
                    Nữ
                  </label>
                </div>
              </div>

              {/* 👉 THÊM */}
              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Chức vụ</label>

                <div className="col-span-2">
                  <select
                    className="w-full border px-3 py-1 rounded"
                    value={form.position}
                    onChange={(e) => {
                      const value = e.target.value;

                      setForm({ ...form, position: value });

                      setErrors((prev: any) => ({
                        ...prev,
                        position: value ? "" : "Vui lòng chọn chức danh",
                      }));
                    }}
                  >
                    <option value="">Chọn</option>
                    {positions.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {errors.position && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.position}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Loại NV</label>
                <select
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.employee_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employee_type: e.target.value,
                    })
                  }
                >
                  <option value="Fulltime">Fulltime</option>
                  <option value="Parttime">Parttime</option>
                </select>
              </div>

              {/* 👉 KINH NGHIỆM */}
              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Kinh nghiệm (năm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.experience_years}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      experience_years: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* ================= CỘT 3 (PHẢI) ================= */}
            <div className="col-span-5 flex flex-col gap-3 pt-1">
              {/* 👉 MOVE sang phải */}
              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">SĐT</label>

                <div className="col-span-2">
                  <input
                    className="w-full border px-3 py-1 rounded"
                    value={form.phone}
                    onChange={(e) => {
                      const value = e.target.value;

                      setForm({ ...form, phone: value });

                      setErrors((prev: any) => ({
                        ...prev,
                        phone: value ? "" : "Vui lòng nhập số điện thoại",
                      }));
                    }}
                  />

                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* 👉 PASSWORD */}
              {!initialData && (
                <>
                  <div className="grid grid-cols-3 items-center pt-1">
                    <label className="text-sm font-medium">Mật khẩu</label>
                    <input
                      type="password"
                      className="col-span-2 border px-3 py-1 rounded"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center pt-1">
                    <label className="text-sm font-medium">Xác nhận MK</label>
                    <input
                      type="password"
                      className="col-span-2 border px-3 py-1 rounded"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirm_password: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Thành phố</label>
                <input
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Phường</label>
                <input
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 items-center pt-1">
                <label className="text-sm font-medium">Địa chỉ</label>
                <input
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.address_detail}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address_detail: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-3 items-start pt-1">
                <label className="text-sm mt-2 font-medium">Ghi chú</label>
                <textarea
                  className="col-span-2 border px-3 py-1 rounded"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= SALARY TAB ================= */}
        {tab === "salary" && (
          <div className="flex flex-col gap-4">
            <select
              value={form.salary_type}
              onChange={(e) =>
                setForm({ ...form, salary_type: e.target.value })
              }
              className="border px-3 py-2 rounded"
            >
              <option value="FIXED">Lương cố định (Fulltime)</option>
              <option value="HOURLY">Lương theo giờ (Parttime)</option>
            </select>

            <input
              type="number"
              placeholder="Nhập mức lương"
              value={form.salary_amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  salary_amount: e.target.value,
                })
              }
              className="border px-3 py-2 rounded"
            />

            <div className="text-sm text-gray-500">
              {form.salary_type === "FIXED"
                ? "Đơn vị: triệu / tháng"
                : "Đơn vị: nghìn / giờ"}
            </div>

            <div className="flex gap-2">
              <button className="bg-blue-500 text-white px-3 py-2 rounded">
                + Tạo biểu mẫu
              </button>

              <select
                value={form.salary_template}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salary_template: e.target.value,
                  })
                }
                className="border px-3 py-2 rounded"
              >
                <option value="">Chọn biểu mẫu lương</option>
                <option value="template1">Mẫu 1</option>
                <option value="template2">Mẫu 2</option>
              </select>
            </div>
          </div>
        )}

        {/* ACTION */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-500 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
