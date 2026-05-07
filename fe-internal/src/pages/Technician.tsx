import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchMySessions,
  fetchSessionDetail,
  startSession,
  completeSession,
  selectMySessions,
  selectSessionDetail,
} from "../features/technician/technicianSlice";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

export default function Technician() {
  const dispatch = useAppDispatch();
  const socketRef = useRef<any>(null);

  const sessions = useAppSelector(selectMySessions);

  const selectedSession = useAppSelector(selectSessionDetail);

  // giao diện ui cập nhật chạy dịch vụ KTV
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [stepStartedAt, setStepStartedAt] = useState<number | null>(null);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    dispatch(fetchMySessions());
  }, []);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    const socket = socketRef.current;

    socket.emit("join-technician");

    socket.on("session:assigned", async () => {
      await dispatch(fetchMySessions());
    });

    socket.on("session:updated", async () => {
      await dispatch(fetchMySessions());
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const assignedSessions = useMemo(() => {
    return sessions.filter((s: any) =>
      ["assigned", "in_progress"].includes(s.status),
    );
  }, [sessions]);

  const handleCompleteSession = useCallback(async () => {
    if (!selectedSession) return;

    await dispatch(
      completeSession({
        id: selectedSession.id,
        data: {
          doctor_note: "",
          skin_reaction: "",
          customer_feedback: "",
          rating: 5,
        },
      }),
    );

    await dispatch(fetchMySessions());
  }, [dispatch, selectedSession]);

  useEffect(() => {
    setActiveStepIndex(0);
    setElapsedSeconds(0);
    setStepStartedAt(null);
  }, [selectedSession?.id]);

  const steps = useMemo(() => {
    return Array.isArray(selectedSession?.steps) ? selectedSession.steps : [];
  }, [selectedSession?.steps]);

  const currentStep = steps[activeStepIndex];

  const totalDurationSeconds = (currentStep?.duration_minutes || 0) * 60;

  const progressPercent = totalDurationSeconds
    ? Math.min((elapsedSeconds / totalDurationSeconds) * 100, 100)
    : 0;

useEffect(() => {
  if (
    selectedSession?.status !== "in_progress" ||
    !steps.length
  ) {
    return;
  }

  // 🔥 chưa có thời gian bắt đầu
  if (!stepStartedAt) {
    setStepStartedAt(Date.now());
    return;
  }

  clearInterval(intervalRef.current);

  intervalRef.current = setInterval(() => {
    const currentStep =
      steps[activeStepIndex];

    if (!currentStep) {
      clearInterval(intervalRef.current);
      return;
    }

    const durationSeconds =
      currentStep.duration_minutes * 60;

    // 🔥 thời gian thực tế
    const realElapsed = Math.floor(
      (Date.now() - stepStartedAt) / 1000,
    );

    setElapsedSeconds(realElapsed);

    // 🔥 hoàn thành step
    if (realElapsed >= durationSeconds) {
      // còn step tiếp theo
      if (
        activeStepIndex <
        steps.length - 1
      ) {
        setActiveStepIndex(
          (prev) => prev + 1,
        );

        setElapsedSeconds(0);

        setStepStartedAt(Date.now());

        return;
      }

      // 🔥 complete session
      clearInterval(intervalRef.current);

      handleCompleteSession();
    }
  }, 1000);

  return () => {
    clearInterval(intervalRef.current);
  };
}, [
  selectedSession?.status,
  activeStepIndex,
  steps,
  stepStartedAt,
  handleCompleteSession,
]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-700";

      case "in_progress":
        return "bg-amber-100 text-amber-700";

      case "done":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "assigned":
        return "Đã phân ca";

      case "in_progress":
        return "Đang thực hiện";

      case "done":
        return "Hoàn thành";

      default:
        return status;
    }
  };

  const handleReceiveCustomer = async () => {
    if (!selectedSession) return;

    await dispatch(startSession(selectedSession.id));
    await dispatch(fetchMySessions());
    await dispatch(fetchSessionDetail(selectedSession.id));
    setStepStartedAt(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="flex gap-6">
        {/* ================= LEFT ================= */}
        <div className="w-[28%] rounded-3xl border bg-white p-4 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Danh sách khách hàng</h2>

            <p className="text-sm text-gray-500 mt-1">
              Các ca đang chờ thực hiện
            </p>
          </div>

          <div className="space-y-3 max-h-[78vh] overflow-auto pr-1">
            {assignedSessions.map((s: any) => (
              <div
                key={s.id}
                onClick={() => dispatch(fetchSessionDetail(s.id))}
                className={`cursor-pointer rounded-2xl border p-4 transition hover:bg-gray-50 ${
                  selectedSession?.id === s.id
                    ? "border-amber-500 bg-amber-50"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{s.customer_name}</p>

                    <p className="text-xs text-gray-500">{s.phone}</p>

                    <p className="text-xs text-gray-400 mt-1">
                      {s.service_name}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${getStatusColor(
                      s.status,
                    )}`}
                  >
                    {getStatusText(s.status)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Buổi điều trị</p>

                    <p className="font-semibold text-sm">Buổi {s.session_no}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ngày làm</p>

                    <p className="font-medium text-sm">
                      {new Date(s.service_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {assignedSessions.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-10">
                Chưa có khách hàng nào
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="w-[72%] rounded-3xl border bg-white p-6 shadow-sm">
          {!selectedSession ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Chọn khách hàng để bắt đầu dịch vụ
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Thực hiện dịch vụ</h1>

                  <p className="text-sm text-gray-600 mt-2 border-b-2 border-black border-opacity-40">
                    {selectedSession.customer_name} • {selectedSession.phone}
                  </p>
                </div>

                {/* ACTION BUTTON */}
                <div>
                  {selectedSession.status === "assigned" ? (
                    <button
                      onClick={handleReceiveCustomer}
                      className="px-5 py-2 rounded-2xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition"
                    >
                      Nhận khách
                    </button>
                  ) : selectedSession.status === "in_progress" ? (
                    <button
                      onClick={handleCompleteSession}
                      className="px-5 py-2 rounded-2xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                    >
                      Hoàn thành
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-5 py-2 rounded-2xl bg-gray-200 text-gray-500"
                    >
                      Đã hoàn thành
                    </button>
                  )}
                </div>
              </div>

              {/* SESSION INFO */}
              <div className="rounded-2xl border overflow-hidden mb-6">
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {selectedSession.service_name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Buổi {selectedSession.session_no} /{" "}
                      {selectedSession.total_sessions}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${getStatusColor(
                      selectedSession.status,
                    )}`}
                  >
                    {getStatusText(selectedSession.status)}
                  </span>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Ngày điều trị</p>

                      <p className="font-medium mt-1">
                        {new Date(
                          selectedSession.service_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Gói liệu trình</p>

                      <p className="font-medium mt-1">
                        {selectedSession.package_name || "Điều trị cơ bản"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Tiến độ</p>

                      <p className="font-medium mt-1">
                        {Math.round(
                          ((activeStepIndex + progressPercent / 100) /
                            Math.max(steps.length, 1)) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-5">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{
                          width: `${
                            ((activeStepIndex + progressPercent / 100) /
                              Math.max(steps.length, 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEPS */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Các bước liệu trình</h3>

                  <p className="text-sm text-black font-bold pr-3">
                    {steps.length} bước
                  </p>
                </div>

                <div className="space-y-4">
                  {steps.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      Chưa có bước liệu trình
                    </div>
                  ) : (
                    steps.map((step: any, index: number) => {
                      const isActive = index === activeStepIndex;

                      const isDone = index < activeStepIndex;

                      return (
                        <motion.div
                          key={step.step_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`rounded-3xl border p-5 transition-all duration-300 ${
                            isActive
                              ? "border-amber-400 bg-amber-50 shadow-lg"
                              : isDone
                                ? "bg-green-50 border-green-200"
                                : "bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-6">
                            {/* LEFT */}
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    isDone
                                      ? "bg-green-500 text-white"
                                      : isActive
                                        ? "bg-amber-500 text-white"
                                        : "bg-gray-200"
                                  }`}
                                >
                                  {index + 1}
                                </div>

                                <div>
                                  <p className="font-bold text-lg">
                                    {step.step_name}
                                  </p>

                                  <p className="text-sm text-gray-500 mt-1">
                                    {step.duration_minutes} phút
                                  </p>
                                </div>
                              </div>

                              {/* instruction */}
                              {step.instruction && (
                                <div className="mt-4 ml-14 text-sm text-gray-600">
                                  {step.instruction}
                                </div>
                              )}

                              {/* products */}
                              <div className="mt-3 ml-14">
                                <p className="text-xs text-gray-500 mb-2">
                                  Sản phẩm sử dụng
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(step.products) &&
                                    step.products.map((p: any, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1.5 rounded-full bg-white border text-sm shadow-sm"
                                      >
                                        {p.product_name}

                                        {p.quantity
                                          ? ` • SL: ${p.quantity}`
                                          : ""}

                                        {p.usage_note
                                          ? ` • ${p.usage_note}`
                                          : ""}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>

                            {/* TIMER */}
                            <div className="w-[120px] flex flex-col items-center">
                              <div className="w-[90px] h-[90px]">
                                <CircularProgressbar
                                  value={
                                    isDone
                                      ? 100
                                      : isActive
                                        ? progressPercent
                                        : 0
                                  }
                                  text={
                                    isDone
                                      ? "✓"
                                      : isActive
                                        ? `${Math.floor(
                                            (totalDurationSeconds -
                                              elapsedSeconds) /
                                              60,
                                          )}:${String(
                                            (totalDurationSeconds -
                                              elapsedSeconds) %
                                              60,
                                          ).padStart(2, "0")}`
                                        : `${step.duration_minutes}:00`
                                  }
                                  styles={buildStyles({
                                    pathColor: isDone ? "#22c55e" : "#f59e0b",

                                    textColor: "#111827",

                                    trailColor: "#f3f4f6",

                                    strokeLinecap: "round",
                                  })}
                                />
                              </div>

                              <p className="text-xs mt-3 font-medium">
                                {isDone
                                  ? "Hoàn thành"
                                  : isActive
                                    ? "Đang thực hiện"
                                    : "Đang chờ"}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
