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
  checkIn,
  checkOut,
  startBreak,
  endBreak,
} from "../features/timekeeping/timekeepingSlice";
import { fetchBranches, selectBranches } from "../features/branch/branchSlice";
import { getDistanceInMeters } from "../features/branch/branchFunction";

export default function TimeKeeping() {
  const dispatch = useDispatch();

  const days = useSelector(selectScheduleDays);
  const period = useSelector(selectSchedulePeriod);
  const user = useSelector(selectUser);
  const registeredRecords = useSelector(selectTimekeepingRecords);
  const branches = useSelector(selectBranches);

  const [checkingLocation, setCheckingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const employeeBranch = useMemo(() => {
    return branches.find((b: any) => Number(b.id) === Number(user?.branch_id));
  }, [branches, user?.branch_id]);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

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

  const todayStr = `${year}-${String(month).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  const todayRecord = registeredMap[todayStr]?.[0] || null;

  const todaySchedule = scheduleMap[todayStr]?.[0] || null;

  const nowTime = new Date();

  const parseShiftTime = (dateStr: string, time?: string) => {
    if (!time) return null;

    const [h, m] = time.slice(0, 5).split(":").map(Number);

    const d = new Date(dateStr);
    d.setHours(h, m, 0, 0);

    return d;
  };

  const shiftStart = parseShiftTime(
    todayStr,
    todayRecord?.start_time || todaySchedule?.start_time,
  );

  const shiftEnd = parseShiftTime(
    todayStr,
    todayRecord?.end_time || todaySchedule?.end_time,
  );

  const checkInOpenTime = shiftStart
    ? new Date(shiftStart.getTime() - 30 * 60 * 1000)
    : null;

  const checkInCloseTime = shiftEnd;

  const isBeforeShift = !!checkInOpenTime && nowTime < checkInOpenTime;

  const isAfterShift = !!checkInCloseTime && nowTime > checkInCloseTime;

  const isWorking = todayRecord?.status === "WORKING";
  const isBreak = todayRecord?.status === "BREAK";
  const isCompleted = todayRecord?.status === "COMPLETED";

  const isFulltime = employeeType === "FULLTIME";
  const isParttime = employeeType === "PARTTIME";

  const canCheckIn = (() => {
    if (!todayRecord || !shiftStart || !shiftEnd) return false;

    // chưa tới thời gian mở checkin
    if (isBeforeShift) return false;

    // quá giờ làm thì không cho checkin nữa
    if (isAfterShift) return false;

    // parttime: chỉ được checkin 1 lần
    if (isParttime) {
      return (
        ["SCHEDULED", "PENDING"].includes(todayRecord.status) &&
        !todayRecord.check_in
      );
    }

    // fulltime
    if (isFulltime) {
      // lần đầu vào ca
      if (!todayRecord.check_in) {
        return ["SCHEDULED", "PENDING"].includes(todayRecord.status);
      }

      // đã nghỉ trưa và đang ở trạng thái BREAK -> cho vào lại
      if (todayRecord.break_start_time && !todayRecord.break_end_time) {
        return true;
      }
    }

    return false;
  })();

  const canCheckOut = (() => {
    if (!todayRecord) return false;

    // parttime/fulltime đang làm thì đều được checkout
    if (isWorking) return true;

    // fulltime sau khi checkin lại sau giờ nghỉ vẫn được checkout
    if (isBreak) return true;

    return false;
  })();

  const canRequestOT =
    !!todayRecord &&
    !!shiftEnd &&
    isWorking &&
    nowTime > new Date(shiftEnd.getTime() + 30 * 60 * 1000);

  const canStartBreak =
    isFulltime &&
    todayRecord?.status === "WORKING" &&
    !todayRecord?.break_start_time;

  const canEndBreak = isFulltime && todayRecord?.status === "BREAK";

  const todayStatusText = (() => {
    if (!todayRecord) return "Chưa có lịch";

    if (todayRecord.status === "PENDING") {
      return employeeType === "FULLTIME"
        ? "Chờ duyệt nghỉ"
        : "Chờ duyệt đi làm";
    }

    if (todayRecord.status === "OFF") {
      return employeeType === "FULLTIME" ? "Được nghỉ" : "Từ chối";
    }

    if (todayRecord.check_out) return "Đã hoàn thành";
    if (todayRecord.check_in) return "Đang làm";

    return "Chưa chấm công";
  })();

  // Phần hiển thị ngày đúng với thứ
  const firstDay = new Date(year, month - 1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const calendarDays = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isRegisterLocked = isBeforeOpen || isAfterClose || hasRegistered;

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

  const validateBranchLocation = async () => {
    if (!employeeBranch) {
      throw new Error("Bạn chưa được gán cơ sở làm việc");
    }

    if (!navigator.geolocation) {
      throw new Error("Trình duyệt không hỗ trợ lấy vị trí");
    }

    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      },
    );

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const branchLat = Number(employeeBranch.latitude);
    const branchLng = Number(employeeBranch.longitude);
    const allowedRadius = Number(employeeBranch.allowed_radius || 100);

    const distance = getDistanceInMeters(lat, lng, branchLat, branchLng);

    console.log("CHECK LOCATION", {
      userLat: lat,
      userLng: lng,
      branchLat,
      branchLng,
      distance,
      allowedRadius,
    });

    if (distance > allowedRadius) {
      throw new Error(
        `Bạn đang ngoài khu vực cho phép chấm công (${Math.round(distance)}m / ${allowedRadius}m)`,
        // `Bạn đang ngoài khu vực cho phép chấm công)`,
      );
    }

    return { lat, lng };
  };

  const handleCheckIn = async () => {
    if (!todayRecord?.id) return;

    if (!shiftStart || !shiftEnd) {
      alert("Không tìm thấy thời gian ca làm");
      return;
    }

    if (isBeforeShift) {
      alert(
        "Chưa đến thời gian chấm công. Bạn chỉ được chấm công trước ca tối đa 30 phút",
      );
      return;
    }

    if (isAfterShift) {
      alert(
        `Ca làm đã kết thúc (${todayRecord.start_time?.slice(0, 5)} - ${todayRecord.end_time?.slice(0, 5)})`,
      );
      return;
    }

    try {
      setCheckingLocation(true);
      setLocationError("");

      const { lat, lng } = await validateBranchLocation();

      await dispatch(
        checkIn({
          id: Number(todayRecord.id),
          lat,
          lng,
        }) as any,
      ).unwrap();

      alert(
        isFulltime &&
          todayRecord.break_start_time &&
          !todayRecord.break_end_time
          ? "Quay lại làm việc thành công"
          : "Chấm công vào ca thành công",
      );

      dispatch(
        fetchTimekeeping({
          month,
          year,
          user_id: Number(user.id),
        }) as any,
      );
    } catch (err: any) {
      setLocationError(err?.message || "Không thể xác minh vị trí");
      alert(err?.message || "Không thể chấm công");
    } finally {
      setCheckingLocation(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord?.id) return;

    try {
      setCheckingLocation(true);
      setLocationError("");

      const { lat, lng } = await validateBranchLocation();

      await dispatch(
        checkOut({
          id: Number(todayRecord.id),
          lat,
          lng,
        }) as any,
      ).unwrap();

      alert("Chấm công ra ca thành công");

      dispatch(
        fetchTimekeeping({
          month,
          year,
          user_id: Number(user.id),
        }) as any,
      );
    } catch (err: any) {
      setLocationError(err?.message || "Không thể xác minh vị trí");
      alert(err?.message || "Không thể chấm công ra ca");
    } finally {
      setCheckingLocation(false);
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

          {/* navigate các tháng trong lịch */}
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

          {/* Tiêu đề lịch (thứ)*/}
          <div className="grid grid-cols-7 text-center text-black font-medium mb-2">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Nội dung các ngày trong tháng */}
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

              const approvedWorkingDay = registeredDay.some((x: any) =>
                ["SCHEDULED", "WORKING", "BREAK", "COMPLETED"].includes(
                  x.status,
                ),
              );

              const approvedOffDay = registeredDay.some(
                (x: any) => x.status === "OFF",
              );

              const rejectedDay = registeredDay.some(
                (x: any) => x.status === "REJECT",
              );

              const isSelected =
                employeeType === "FULLTIME"
                  ? selectedDays.includes(dateStr)
                  : selectedShifts.some((s) => s.work_date === dateStr);

              const shiftsToRender = hasRegisteredDay
                ? registeredDay
                : hasSchedule;
              const visibleShifts = shiftsToRender.slice(0, 2);
              const hiddenShiftCount = shiftsToRender.length - 2;

              const isToday =
                day === today.getDate() &&
                month === today.getMonth() + 1 &&
                year === today.getFullYear();

                  const hasFinalStatus =
  pendingDay ||
  approvedWorkingDay ||
  approvedOffDay ||
  rejectedDay;

              return (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (hasRegistered || isBeforeOpen || isAfterClose) return;
                    handleSelectDay(dateStr, isAvailable);
                  }}
                  className={`
  relative py-2 md:py-3 rounded-xl border transition-all text-sm min-h-[88px]

  ${
    !isAvailable && !hasRegisteredDay
      ? "bg-stone-50 border-stone-200 text-stone-300 cursor-default"
      : pendingDay
        ? employeeType === "FULLTIME"
          ? "bg-red-100 border-2 border-red-700 text-red-800"
          : "bg-amber-100 border-2 border-amber-700 text-amber-800"
        : approvedOffDay
          ? "bg-red-100 border-2 border-red-700 text-red-800"
          : approvedWorkingDay
            ? "bg-amber-100 border-2 border-amber-500 text-amber-800"
            : rejectedDay
              ? "bg-red-50 border-2 border-red-500 text-red-700"
              : isSelected
                ? employeeType === "FULLTIME"
                  ? "bg-red-100 border-red-700 text-red-800 ring-2 ring-red-300"
                  : "bg-amber-100 border-amber-500 text-amber-800 ring-2 ring-amber-300"
                : employeeType === "PARTTIME"
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-100"
  }

  ${isToday ? "ring-2 ring-amber-400" : ""}
 ${
  // isRegisterLocked && !hasFinalStatus
  //   ? "opacity-55 cursor-not-allowed"
  //   : isRegisterLocked
  //     ? "cursor-default"
  //     : 
  ""
}
`}
                >
                  {day}

                  <div className="mt-1 flex justify-center">
                    {pendingDay ? (
                      employeeType === "FULLTIME" ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-700 text-white font-semibold">
                          Nghỉ / Chờ duyệt
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-semibold">
                          Đăng ký / Chờ duyệt
                        </span>
                      )
                    ) : approvedOffDay ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-700 text-white font-semibold">
                        {employeeType === "FULLTIME"
                          ? "Đã duyệt nghỉ"
                          : "Từ chối"}
                      </span>
                    ) : approvedWorkingDay ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-semibold">
                        Đi làm
                      </span>
                    ) : rejectedDay ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-semibold">
                        Từ chối
                      </span>
                    ) : employeeType === "FULLTIME" ? (
                      isSelected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-700 text-white font-semibold">
                          Nghỉ / Chờ duyệt
                        </span>
                      ) : isAvailable ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-semibold">
                          Đi làm
                        </span>
                      ) : null
                    ) : employeeType === "PARTTIME" ? (
                      selectedShifts.some((s) => s.work_date === dateStr) ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-semibold">
                          Đăng ký / Chờ duyệt
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
                      {visibleShifts.map((s: any, idx: number) => {
                        const shiftId = getShiftId(s);

                        const isShiftSelected = selectedShifts.some(
                          (x) =>
                            x.work_date === dateStr &&
                            Number(x.shift_id) === Number(shiftId),
                        );

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();

                              if (isRegisterLocked || hasRegistered) return;

                              if (employeeType === "PARTTIME") {
                                handleSelectDay(dateStr, true, shiftId);
                              }

                              if (employeeType === "FULLTIME") {
                                handleSelectDay(dateStr, true);
                              }
                            }}
                            className={`w-full rounded-md px-1.5 py-1 font-medium transition text-center
${
  // FULLTIME đã chọn nghỉ / chờ duyệt
  employeeType === "FULLTIME" && isSelected
    ? "bg-red-100 border-red-600 text-red-700 ring-1 ring-red-300"
    : // PARTTIME đã chọn ca
      employeeType === "PARTTIME" && isShiftSelected
      ? "bg-amber-100 border-amber-500 text-amber-800 ring-1 ring-amber-300"
      : // Đã gửi chờ duyệt
        s.status === "PENDING"
        ? employeeType === "FULLTIME"
          ? "bg-red-100 border-red-600 text-red-700"
          : "bg-amber-100 border-amber-500 text-amber-800"
        : // Đã duyệt nghỉ / từ chối
          s.status === "OFF"
          ? "bg-red-100 border-red-700 text-red-800"
          : // Đi làm / đã duyệt
            ["SCHEDULED", "WORKING", "BREAK", "COMPLETED"].includes(s.status)
            ? "bg-amber-100 border-amber-500 text-amber-800"
            : // Bị từ chối
              s.status === "REJECT"
              ? "bg-red-50 border-red-400 text-red-700"
              : // Chưa chọn
                employeeType === "FULLTIME"
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : "border-t-2 bg-amber-50 border-amber-200 text-amber-700"
}
${
  employeeType === "PARTTIME" && !isRegisterLocked
    ? " hover:bg-amber-50 cursor-pointer"
    : employeeType === "FULLTIME" && !isRegisterLocked
      ? " cursor-pointer"
      : " cursor-default"
}
${
  isRegisterLocked &&
  !["PENDING", "OFF", "REJECT", "SCHEDULED", "WORKING", "BREAK", "COMPLETED"].includes(
    s.status,
  )
    ? "opacity-60"
    : ""
}
`}
                          >
                            <span className="font-semibold">
                              {`${s.shift_name || s.name || "Ca làm"} : ${(
                                s.start_time || ""
                              ).slice(0, 5)} - ${(s.end_time || "").slice(
                                0,
                                5,
                              )}`}
                            </span>

                            {employeeType === "PARTTIME" && isShiftSelected && (
                              <div className="mt-1 text-[9px] font-semibold text-amber-700">
                                Đã chọn
                              </div>
                            )}
                          </button>
                        );
                      })}

                      {hiddenShiftCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDate(dateStr);
                          }}
                          className="w-full rounded-md border border-dashed border-gray-300 bg-gray-50 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100"
                        >
                          +{hiddenShiftCount} ca khác
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
            ? "bg-amber-600 hover:bg-amber-700 text-white"
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
                    <div className="px-0 flex justify-center font-bold mb-1 text-lg ">
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

        {expandedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Các ca ngày {expandedDate.split("-").reverse().join("/")}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Chọn ca bạn muốn đăng ký
                  </p>
                </div>

                <button
                  onClick={() => setExpandedDate(null)}
                  className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {(scheduleMap[expandedDate] || []).map(
                  (s: any, idx: number) => {
                    const shiftId = getShiftId(s);

                    const isShiftSelected = selectedShifts.some(
                      (x) =>
                        x.work_date === expandedDate &&
                        Number(x.shift_id) === Number(shiftId),
                    );

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isRegisterLocked) return;
                          handleSelectDay(expandedDate, true, shiftId);
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition
${
  isShiftSelected
    ? "border-amber-500 bg-amber-100 ring-1 ring-amber-300"
    : isRegisterLocked
      ? "border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed"
      : "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50"
}
`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {s.shift_name || s.name || "Ca làm"}
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                              {(s.start_time || "")?.slice(0, 5)} -{" "}
                              {(s.end_time || "")?.slice(0, 5)}
                            </div>
                          </div>

                          {isShiftSelected && (
                            <div className="rounded-full bg-amber-600 px-2 py-1 text-xs font-semibold text-white">
                              Đã chọn
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}

        {/* TODAY + SUMMARY */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
          {/* LEFT */}
          <div className="col-span-2 bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
            <div>
              {/* Ngày chấm công */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-amber-700">
                  Ngày chấm công
                </p>
                <p className="mt-1 text-base md:text-lg font-bold text-gray-800">
                  {new Date(todayStr).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Thông tin ca làm + thời gian đã làm */}
              <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex justify-between items-center gap-x-6 gap-y-2 text-sm px-2">
                  <div>
                    <span className="text-gray-500">Ca:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {(
                        todayRecord?.start_time ||
                        todaySchedule?.start_time ||
                        "--"
                      )?.slice(0, 5)}
                      {" - "}
                      {(
                        todayRecord?.end_time ||
                        todaySchedule?.end_time ||
                        "--"
                      )?.slice(0, 5)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Đã làm:</span>{" "}
                    <span className="font-semibold text-amber-600">
                      {(() => {
                        if (!todayRecord?.check_in_time) return "--";

                        const start = new Date(
                          todayRecord.check_in_time,
                        ).getTime();

                        const end = todayRecord?.check_out_time
                          ? new Date(todayRecord.check_out_time).getTime()
                          : Date.now();

                        let worked = Math.floor((end - start) / 60000);

                        // Trừ thời gian nghỉ trưa nếu có
                        if (todayRecord?.break_start_time) {
                          const breakStart = new Date(
                            todayRecord.break_start_time,
                          ).getTime();

                          const breakEnd = todayRecord?.break_end_time
                            ? new Date(todayRecord.break_end_time).getTime()
                            : Date.now();

                          worked -= Math.floor((breakEnd - breakStart) / 60000);
                        }

                        if (worked < 0) worked = 0;

                        const hours = Math.floor(worked / 60);
                        const minutes = worked % 60;

                        return `${hours}h ${String(minutes).padStart(2, "0")}p`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Giờ vào / ra */}
              <div className="mb-2 flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Vào:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {todayRecord?.check_in_time
                      ? new Date(todayRecord.check_in_time).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "--:--"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Ra:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {todayRecord?.check_out_time
                      ? new Date(todayRecord.check_out_time).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "--:--"}
                  </span>
                </div>
              </div>

              {/* Fulltime mới hiện giờ nghỉ / tiếp tục */}
              {isFulltime && (
                <div className="mb-4 flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Nghỉ:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {todayRecord?.break_start_time
                        ? new Date(
                            todayRecord.break_start_time,
                          ).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Tiếp tục:</span>{" "}
                    <span className="font-semibold text-gray-800">
                      {todayRecord?.break_end_time
                        ? new Date(
                            todayRecord.break_end_time,
                          ).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </span>
                  </div>
                </div>
              )}

              {/* Tổng công */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-amber-600 text-sm font-medium">
                    Tổng công hôm nay
                  </span>

                  <span className="font-semibold text-amber-600">
                    {(() => {
                      if (!todayRecord?.check_in_time) return "0 công";

                      const start = new Date(
                        todayRecord.check_in_time,
                      ).getTime();

                      const end = todayRecord?.check_out_time
                        ? new Date(todayRecord.check_out_time).getTime()
                        : Date.now();

                      let workedMinutes = Math.floor((end - start) / 60000);

                      // Trừ giờ nghỉ trưa
                      if (todayRecord?.break_start_time) {
                        const breakStart = new Date(
                          todayRecord.break_start_time,
                        ).getTime();

                        const breakEnd = todayRecord?.break_end_time
                          ? new Date(todayRecord.break_end_time).getTime()
                          : Date.now();

                        workedMinutes -= Math.floor(
                          (breakEnd - breakStart) / 60000,
                        );
                      }

                      if (workedMinutes < 0) workedMinutes = 0;

                      const workedHours = workedMinutes / 60;

                      // Fulltime: đủ 8h = 1 công
                      if (isFulltime) {
                        let workPoint = workedHours / 8;

                        // Làm tròn về các mốc 0.25
                        workPoint = Math.floor(workPoint * 4) / 4;

                        if (workPoint > 1) workPoint = 1;

                        return `${workPoint.toFixed(
                          workPoint % 1 === 0 ? 0 : 2,
                        )} công`;
                      }

                      // Parttime: hiển thị theo giờ
                      return `${workedHours.toFixed(1)} giờ`;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {employeeBranch && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                <p className="font-semibold text-amber-700">
                  Cơ sở chấm công: {employeeBranch.name}
                </p>

                <p className="mt-1 text-gray-600">{employeeBranch.address}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Bán kính cho phép: {employeeBranch.allowed_radius}m
                </p>
              </div>
            )}

            {locationError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {locationError}
              </div>
            )}

            {/* BUTTONS phải nằm trong cùng khối bên trái */}
            <div className="mt-6 flex flex-wrap gap-3">
              {canCheckIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingLocation}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 md:py-3 px-6 text-sm md:text-base rounded-xl font-semibold transition"
                >
                  {isFulltime &&
                  todayRecord?.break_start_time &&
                  !todayRecord?.break_end_time
                    ? "Quay lại làm việc"
                    : "Chấm công vào ca"}
                </button>
              )}

              {canCheckOut && (
                <button
                  onClick={handleCheckOut}
                  disabled={checkingLocation}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 md:py-3 px-6 text-sm md:text-base rounded-xl font-semibold transition"
                >
                  Chấm công ra ca
                </button>
              )}

              {canStartBreak && (
                <button
                  onClick={() =>
                    dispatch(startBreak(Number(todayRecord.id)) as any)
                  }
                  className="bg-sky-500 hover:bg-sky-600 text-white py-2 md:py-3 px-6 text-sm md:text-base rounded-xl font-semibold transition"
                >
                  Nghỉ trưa
                </button>
              )}

              {canEndBreak && (
                <button
                  onClick={() =>
                    dispatch(endBreak(Number(todayRecord.id)) as any)
                  }
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 md:py-3 px-6 text-sm md:text-base rounded-xl font-semibold transition"
                >
                  Tiếp tục làm việc
                </button>
              )}
              {canRequestOT && (
                <button className="bg-violet-500 hover:bg-violet-600 text-white py-2 md:py-3 px-6 text-sm md:text-base rounded-xl font-semibold transition">
                  Gửi yêu cầu OT
                </button>
              )}

              {!canCheckIn &&
                !canCheckOut &&
                !canRequestOT &&
                !canStartBreak &&
                !canEndBreak && (
                  <div className="text-sm text-gray-500 italic py-2">
                    {todayRecord?.status === "OFF"
                      ? "Hôm nay bạn được nghỉ"
                      : isBeforeShift
                        ? "Chưa đến thời gian chấm công"
                        : isAfterShift
                          ? "Ca làm hôm nay đã kết thúc"
                          : "Hiện chưa có thao tác nào khả dụng"}
                  </div>
                )}
            </div>
          </div>

          {/* RIGHT */}
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
