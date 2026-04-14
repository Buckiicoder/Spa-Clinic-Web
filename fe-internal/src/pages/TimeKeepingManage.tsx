import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch } from "../app/hook";
import { useSelector } from "react-redux";
import {
  fetchShifts,
  selectShifts,
  createShift,
  updateShift,
} from "../features/shift/shiftSlice";
import {
  fetchSchedule,
  createSchedulePeriod,
  setScheduleDays,
  selectSchedule,
} from "../features/schedule/scheduleSlice";
import ShiftModal from "../components/ShiftModal";
import ScheduleModal from "../components/ScheduleModal";
import Toast from "../components/Toast";

export default function TimeKeepingManage() {
  const [tab, setTab] = useState("shift");
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);

  // month hiện tại (0-11)
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  // schedule store
  const { period, days, loading } = useSelector(selectSchedule) ?? {
    period: null,
    days: [],
    loading: false,
  };

  const [toast, setToast] = useState({
    show: false,
    message: "",
  });
  const formatTime = (time: string) => time?.slice(0, 5);

  const dispatch = useAppDispatch();
  const shifts = useSelector(selectShifts);

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSchedule({ month: month + 1, year }));
  }, [dispatch, month, year]);

  const hasSchedule = (day: number) => {
    const date = formatDate(day);
    return days?.some((d: any) => d.work_date === date);
  };

  const safeToISO = (value?: string) => {
    if (!value) return undefined;

    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const generateCalendar = () => {
    const daysArr = [];
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = startOffset - 1; i >= 0; i--) {
      daysArr.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      daysArr.push({
        day: i,
        isCurrentMonth: true,
      });
    }

    let nextDay = 1;
    while (daysArr.length % 7 !== 0) {
      daysArr.push({ day: nextDay++, isCurrentMonth: false });
    }

    return daysArr;
  };

  const calendar = generateCalendar();

  const changeMonth = (direction: number) => {
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "shift", label: "Ca làm" },
          { key: "timekeeping", label: "Chấm công" },
          { key: "payroll", label: "Bảng lương" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-5 py-2 rounded-t-xl border transition-all duration-300
              ${
                tab === item.key
                  ? "text-white border-b-white bg-amber-500 shadow font-semibold"
                  : "bg-gray-100 hover:bg-amber-100"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="border rounded-b-2xl p-5 bg-white shadow-sm">
        {/* Quản lý ca làm */}
        {tab === "shift" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">Quản lý ca làm</h1>
              <button
                onClick={() => {
                  setSelectedShift(null);
                  setOpenModal(true);
                }}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl"
              >
                <Plus size={16} /> Thêm ca
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shifts.map((shift: any) => (
                <div
                  key={shift.id}
                  onClick={() => {
                    setSelectedShift(shift);
                    setOpenModal(true);
                  }}
                  className="p-4 rounded-2xl border shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <h3 className="font-semibold text-lg">{shift.name}</h3>

                  <p className="text-gray-500 mt-2">
                    {formatTime(shift.start_time)} -{" "}
                    {formatTime(shift.end_time)}
                  </p>

                  {/* trạng thái */}
                  <p
                    className={`mt-2 text-sm ${
                      shift.is_active ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {shift.is_active ? "Hoạt động" : "Ngưng"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quản lý chấm công */}
        {tab === "timekeeping" && (
          <div>
            {/* Header */}

            <div className="flex justify-between items-center mb-4">
              <div className="flex justify-between">
                <h1 className="text-xl font-semibold ">Bảng chấm công</h1>

                {period && (
                  <div className="flex px-2 py-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
        ${
          period.status === "OPEN"
            ? "bg-green-100 text-green-600"
            : "bg-gray-200 text-gray-500"
        }
      `}
                    >
                      {period.status === "OPEN"
                        ? "Đang mở đăng ký"
                        : "Chưa mở đăng ký"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOpenScheduleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl 
             bg-gradient-to-r from-amber-600 to-amber-700 
             text-white shadow-md 
             hover:from-orange-500 hover:to-red-500 transition"
                >
                  Mở đăng ký lịch
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl 
             bg-gradient-to-r from-amber-600 to-amber-700 
             text-white shadow-md 
             hover:from-orange-500 hover:to-red-500 transition"
                >
                  Thêm nhân viên
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl 
             bg-gradient-to-r from-amber-600 to-amber-700 
             text-white shadow-md 
             hover:from-orange-500 hover:to-red-500 transition"
                >
                  Sửa lịch
                </button>
              </div>
            </div>

            {/* Month selector đẹp hơn */}
            <div className="flex items-center justify-center gap-4 mb-4 py-1">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 rounded-full hover:bg-amber-100 transition"
              >
                <ChevronLeft />
              </button>

              <div className="px-6 py-2 bg-amber-100 rounded-xl font-semibold">
                Tháng {month + 1} / {year}
              </div>

              <button
                onClick={() => changeMonth(1)}
                className="p-2 rounded-full hover:bg-amber-100 transition"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Weekdays */}
            <div
              className="grid grid-cols-7 text-center text-xs font-semibold py-1
            mb-1 bg-amber-600 border rounded-xl text-white"
            >
              {weekdays.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar compact */}
            <div className="grid grid-cols-7 gap-1">
              {calendar.map((day, index) => {
                const isOff = day.isCurrentMonth && hasSchedule(day.day);

                return (
                  <div
                    key={index}
                    className={`min-h-[90px] border rounded-lg p-1 text-[11px] flex flex-col gap-1
        ${day.isCurrentMonth ? "bg-white" : "bg-gray-100 text-gray-400"}
        ${isOff && <span className="text-[8px] text-green-600">Có ca</span>}
      `}
                  >
                    <div className="font-semibold text-[11px] flex justify-between">
                      {day.day}
                      {isOff && (
                        <span className="text-[8px] text-red-500">OFF</span>
                      )}
                    </div>

                    {/* sau này sẽ render shift thật */}
                    <div className="flex flex-col gap-[2px] overflow-y-auto">
                      {!isOff && day.isCurrentMonth && (
                        <div className="text-[9px] text-gray-400">
                          Chưa có người đăng ký
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAYROLL TAB */}
        {tab === "payroll" && (
          <div className="text-center text-gray-500 py-20">
            Chưa có dữ liệu bảng lương
          </div>
        )}
      </div>
      <ShiftModal
        open={openModal}
        initialData={selectedShift}
        onClose={() => {
          setOpenModal(false);
          setSelectedShift(null);
        }}
        onSubmit={async (payload) => {
          try {
            if (selectedShift) {
              // 👉 EDIT
              await dispatch(updateShift(payload));

              setToast({
                show: true,
                message: "Cập nhật ca thành công 🎉",
              });
            } else {
              // 👉 CREATE
              await dispatch(createShift(payload));

              setToast({
                show: true,
                message: "Thêm ca làm thành công 🎉",
              });
            }

            setOpenModal(false);
            dispatch(fetchShifts());
          } catch (err) {
            console.error(err);
          }
        }}
      />

      <ScheduleModal
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        onSubmit={async (data) => {
          try {
            let periodId = period?.id;

            // 🔹 nếu chưa có → tạo mới
            if (!periodId) {
              const res = await dispatch(
                createSchedulePeriod({
                  month: data.month,
                  year: data.year,
                  status: "OPEN",
                  open_from: safeToISO(data.open_from),
                  open_to: safeToISO(data.open_to),
                }),
              ).unwrap();

              periodId = res.id;
            }

            // 🔹 build dữ liệu schedule_days từ shifts
            const payloadDays: any[] = [];

            data.shifts.forEach((shift: any) => {
              let dates: string[] = [];

              // ALL DAYS
              if (shift.applyType === "ALL_DAYS") {
                dates = data.selectedDays;
              }

              // WEEKEND
              if (shift.applyType === "WEEKEND") {
                dates = data.selectedDays.filter((d: string) => {
                  const day = new Date(d).getDay();
                  return day === 0 || day === 6;
                });
              }

              // CUSTOM
              if (shift.applyType === "CUSTOM") {
                dates = shift.customDates || [];
              }

              dates.forEach((date) => {
                if (shift.employeeType === "ALL") {
                  payloadDays.push({
                    work_date: date,
                    shift_id: shift.shift_id,
                    employee_type: "FULLTIME",
                    max_employee: shift.max_employee,
                  });

                  payloadDays.push({
                    work_date: date,
                    shift_id: shift.shift_id,
                    employee_type: "PARTTIME",
                    max_employee: shift.max_employee,
                  });
                } else {
                  payloadDays.push({
                    work_date: date,
                    shift_id: shift.shift_id,
                    employee_type: shift.employeeType,
                    max_employee: shift.max_employee,
                  });
                }
              });
            });

            // 🔹 gọi API
            await dispatch(
              setScheduleDays({
                period_id: periodId,
                days: payloadDays,
              }),
            );

            setOpenScheduleModal(false);

            // reload
            dispatch(fetchSchedule({ month: data.month, year: data.year }));
          } catch (err) {
            console.error(err);
          }
        }}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
