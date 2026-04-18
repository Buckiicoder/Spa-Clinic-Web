import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  fetchSchedule,
  selectScheduleDays,
  selectSchedulePeriod,
} from "../features/schedule/scheduleSlice";
import { selectUser } from "../features/auth/authSlice";
import {
  createTimekeeping,
  fetchTimekeeping,
  selectTimekeepingRecords,
} from "../features/timekeeping/timekeepingSlice";

export default function TimeKeeping() {
  const dispatch = useDispatch();

  const days = useSelector(selectScheduleDays);
  const period = useSelector(selectSchedulePeriod);
  const user = useSelector(selectUser);
  const registeredRecords = useSelector(selectTimekeepingRecords);

  // console.log(user);
  const employeeType = user?.employee_type;

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedShifts, setSelectedShifts] = useState<
    { work_date: string; shift_id: number }[]
  >([]);
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();

  const getShiftId = (item: any) => {
    return Number(item?.shift_id ?? item?.shift?.id ?? 0);
  };

  const now = new Date();

  const openFrom = period?.open_from ? new Date(period.open_from) : null;

  const openTo = period?.open_to ? new Date(period.open_to) : null;

  const isBeforeOpen = openFrom ? now < openFrom : false;
  const isAfterClose = openTo ? now > openTo : false;

  const formatDate = (date: string) => {
    const d = new Date(date);

    d.setHours(d.getHours() + 7);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "--";

    const d = new Date(value.replace(" ", "T"));

    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
      2,
      "0",
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const isCorrectMonth = period?.month === month && period?.year === year;

  const canRegister =
    period?.status === "OPEN" &&
    isCorrectMonth &&
    !isBeforeOpen &&
    !isAfterClose;

  const availableDays = useMemo(() => {
    if (!canRegister) return [];

    return days.filter((d: any) => d.employee_type === employeeType);
  }, [days, employeeType, canRegister]);

  useEffect(() => {
    dispatch(fetchSchedule({ month, year }) as any);

    if (user?.id) {
      dispatch(
        fetchTimekeeping({
          month,
          year,
          user_id: Number(user.id),
        }) as any,
      );
    }
  }, [month, year, user?.id]);

  // dùng để check dữ liệu lấy về từ db cho lịch tháng
  // useEffect(() => {
  //   console.log("SCHEDULE DAYS", days);
  //   console.log("AVAILABLE DAYS", availableDays);
  // }, [days, availableDays]);

  const changeMonth = (step: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + step);
    setCurrentDate(newDate);
  };

  const scheduleMap = useMemo(() => {
    const map: Record<string, any[]> = {};

    availableDays.forEach((d: any) => {
      const key = formatDate(d.work_date);

      if (!map[key]) map[key] = [];
      map[key].push(d);
    });

    return map;
  }, [availableDays]);

  const registeredMap = useMemo(() => {
    const map: Record<string, any[]> = {};

    registeredRecords.forEach((item: any) => {
      const key = formatDate(item.work_date);

      if (!map[key]) map[key] = [];
      map[key].push(item);
    });

    return map;
  }, [registeredRecords]);

  const hasRegistered = registeredRecords.length > 0;

  // Phần hiển thị ngày đúng với thứ
  const firstDay = new Date(year, month - 1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const calendarDays = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleSelectDay = (
    dateStr: string,
    isAvailable: boolean,
    shiftId?: number,
  ) => {
    if (isAfterClose || isBeforeOpen) return;
    if (!canRegister) return;
    if (!isAvailable) return;

    // FULLTIME: chọn ngày nghỉ
    if (employeeType === "FULLTIME") {
      setSelectedDays((prev) => {
        if (prev.includes(dateStr)) {
          return prev.filter((d) => d !== dateStr);
        }

        return [...prev, dateStr];
      });

      return;
    }

    // PARTTIME: chọn từng ca làm
    if (employeeType === "PARTTIME" && shiftId) {
      setSelectedShifts((prev) => {
        const existed = prev.find(
          (x) =>
            x.work_date === dateStr && Number(x.shift_id) === Number(shiftId),
        );

        if (existed) {
          return prev.filter(
            (x) =>
              !(
                x.work_date === dateStr &&
                Number(x.shift_id) === Number(shiftId)
              ),
          );
        }

        return [...prev, { work_date: dateStr, shift_id: Number(shiftId) }];
      });
    }
  };

  const handleSubmit = async () => {
    if (!canRegister || isAfterClose || isBeforeOpen) {
      alert("Đã hết thời gian đăng ký lịch làm");
      return;
    }

    try {
      let records: any[] = [];

      // FULLTIME:
      // - ngày chọn nghỉ => PENDING
      // - ngày không chọn => SCHEDULED
      if (employeeType === "FULLTIME") {
        records = availableDays.map((d: any) => {
          const dateKey = formatDate(d.work_date);

          const isOffDay = selectedDays.includes(dateKey);

          return {
            user_id: Number(user.id),
            shift_id: Number(d.shift_id),
            work_date: dateKey,
            status: isOffDay ? "PENDING" : "SCHEDULED",
          };
        });
      }

      // PARTTIME:
      // chỉ insert các ca đã chọn, trạng thái ban đầu là PENDING
      if (employeeType === "PARTTIME") {
        records = availableDays
          .filter((d: any) => {
            const dateKey = formatDate(d.work_date);

            return selectedShifts.some(
              (s) =>
                s.work_date === dateKey &&
                Number(s.shift_id) === Number(d.shift_id),
            );
          })
          .map((d: any) => ({
            user_id: Number(user.id),
            shift_id: Number(d.shift_id),
            work_date: formatDate(d.work_date),
            status: "PENDING",
          }));
      }

      if (records.length === 0) {
        alert(
          employeeType === "FULLTIME"
            ? "Vui lòng chọn ít nhất 1 ngày nghỉ"
            : "Vui lòng chọn ít nhất 1 ca làm",
        );
        return;
      }

      console.log("SEND RECORDS", records);

      await dispatch(createTimekeeping(records) as any).unwrap();

      setSelectedDays([]);
      setSelectedShifts([]);

      alert("Đăng ký lịch thành công");
    } catch (err: any) {
      console.error(err);

      alert(
        typeof err === "string" ? err : err?.message || "Đăng ký lịch thất bại",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-50">
      <div className="max-w-[1800px] mx-auto px-2 sm:px-3 md:px-6 py-4 md:py-6">
        {/* HEADER */}
        <div className="mb-4 flex items-start justify-between px-3 gap-4">
          <h4 className="text-lg md:text-2xl font-bold text-amber-600">
            Chấm công
          </h4>
        </div>

        {/* CALENDAR + TODAY */}
        {/* CALENDAR */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div
            className={`flex justify-between rounded-2xl px-4 py-1 border shadow-sm min-w-[260px] mb-3
      ${
        isAfterClose
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-amber-50 border-amber-200 text-amber-700"
      }
    `}
          >
            <h1 className=" mt-1 text-xs uppercase font-semibold opacity-70 ">
              Hạn đăng ký lịch
            </h1>

            <div className="text-sm md:text-base font-semibold">
              {formatDateTime(period?.open_to)}
            </div>

            <div className="mt-1 text-xs font-medium ">
              {isBeforeOpen
                ? "Chưa đến thời gian mở đăng ký"
                : isAfterClose
                  ? "Đã hết thời gian đăng ký"
                  : "Đang mở đăng ký"}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4 py-1">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-full hover:bg-amber-100 transition"
            >
              <ChevronLeft />
            </button>

            <div className="px-6 py-2 bg-amber-100 rounded-xl font-semibold">
              Tháng {month} / {year}
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-full hover:bg-amber-100 transition"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-black font-medium mb-2">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs md:text-sm">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="min-h-[88px]" />;
              }

              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasSchedule = scheduleMap[dateStr] || [];
              const registeredDay = registeredMap[dateStr] || [];

              const isAvailable = hasSchedule.length > 0;
              const hasRegisteredDay = registeredDay.length > 0;

              const pendingDay = registeredDay.some(
                (x: any) => x.status === "PENDING",
              );

              const workingDay = registeredDay.some(
                (x: any) => x.status === "SCHEDULED",
              );

              const isSelected =
                employeeType === "FULLTIME"
                  ? selectedDays.includes(dateStr)
                  : selectedShifts.some((s) => s.work_date === dateStr);

              const isToday =
                day === today.getDate() &&
                month === today.getMonth() + 1 &&
                year === today.getFullYear();

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (hasRegistered) return;
                    handleSelectDay(dateStr, isAvailable);
                  }}
                  className={`
  relative py-2 md:py-3 rounded-xl border transition-all text-sm min-h-[88px]

  ${
    !isAvailable && !hasRegisteredDay
      ? "bg-gray-50 border-gray-100 text-gray-300 cursor-default"
      : pendingDay
        ? employeeType === "FULLTIME"
          ? "bg-red-100 border-2 border-red-500 text-red-700"
          : "bg-green-100 border-2 border-green-500 text-green-700"
        : workingDay
          ? "bg-amber-100 border-amber-500 text-amber-700"
          : isSelected
            ? employeeType === "FULLTIME"
              ? "bg-red-100 border-red-500 text-red-700 ring-2 ring-red-300"
              : "bg-green-100 border-green-500 text-green-700 ring-2 ring-green-300"
            : "bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-100"
  }

  ${isToday ? "ring-2 ring-amber-400" : ""}
  ${hasRegistered ? "cursor-default" : ""}
`}
                >
                  {day}

                  <div className="mt-1 flex justify-center">
                    {pendingDay ? (
                      employeeType === "FULLTIME" ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold">
                          Nghỉ / Chờ duyệt
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-white font-semibold">
                          Đăng ký / Chờ duyệt
                        </span>
                      )
                    ) : workingDay ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-semibold">
                        Đi làm
                      </span>
                    ) : employeeType === "FULLTIME" ? (
                      isSelected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold">
                          Nghỉ / Chờ duyệt
                        </span>
                      ) : isAvailable ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-semibold">
                          Đi làm
                        </span>
                      ) : null
                    ) : employeeType === "PARTTIME" ? (
                      selectedShifts.some((s) => s.work_date === dateStr) ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600 text-white font-semibold">
                          Đã đăng ký
                        </span>
                      ) : isAvailable ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-semibold">
                          Chưa đăng ký
                        </span>
                      ) : null
                    ) : null}
                  </div>

                  {/* shift */}
                  {(isAvailable || hasRegisteredDay) && (
                    <div className="mt-2 space-y-1 text-[10px]">
                      {(hasRegisteredDay ? registeredDay : hasSchedule).map(
                        (s: any, idx: number) => {
                          const shiftId = getShiftId(s);

                          const isShiftSelected = selectedShifts.some(
                            (x) =>
                              x.work_date === dateStr &&
                              Number(x.shift_id) === Number(shiftId),
                          );

                          return (
                            <button
                              key={idx}
                              disabled={hasRegistered}
                              onClick={(e) => {
                                e.stopPropagation();

                                if (employeeType === "PARTTIME") {
                                  handleSelectDay(dateStr, true, shiftId);
                                }
                              }}
                              className={`w-full rounded-md px-1.5 py-1 font-medium transition
  ${
    employeeType === "PARTTIME" && isShiftSelected
      ? "bg-green-100 text-green-700 border-green-500"
      : s.status === "PENDING"
        ? employeeType === "FULLTIME"
          ? "bg-red-100 text-red-700 border border-red-300"
          : "bg-green-100 text-green-700 border border-green-300"
        : employeeType === "FULLTIME" && isSelected
          ? "bg-red-100 text-red-700 border border-red-300"
          : employeeType === "PARTTIME"
            ? "bg-amber-100 text-amber-600 "
            : "bg-amber-100 text-amber-700 border border-amber-200"
  }
  ${
    employeeType === "PARTTIME" && !hasRegistered
      ? "hover:bg-gray-50 cursor-pointer"
      : ""
  }
`}
                            >
                              {(s.shift_name || s.name) ?? "Ca làm"} •{" "}
                              {(s.start_time || "")?.slice(0, 5)} -{" "}
                              {(s.end_time || "")?.slice(0, 5)}
                              {employeeType === "PARTTIME" &&
                                isShiftSelected && (
                                  <div className="mt-1 text-[9px] font-semibold text-green-700">
                                    Đã đăng ký
                                  </div>
                                )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {!hasRegistered && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!canRegister || isAfterClose || isBeforeOpen}
                className={`px-4 py-2 rounded-xl font-semibold text-base transition
        ${
          canRegister && !isAfterClose && !isBeforeOpen
            ? "bg-amber-500 hover:bg-amber-600 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }
      `}
              >
                {isBeforeOpen
                  ? "Chưa mở đăng ký"
                  : isAfterClose
                    ? "Đã hết hạn đăng ký"
                    : "Xác nhận đăng ký"}
              </button>
            </div>
          )}

          {/* NOTE / RULE */}
          {canRegister && (
            <div className="mt-5">
              {employeeType === "FULLTIME" && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
                  {hasRegistered && (
                    <div className="px-0 flex justify-center font-bold mb-1 text-lg">
                      Bạn đã đăng ký lịch tháng này.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-xs">
                      Cam: Lịch đi làm
                    </span>
                    <span className="px-2 py-1 rounded-full bg-red-700 text-white text-xs">
                      Đỏ: Đăng ký nghỉ / chờ quản lý duyệt
                    </span>
                  </div>
                  <b>Lưu ý:</b> Vui lòng chọn ngày nghỉ trong tháng, tối đa{" "}
                  <b>1 buổi/tuần</b>, <b>4 buổi/tháng</b>. Nếu nghỉ quá điều
                  kiện vui lòng chọn và báo với quản lý. Các ngày{" "}
                  <b>không đăng ký</b> nghỉ là các ngày <b>mặc định </b> đi làm
                </div>
              )}

              {employeeType === "PARTTIME" && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm">
                  <b>Lưu ý:</b> Vui lòng đăng ký ca làm phù hợp với lịch cá
                  nhân. Các ca sẽ được duyệt dựa trên số lượng tối đa.
                </div>
              )}
            </div>
          )}
        </div>

        {/* TODAY + SUMMARY */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
          {/* TODAY INFO */}
          <div className="col-span-2 bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3
                  className="text-base md:text-xl font-semibold
                text-gray-800"
                >
                  Hôm nay, 06/08/2024
                </h3>
                <span className="text-sm bg-amber-100 text-amber-600 px-3 py-1 rounded-full font-medium">
                  Đang làm
                </span>
              </div>

              <div className="space-y-2 md:space-y-3 text-gray-700 text-sm md:text-base">
                <p className="flex items-center gap-2 ">
                  <span>Thời gian làm việc:</span>
                  <b>08 giờ 00 phút</b>
                </p>

                <p className="flex items-center gap-2">
                  <span>Vào:</span> <b>09:00</b>
                </p>

                <p className="flex items-center gap-2">
                  <span>Ra:</span> <b>--:--</b>
                </p>

                <p className="flex items-center gap-2 text-amber-600 font-semibold">
                  Tổng công: 0.5
                </p>
              </div>
            </div>

            <button className="mt-4 md:mt-6 bg-amber-500 hover:bg-amber-600 text-white py-2 md:py-3 text-sm md:text-base rounded-xl font-semibold transition">
              Chấm công ngay
            </button>
          </div>

          {/* SUMMARY RIGHT */}
          <div className="flex flex-col gap-4 md:gap-4 font-semibold text-2xl">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition ">
              <p className="text-gray-700 text-sm">Tổng công</p>
              <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">
                4.5 / 27
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition">
              <p className="text-gray-700 text-sm">Ngày phép còn</p>
              <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">
                2.5
              </p>
            </div>
          </div>
        </div>

        {/* HISTORY / EMPTY */}
        <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
          Chưa có dữ liệu chấm công trong tháng này.
        </div>
      </div>
    </div>
  );
}
