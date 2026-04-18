import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, Clock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hook";
import Toast from "../components/Toast";

import {
  fetchSchedule,
  selectScheduleDays,
} from "../features/schedule/scheduleSlice";

import {
  fetchTimekeeping,
  selectTimekeepingRecords,
  approveOff,
  rejectOff,
} from "../features/timekeeping/timekeepingSlice";

import { fetchShifts, selectShifts } from "../features/shift/shiftSlice";

export default function TKManageDetail() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedDateParam = searchParams.get("date");

  const [selectedDate, setSelectedDate] = useState<Date>(
    selectedDateParam ? new Date(selectedDateParam) : new Date(),
  );

  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const [employeeFilter, setEmployeeFilter] = useState<
    "ALL" | "FULLTIME" | "PARTTIME"
  >("ALL");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "APPROVED"
  >("ALL");

  const scheduleDays = useSelector(selectScheduleDays);
  const records = useSelector(selectTimekeepingRecords);
  const shifts = useSelector(selectShifts);

  useEffect(() => {
    dispatch(fetchShifts() as any);
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchSchedule({
        month: currentMonth + 1,
        year: currentYear,
      }) as any,
    );

    dispatch(
      fetchTimekeeping({
        month: currentMonth + 1,
        year: currentYear,
      }) as any,
    );
  }, [dispatch, currentMonth, currentYear]);

  const normalizeDate = (value?: string | Date) => {
    if (!value) return "";

    const d = new Date(value);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const selectedDateString = normalizeDate(selectedDate);

  const startOfWeek = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();

    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);

    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const mergedWeekData = useMemo(() => {
    return weekDays.map((day) => {
      const dateKey = normalizeDate(day);

      const daySchedules = scheduleDays.filter(
        (s: any) => normalizeDate(s.work_date) === dateKey,
      );

      const scheduleBlocks = daySchedules
        .filter((schedule: any) => {
          // lọc loại nhân viên theo chính schedule.employee_type
          const matchEmployeeType =
            employeeFilter === "ALL" ||
            schedule.employee_type === employeeFilter;

          return matchEmployeeType;
        })
        .map((schedule: any) => {
          const shift = shifts.find(
            (x: any) => Number(x.id) === Number(schedule.shift_id),
          );

          const relatedEmployees = records.filter(
            (r: any) =>
              normalizeDate(r.work_date) === dateKey &&
              Number(r.shift_id) === Number(schedule.shift_id),
          );

          const leaveEmployees = relatedEmployees.filter((r: any) => {
            if (!["PENDING", "OFF"].includes(r.status)) return false;

            if (statusFilter === "PENDING") return r.status === "PENDING";
            if (statusFilter === "APPROVED") return r.status === "OFF";

            return true;
          });

          const workingEmployees = relatedEmployees.filter((r: any) => {
            if (
              ![
                "PENDING",
                "SCHEDULED",
                "WORKING",
                "BREAK",
                "COMPLETED",
                "ABSENT",
              ].includes(r.status)
            ) {
              return false;
            }

            if (statusFilter === "PENDING") return r.status === "PENDING";

            if (statusFilter === "APPROVED") {
              return ["SCHEDULED", "WORKING", "BREAK", "COMPLETED"].includes(
                r.status,
              );
            }

            return true;
          });

          return {
            ...schedule,
            shift,
            leaveEmployees,
            workingEmployees,
          };
        })
        // nếu sau khi lọc không còn nhân viên nào thì ẩn luôn card ca làm
        .filter((schedule: any) => {
          // nếu không lọc trạng thái thì luôn giữ lại ca
          if (statusFilter === "ALL") return true;

          // khi có lọc trạng thái thì chỉ ẩn nếu đúng là không còn ai phù hợp
          if (schedule.employee_type === "FULLTIME") {
            return schedule.leaveEmployees.length > 0;
          }

          return schedule.workingEmployees.length > 0;
        });

      return {
        date: day,
        dateKey,
        schedules: scheduleBlocks,
      };
    });
  }, [weekDays, scheduleDays, shifts, records, employeeFilter, statusFilter]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const miniCalendar = useMemo(() => {
    const arr: Array<{ day: number; current: boolean; date: Date }> = [];

    for (let i = 0; i < offset; i++) {
      arr.push({
        day: 0,
        current: false,
        date: new Date(),
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({
        day: d,
        current: true,
        date: new Date(currentYear, currentMonth, d),
      });
    }

    return arr;
  }, [daysInMonth, currentMonth, currentYear, offset]);

  const changeMonth = (step: number) => {
    const next = new Date(currentYear, currentMonth + step, 1);
    setCurrentMonth(next.getMonth());
    setCurrentYear(next.getFullYear());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OFF":
        return "bg-green-100 text-green-700";

      case "SCHEDULED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OFF":
        return "Đã cho nghỉ";

      case "SCHEDULED":
        return "Không cho nghỉ";

      default:
        return "Chờ xác nhận nghỉ";
    }
  };

  const handleApproveOff = async (recordId: number) => {
    try {
      setUpdatingId(recordId);

      await dispatch(approveOff(recordId) as any).unwrap();

      setToast({
        show: true,
        message: "Đã xác nhận cho nhân viên nghỉ.",
        type: "success",
      });
    } catch (err) {
      console.error("APPROVE OFF ERROR", err);
      setToast({
        show: true,
        message: "Không thể duyệt nghỉ.",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectOff = async (recordId: number) => {
    try {
      setUpdatingId(recordId);

      await dispatch(rejectOff(recordId) as any).unwrap();

      setToast({
        show: true,
        message: "Đã từ chối nghỉ, nhân viên sẽ đi làm theo lịch.",
        type: "success",
      });
    } catch (err) {
      console.error("REJECT OFF ERROR", err);
      setToast({
        show: true,
        message: "Không thể từ chối nghỉ.",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const ToggleOption = ({
    active,
    label,
    onClick,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl border px-3 py-2 transition-all duration-300
      ${
        active
          ? "border-amber-300 bg-amber-50/60 shadow-sm"
          : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
      }
    `}
    >
      <span
        className={`text-sm font-medium transition-colors duration-300
        ${active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}
      `}
      >
        {label}
      </span>

      <div
        className={`relative h-6 w-11 rounded-full transition-all duration-300 ease-in-out
        ${active ? "bg-amber-600" : "bg-gray-300"}
      `}
      >
        <div
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md
          transition-transform duration-300 ease-in-out
          ${active ? "translate-x-5" : "translate-x-0"}
        `}
        />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 text-sm text-amber-700 hover:text-amber-800"
          >
            ← Quay lại quản lý chấm công
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết lịch làm việc
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tuần của ngày {selectedDateString}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr] gap-4">
        <div className="bg-white rounded-3xl shadow-sm border p-5 h-fit sticky top-4">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-full hover:bg-amber-100 transition"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="font-semibold text-gray-800">
              Tháng {currentMonth + 1} / {currentYear}
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-full hover:bg-amber-100 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-5">
            {miniCalendar.map((item, idx) => {
              if (!item.current) {
                return <div key={idx} className="h-10" />;
              }

              const isSelected =
                normalizeDate(item.date) === selectedDateString;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(item.date)}
                  className={`h-10 rounded-xl text-sm transition font-medium
                    ${
                      isSelected
                        ? "bg-amber-600 text-white shadow"
                        : "hover:bg-amber-100 text-gray-700"
                    }
                  `}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
                Loại ca làm
              </div>

              <div className="space-y-2">
                <ToggleOption
                  label="Fulltime"
                  active={employeeFilter === "FULLTIME"}
                  onClick={() =>
                    setEmployeeFilter((prev) =>
                      prev === "FULLTIME" ? "ALL" : "FULLTIME",
                    )
                  }
                />

                <ToggleOption
                  label="Parttime"
                  active={employeeFilter === "PARTTIME"}
                  onClick={() =>
                    setEmployeeFilter((prev) =>
                      prev === "PARTTIME" ? "ALL" : "PARTTIME",
                    )
                  }
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
                Trạng thái
              </div>

              <div className="space-y-2">
                <ToggleOption
                  label="Chờ duyệt"
                  active={statusFilter === "PENDING"}
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev === "PENDING" ? "ALL" : "PENDING",
                    )
                  }
                />

                <ToggleOption
                  label="Đã chấp nhận"
                  active={statusFilter === "APPROVED"}
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev === "APPROVED" ? "ALL" : "APPROVED",
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-stone-50 min-w-[1200px]">
            {mergedWeekData.map((day) => {
              const isSelected = day.dateKey === selectedDateString;

              return (
                <div
                  key={day.dateKey}
                  className={`p-4 border-r last:border-r-0
                    ${isSelected ? "bg-amber-50" : ""}
                  `}
                >
                  <div className="text-xs uppercase text-gray-500 mb-1">
                    {
                      [
                        "Thứ 2",
                        "Thứ 3",
                        "Thứ 4",
                        "Thứ 5",
                        "Thứ 6",
                        "Thứ 7",
                        "CN",
                      ][day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]
                    }
                  </div>

                  <div className="font-semibold text-lg text-gray-900">
                    {day.date.getDate()}/{day.date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 min-w-[1200px] min-h-[700px]">
            {mergedWeekData.map((day) => (
              <div
                key={day.dateKey}
                className={`border-r last:border-r-0 p-3 space-y-3 overflow-y-auto
                  ${day.dateKey === selectedDateString ? "bg-amber-50/30" : ""}
                `}
              >
                {day.schedules.length === 0 && (
                  <div className="text-xs text-gray-400 italic pt-4 text-center">
                    Không có ca làm
                  </div>
                )}

                {day.schedules.map((schedule: any, idx: number) => {
                  const pendingLeaveEmployees = schedule.leaveEmployees.filter(
                    (e: any) => e.status === "PENDING",
                  );

                  const approvedLeaveEmployees = schedule.leaveEmployees.filter(
                    (e: any) => e.status === "OFF",
                  );

                  const pendingWorkEmployees = schedule.workingEmployees.filter(
                    (e: any) => e.status === "PENDING",
                  );

                  const approvedWorkEmployees =
                    schedule.workingEmployees.filter((e: any) =>
                      ["SCHEDULED", "WORKING", "BREAK", "COMPLETED"].includes(
                        e.status,
                      ),
                    );

                  return (
                    <div
                      key={`${schedule.work_date}-${schedule.shift_id}-${idx}`}
                      className={`rounded-2xl border overflow-hidden shadow-sm
                      ${
                        schedule.employee_type === "FULLTIME"
                          ? "border-blue-200"
                          : "border-green-200"
                      }
                    `}
                    >
                      <div
                        className={`p-3 border-b
                        ${
                          schedule.employee_type === "FULLTIME"
                            ? "bg-blue-50"
                            : "bg-green-50"
                        }
                      `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-sm text-gray-900">
                              {schedule.shift?.name || "Ca làm"}
                            </div>

                            <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Clock size={12} />
                              {schedule.shift?.start_time?.slice(0, 5)} -{" "}
                              {schedule.shift?.end_time?.slice(0, 5)}
                              {/* {console.log(schedule)} */}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] px-2 py-1 rounded-full font-semibold
                            ${
                              schedule.employee_type === "FULLTIME"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }
                          `}
                          >
                            {schedule.employee_type}
                          </span>
                        </div>
                      </div>

                      <div className="p-3">
                        {schedule.employee_type === "FULLTIME" ? (
                          <div className="space-y-4">
                            {/* Chờ duyệt nghỉ */}
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-xs font-semibold text-amber-700">
                                  Yêu cầu nghỉ chờ duyệt (
                                  {pendingLeaveEmployees.length})
                                </div>
                              </div>

                              {pendingLeaveEmployees.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-red-100 bg-white">
                                  <div className="grid grid-cols-[1fr_50px] bg-red-50 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                                    <div>Nhân viên</div>
                                    <div className="text-center">Xử lý</div>
                                  </div>

                                  {pendingLeaveEmployees.map(
                                    (employee: any) => (
                                      <div
                                        key={employee.id}
                                        className="grid grid-cols-[1fr_50px] items-center border-t border-red-50 px-2 py-2"
                                      >
                                        <div className="min-w-0">
                                          <div className="text-xs font-medium text-gray-800 break-words leading-5">
                                            {employee.name
                                              ? `${employee.user_id} - ${employee.name}`
                                              : `Nhân viên #${employee.user_id}`}
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-0.5">
                                          <button
                                            onClick={() =>
                                              handleApproveOff(employee.id)
                                            }
                                            disabled={
                                              updatingId === employee.id
                                            }
                                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-green-700 transition hover:bg-green-200 disabled:opacity-50"
                                          >
                                            <Check size={14} />
                                          </button>

                                          <button
                                            onClick={() =>
                                              handleRejectOff(employee.id)
                                            }
                                            disabled={
                                              updatingId === employee.id
                                            }
                                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-100 text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Đã duyệt nghỉ */}
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-xs font-bold text-red-600">
                                  Danh sách nghỉ (
                                  {approvedLeaveEmployees.length})
                                </div>
                              </div>

                              {approvedLeaveEmployees.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-green-100 bg-white">
                                  <div className="bg-green-50 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                                    Nhân viên
                                  </div>

                                  {approvedLeaveEmployees.map(
                                    (employee: any) => (
                                      <div
                                        key={employee.id}
                                        className="border-t border-green-50 px-3 py-2 text-xs text-gray-800"
                                      >
                                        {employee.name
                                          ? `${employee.user_id} - ${employee.name}`
                                          : `Nhân viên #${employee.user_id}`}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Chờ duyệt đi làm */}
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-xs font-semibold text-amber-700">
                                  Đăng ký đi làm chờ duyệt (
                                  {pendingWorkEmployees.length})
                                </div>
                              </div>

                              {pendingWorkEmployees.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white">
                                  <div className="grid grid-cols-[1fr_50px] bg-amber-50 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                                    <div>Nhân viên</div>
                                    <div className="text-center">Xử lý</div>
                                  </div>

                                  {pendingWorkEmployees.map((employee: any) => (
                                    <div
                                      key={employee.id}
                                      className="grid grid-cols-[1fr_50px] items-center border-t border-amber-50 px-3 py-2"
                                    >
                                      <div className="min-w-0">
                                        <div className="text-xs font-medium text-gray-800 break-words leading-5">
                                          {employee.name
                                            ? `${employee.user_id} - ${employee.name}`
                                            : `Nhân viên #${employee.user_id}`}
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-end gap-0.5">
                                        {/* PARTTIME: đồng ý = cho đi làm */}
                                        <button
                                          onClick={() =>
                                            handleRejectOff(employee.id)
                                          }
                                          disabled={updatingId === employee.id}
                                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-green-700 transition hover:bg-green-200 disabled:opacity-50"
                                        >
                                          <Check size={14} />
                                        </button>

                                        {/* PARTTIME: từ chối = không cho đi làm */}
                                        <button
                                          onClick={() =>
                                            handleApproveOff(employee.id)
                                          }
                                          disabled={updatingId === employee.id}
                                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-100 text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Đã duyệt đi làm */}
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <div className="text-xs font-semibold text-green-700">
                                  Danh sách đi làm (
                                  {approvedWorkEmployees.length})
                                </div>
                              </div>

                              {approvedWorkEmployees.length > 0 && (
                                <div className="overflow-hidden rounded-2xl border border-green-100 bg-white">
                                  <div className="bg-green-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                                    Nhân viên
                                  </div>

                                  {approvedWorkEmployees.map(
                                    (employee: any) => (
                                      <div
                                        key={employee.id}
                                        className="border-t border-green-50 px-3 py-2 text-xs text-gray-800"
                                      >
                                        {employee.name
                                          ? `${employee.user_id} - ${employee.name}`
                                          : `Nhân viên #${employee.user_id}`}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              show: false,
            }))
          }
        />
      )}
    </div>
  );
}
