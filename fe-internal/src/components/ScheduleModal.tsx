import { useState, useEffect } from "react";
import { useAppDispatch } from "../app/hook";
import { useSelector } from "react-redux";
import { fetchShifts, selectShifts } from "../features/shift/shiftSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function ScheduleModal({ open, onClose, onSubmit }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [errors, setErrors] = useState("");
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const dispatch = useAppDispatch();
  const shiftList = useSelector(selectShifts);
  const formatTime = (time: string) => time?.slice(0, 5);

  const [registerOpen, setRegisterOpen] = useState("");
  const [registerClose, setRegisterClose] = useState("");

  type ShiftConfig = {
    shift_id: number; // 🔥 quan trọng
    employeeType: "FULLTIME" | "PARTTIME" | "ALL";
    applyType: "ALL_DAYS" | "WEEKEND" | "CUSTOM";
    customDates?: string[];
    max_employee?: number;
  };

  const [shifts, setShifts] = useState<ShiftConfig[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedMonth(null);
      setSelectedDays([]);
      setShifts([]);
      setRegisterOpen("");
      setRegisterClose("");
      setErrors("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      dispatch(fetchShifts());
    }
  }, [dispatch, open]);

  if (!open) return null;

  // 🔹 generate days in month
  const getDaysInMonth = () => {
    if (!selectedMonth) return [];
    const total = new Date(year, selectedMonth, 0).getDate();

    return Array.from({ length: total }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(selectedMonth).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`;
      return dateStr;
    });
  };

  const toggleDay = (date: string) => {
    if (selectedDays.includes(date)) {
      setSelectedDays(selectedDays.filter((d) => d !== date));
    } else {
      setSelectedDays([...selectedDays, date]);
    }
  };

  const handleSubmit = () => {
    if (!selectedMonth) {
      setErrors("Vui lòng chọn tháng");
      return;
    }

    if (!registerOpen || !registerClose) {
      setErrors("Vui lòng chọn thời gian mở/đóng");
      return;
    }

    if (shifts.length === 0) {
      setErrors("Vui lòng thêm ít nhất 1 ca");
      return;
    }

    for (const s of shifts) {
      if (!s.shift_id) {
        setErrors("Chưa chọn ca làm");
        return;
      }

      if (
        s.applyType === "CUSTOM" &&
        (!s.customDates || s.customDates.length === 0)
      ) {
        setErrors("Ca tùy chọn phải chọn ít nhất 1 ngày");
        return;
      }
    }

    onSubmit({
      month: selectedMonth,
      year,
      selectedDays, 
      open_from: registerOpen,
      open_to: registerClose,
      shifts,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl w-[800px] p-6 z-50">
        <h2 className="text-lg font-semibold mb-4">Mở đăng ký lịch làm</h2>

        {/* YEAR */}
        <div className="mb-4">
          <label>Năm</label>
          <input
            type="number"
            value={year}
            min={currentYear}
            onChange={(e) => {
              const newYear = Number(e.target.value);
              if (newYear < currentYear) return;
              setYear(newYear);
              setSelectedMonth(null); // reset lại tháng
              setSelectedDays([]); // reset ngày
            }}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        {/* MONTH */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {months.map((m) => {
            const isPast = year === currentYear && m < currentMonth; // ✅ đặt ở đây

            return (
              <div
                key={m}
                onClick={() => {
                  if (isPast) return;

                  setSelectedMonth(m);

                  const total = new Date(year, m, 0).getDate();
                  Array.from({ length: total }, (_, i) => {
                    const day = i + 1;
                    return `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  });

                  setSelectedDays([]);
                }}
                className={`p-2 text-center rounded border
        ${
          isPast
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : selectedMonth === m
              ? "bg-amber-500 text-white cursor-pointer"
              : "hover:bg-amber-100 cursor-pointer"
        }`}
              >
                Tháng {m}
              </div>
            );
          })}
        </div>

        {/* DAYS */}
        {selectedMonth && (
          <div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Chọn ngày làm</h3>

                <button
                  onClick={() => setSelectedDays(getDaysInMonth())}
                  className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded"
                >
                  Làm toàn bộ
                </button>
              </div>

              <div className="grid grid-cols-11 gap-1 max-h-[200px] overflow-y-auto">
                {getDaysInMonth().map((date) => {
                  const day = date.split("-")[2];

                  return (
                    <div
                      key={date}
                      onClick={() => toggleDay(date)}
                      className={`p-2 text-center rounded cursor-pointer border text-sm
                      ${
                        selectedDays.includes(date)
                          ? "bg-amber-400 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="py-4 grid grid-cols-2 gap-2 mb-4">
                <div>
                  <h2 className="font-medium">Giờ mở đăng ký</h2>
                  <input
                    type="datetime-local"
                    value={registerOpen}
                    onChange={(e) => setRegisterOpen(e.target.value)}
                    className="border px-3 py-2 my-1 rounded w-full"
                  />
                </div>

                <div>
                  <h2 className="font-medium">Giờ đóng đăng ký</h2>
                  <input
                    type="datetime-local"
                    value={registerClose}
                    onChange={(e) => setRegisterClose(e.target.value)}
                    className="border px-3 py-2 my-1 rounded w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Cấu hình ca làm</h3>

              {shifts.map((shift, index) => (
                <div className="flex flex-col">
                  <div className="border px-3 py-2 rounded mb-2 grid grid-cols-3 gap-2">
                    {/* ROW 1: tên + giờ */}
                    <div>
                      <p className="text-xs mb-1">Ca làm</p>
                      <select
                        value={shift.shift_id || ""}
                        onChange={(e) => {
                          const newShifts = [...shifts];
                          newShifts[index].shift_id = Number(e.target.value);
                          setShifts(newShifts);
                        }}
                        className="border px-2 py-1 rounded w-full"
                      >
                        <option value="">Chọn ca</option>
                        {shiftList?.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({formatTime(s.start_time)} -{" "}
                            {formatTime(s.end_time)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ROW 2: loại nhân viên */}
                    <div>
                      <p className="text-xs mb-1">Loại nhân viên</p>
                      <select
                        value={shift.employeeType}
                        onChange={(e) => {
                          const newShifts = [...shifts];
                          const value = e.target.value;

                          if (
                            value === "FULLTIME" ||
                            value === "PARTTIME" ||
                            value === "ALL"
                          ) {
                            newShifts[index].employeeType = value;
                          }

                          setShifts(newShifts);
                        }}
                        className="border px-2 py-1 rounded w-full mb-2"
                      >
                        <option value="ALL">Tất cả</option>
                        <option value="FULLTIME">Fulltime</option>
                        <option value="PARTTIME">Parttime</option>
                      </select>
                    </div>

                    {/* ROW 3: số lượng nhân viên mỗi ca */}
                    <div>
                      <p className="text-xs mb-1">Số lượng tối đa</p>
                      <input
                        type="number"
                        placeholder="Số nhân viên tối đa"
                        value={shift.max_employee || ""}
                        onChange={(e) => {
                          const newShifts = [...shifts];
                          const value = e.target.value;

                          newShifts[index].max_employee = value
                            ? Number(value)
                            : undefined;
                          setShifts(newShifts);
                        }}
                        className="border px-2 py-1 rounded w-full mb-2"
                      />
                    </div>

                    {/* COLUMN 2: Tùy chọn lịch cho mỗi ca */}
                    <div className="col-span-3 flex gap-2">
                      <button
                        onClick={() => {
                          const newShifts = [...shifts];
                          newShifts[index].applyType = "ALL_DAYS";
                          setShifts(newShifts);
                        }}
                        className={`text-xs px-2 py-1 rounded ${
                          shift.applyType === "ALL_DAYS"
                            ? "bg-amber-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        Toàn tháng
                      </button>

                      <button
                        onClick={() => {
                          const newShifts = [...shifts];
                          newShifts[index].applyType = "WEEKEND";
                          setShifts(newShifts);
                        }}
                        className={`text-xs px-2 py-1 rounded ${
                          shift.applyType === "WEEKEND"
                            ? "bg-amber-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        T7, CN
                      </button>

                      <button
                        onClick={() => {
                          const newShifts = [...shifts];
                          newShifts[index].applyType = "CUSTOM";
                          setShifts(newShifts);
                        }}
                        className={`text-xs px-2 py-1 rounded ${
                          shift.applyType === "CUSTOM"
                            ? "bg-amber-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        Tùy chọn
                      </button>

                      {shift.applyType === "CUSTOM" && (
                        <div className="grid grid-cols-10 gap-1 mt-2">
                          {selectedDays.map((date) => {
                            const isSelected =
                              shift.customDates?.includes(date);

                            return (
                              <div
                                key={date}
                                onClick={() => {
                                  const newShifts = [...shifts];
                                  const current =
                                    newShifts[index].customDates || [];

                                  if (current.includes(date)) {
                                    newShifts[index].customDates =
                                      current.filter((d) => d !== date);
                                  } else {
                                    newShifts[index].customDates = [
                                      ...current,
                                      date,
                                    ];
                                  }

                                  setShifts(newShifts);
                                }}
                                className={`text-xs text-center p-1 rounded cursor-pointer
            ${isSelected ? "bg-blue-500 text-white" : "bg-gray-200"}
          `}
                              >
                                {date.split("-")[2]}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() =>
                  setShifts([
                    ...shifts,
                    {
                      shift_id: 0,
                      employeeType: "ALL",
                      applyType: "ALL_DAYS",
                      customDates: [],
                      max_employee: undefined,
                    },
                  ])
                }
                className="text-sm bg-amber-100 px-3 py-1 rounded"
              >
                + Thêm ca
              </button>
            </div>
          </div>
        )}

        {errors && <p className="text-red-500 text-sm mt-2">{errors}</p>}

        {/* ACTION */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-500 text-white rounded"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
