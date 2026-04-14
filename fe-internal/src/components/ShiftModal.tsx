import { useState, useRef, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const generateTimes = () => {
  const times = [];
  for (let h = 8; h <= 20; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 20) times.push(`${String(h).padStart(2, "0")}:30`);
  }
  return times;
};

const timeOptions = generateTimes();

export default function ShiftModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    start_time: "",
    end_time: "",
    is_active: true,
  });

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const startRef = useRef<any>(null);
  const endRef = useRef<any>(null);
  const isEdit = !!initialData;
  const formatTime = (time: string) => time?.slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (startRef.current && !startRef.current.contains(e.target)) {
        setOpenStart(false);
      }
      if (endRef.current && !endRef.current.contains(e.target)) {
        setOpenEnd(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        // 👉 EDIT MODE
        setForm({
          name: initialData.name || "",
          start_time: initialData.start_time || "",
          end_time: initialData.end_time || "",
          is_active: initialData.is_active ?? true,
        });
      } else {
        // 👉 CREATE MODE
        setForm({
          name: "",
          start_time: "",
          end_time: "",
          is_active: true,
        });
      }

      setErrors({});
    }
  }, [open, initialData]);

  if (!open) return null;

  const validate = () => {
    const newErrors: any = {};

    if (!form.name) newErrors.name = "Vui lòng nhập tên ca";
    if (!form.start_time) newErrors.start_time = "Chọn giờ bắt đầu";
    if (!form.end_time) newErrors.end_time = "Chọn giờ kết thúc";

    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      newErrors.end_time = "Giờ kết thúc phải lớn hơn giờ bắt đầu";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-[420px] p-6 z-50 animate-fadeIn">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Chỉnh sửa ca làm" : "Thêm ca làm"}
        </h3>

        {/* Tên ca */}
        <div className="mb-3">
          <label className="text-sm text-gray-900">Tên ca</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, name: value });

              setErrors((prev: any) => ({
                ...prev,
                name: value ? "" : "Vui lòng nhập tên ca",
              }));
            }}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Giờ bắt đầu */}
        <div ref={startRef} className="mb-3 relative">
          <label className="text-sm text-gray-900">Giờ bắt đầu</label>
          <input
            type="text"
            placeholder="VD: 08:00"
            readOnly
            value={formatTime(form.start_time)}
            onFocus={() => setOpenStart(true)}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, start_time: value });

              setErrors({
                ...errors,
                start_time: value ? "" : "Chọn giờ bắt đầu",
              });
            }}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />
          {errors.start_time && (
            <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>
          )}

          {openStart && (
            <div className="absolute z-50 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow">
              {timeOptions.map((t) => (
                <div
                  key={t}
                  onClick={() => {
                    setForm({ ...form, start_time: t });
                    setOpenStart(false);
                  }}
                  className="px-3 py-2 hover:bg-amber-100 cursor-pointer"
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Giờ kết thúc */}
        <div ref={endRef} className="mb-3 relative">
          <label className="text-sm text-gray-900">Giờ kết thúc</label>
          <input
            type="text"
            placeholder="VD: 17:30"
            readOnly
            value={formatTime(form.end_time)}
            onFocus={() => setOpenEnd(true)}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, end_time: value });

              setErrors({
                ...errors,
                end_time: value ? "" : "Chọn giờ kết thúc",
              });
            }}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />
          {errors.end_time && (
            <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>
          )}

          {openEnd && (
            <div className="absolute z-50 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow">
              {timeOptions.map((t) => (
                <div
                  key={t}
                  onClick={() => {
                    setForm({ ...form, end_time: t });
                    setOpenEnd(false);
                  }}
                  className="px-3 py-2 hover:bg-amber-100 cursor-pointer"
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trạng thái */}
        <div className="mb-4">
          <label className="text-sm text-gray-900 block mb-2">Trạng thái</label>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={form.is_active}
                onChange={() => setForm({ ...form, is_active: true })}
              />
              Hoạt động
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!form.is_active}
                onChange={() => setForm({ ...form, is_active: false })}
              />
              Không hoạt động
            </label>
          </div>
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
                  id: initialData.id, // 🔥 THÊM ID
                  data: form,
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
