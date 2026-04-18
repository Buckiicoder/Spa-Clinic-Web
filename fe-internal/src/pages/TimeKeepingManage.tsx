import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useAppDispatch } from "../app/hook";
import { useNavigate } from "react-router-dom";
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
import {
  fetchTimekeeping,
  selectTimekeepingRecords,
} from "../features/timekeeping/timekeepingSlice";
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

  const navigate = useNavigate();
  const records = useSelector(selectTimekeepingRecords);

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
    dispatch(fetchSchedule({ month: month + 1, year }) as any);

    dispatch(
      fetchTimekeeping({
        month: month + 1,
        year,
      }) as any,
    );
  }, [dispatch, month, year]);

  const [employeeView, setEmployeeView] = useState<
    "ALL" | "FULLTIME" | "PARTTIME"
  >("ALL");

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

  const normalizeDate = (value?: string) => {
    if (!value) return "";

    const d = new Date(value);
    d.setHours(d.getHours() + 7);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const filteredRecords = useMemo(() => {
    if (employeeView === "ALL") return records;

    return records.filter((item: any) => item.employee_type === employeeView);
  }, [records, employeeView]);

  const groupedByDate = useMemo(() => {
    const result: Record<string, any[]> = {};

    filteredRecords.forEach((item: any) => {
      const date = normalizeDate(item.work_date);

      if (!result[date]) result[date] = [];

      const existed = result[date].find(
        (x) =>
          Number(x.shift_id) === Number(item.shift_id) &&
          x.employee_type === item.employee_type,
      );

      // FULLTIME: nhân viên xin nghỉ
      if (item.employee_type === "FULLTIME") {
        if (existed) {
          if (["PENDING", "OFF"].includes(item.status)) {
            existed.offCount += 1;
            existed.leaveEmployees.push(item);
          }
        } else {
          result[date].push({
            shift_id: item.shift_id,
            employee_type: "FULLTIME",
            shift_name: item.shift_name,
            start_time: item.start_time,
            end_time: item.end_time,
            offCount: ["PENDING", "OFF"].includes(item.status) ? 1 : 0,
            leaveEmployees: ["PENDING", "OFF"].includes(item.status)
              ? [item]
              : [],
          });
        }
      }

      // PARTTIME: nhân viên đăng ký đi làm
      if (item.employee_type === "PARTTIME") {
        if (existed) {
          if (["PENDING", "SCHEDULED"].includes(item.status)) {
            existed.workCount += 1;
            existed.workEmployees.push(item);
          }
        } else {
          const scheduleInfo = days.find(
            (d: any) =>
              Number(d.shift_id) === Number(item.shift_id) &&
              normalizeDate(d.work_date) === date &&
              d.employee_type === "PARTTIME",
          );

          result[date].push({
            shift_id: item.shift_id,
            employee_type: "PARTTIME",
            shift_name: item.shift_name,
            start_time: item.start_time,
            end_time: item.end_time,
            max_employee: scheduleInfo?.max_employee || 0,
            workCount: ["PENDING", "SCHEDULED"].includes(item.status) ? 1 : 0,
            workEmployees: ["PENDING", "SCHEDULED"].includes(item.status)
              ? [item]
              : [],
          });
        }
      }
    });

    return result;
  }, [filteredRecords, days]);

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

            <div className="flex justify-center gap-2 mb-4">
              {[
                { key: "ALL", label: "Tất cả" },
                { key: "FULLTIME", label: "Fulltime" },
                { key: "PARTTIME", label: "Parttime" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setEmployeeView(item.key as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition
        ${
          employeeView === item.key
            ? "bg-amber-600 text-white shadow"
            : "bg-gray-100 hover:bg-amber-100"
        }
      `}
                >
                  {item.label}
                </button>
              ))}
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
                const date = formatDate(day.day);

                const schedules = day.isCurrentMonth
                  ? groupedByDate[date] || []
                  : [];

                return (
                  <div
                    key={index}
                    className={`min-h-[150px] rounded-2xl border p-2 flex flex-col gap-2 transition
          ${
            day.isCurrentMonth
              ? "bg-white hover:border-amber-400 hover:shadow"
              : "bg-gray-100 text-gray-400"
          }
        `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[15px] px-1">
                        {day.day}
                      </span>

                      {schedules.length > 0 && (
                        <span className="text-[12px] px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                          {schedules.length} ca
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-full pr-1">
                      {schedules.map((schedule: any, idx: number) => {
                        const shift = shifts.find(
                          (s: any) =>
                            Number(s.id) === Number(schedule.shift_id),
                        );

                        return (
                          <button
                            key={`${date}-${schedule.employee_type}-${schedule.shift_id}-${idx}`}
                            onClick={() =>
                              navigate(
                                `/timekeeping/detail?date=${date}&shift=${schedule.shift_id}&type=${schedule.employee_type}`,
                              )
                            }
                            className={`w-full text-left rounded-xl border p-2 transition hover:shadow-sm
                  ${
                    schedule.employee_type === "FULLTIME"
                      ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                      : "bg-green-50 border-green-200 hover:border-green-300"
                  }
                `}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold truncate">
                                  {shift?.name || "Ca làm"}
                                </div>

                                <div className="text-xs text-gray-600 mt-0.5">
                                  {shift?.start_time?.slice(0, 5)} -{" "}
                                  {shift?.end_time?.slice(0, 5)}
                                </div>
                              </div>

                              <div
                                className={`text-[9px] px-2 py-1 rounded-full font-medium whitespace-nowrap
                      ${
                        schedule.employee_type === "FULLTIME"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                              >
                                {schedule.employee_type === "FULLTIME"
                                  ? "FT"
                                  : "PT"}
                              </div>
                            </div>

                            {schedule.employee_type === "FULLTIME" ? (
                              <div className="mt-2 flex flex-col gap-2">
                                <div className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 px-2 py-1.5">
                                  <span className="text-[11px] font-medium text-red-700">
                                    Chờ duyệt nghỉ
                                  </span>

                                  <span className="min-w-[24px] text-center text-xs font-bold text-red-700 bg-white border border-red-200 rounded-full px-2 py-0.5">
                                    {
                                      schedule.leaveEmployees?.filter(
                                        (employee: any) =>
                                          employee.status === "PENDING",
                                      ).length
                                    }
                                  </span>
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-2 py-1.5">
                                  <span className="text-[11px] font-medium text-gray-700">
                                    Đã duyệt nghỉ
                                  </span>

                                  <span className="min-w-[24px] text-center text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                                    {
                                      schedule.leaveEmployees?.filter(
                                        (employee: any) =>
                                          employee.status === "OFF",
                                      ).length
                                    }
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 flex flex-col gap-2">
                                <div className="flex items-center justify-between rounded-lg bg-yellow-50 border border-yellow-200 px-2 py-1.5">
                                  <span className="text-[11px] font-medium text-yellow-700">
                                    Chờ duyệt đi làm
                                  </span>

                                  <span className="min-w-[24px] text-center text-xs font-bold text-yellow-700 bg-white border border-yellow-200 rounded-full px-2 py-0.5">
                                    {
                                      schedule.workEmployees?.filter(
                                        (employee: any) =>
                                          employee.status === "PENDING",
                                      ).length
                                    }
                                  </span>
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-2 py-1.5">
                                  <span className="text-[11px] font-medium text-green-700">
                                    Đã duyệt đi làm
                                  </span>

                                  <span className="min-w-[24px] text-center text-xs font-bold text-green-700 bg-white border border-green-200 rounded-full px-2 py-0.5">
                                    {
                                      schedule.workEmployees?.filter(
                                        (employee: any) =>
                                          employee.status === "SCHEDULED",
                                      ).length
                                    }
                                  </span>
                                </div>

                                <div className="text-[11px] text-right text-red-500 font-bold">
                                  Tổng: {schedule.workCount}/
                                  {schedule.max_employee}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}

                      {day.isCurrentMonth && schedules.length === 0 && (
                        <div className="text-[10px] text-gray-400 italic mt-1">
                          Không có ca
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
