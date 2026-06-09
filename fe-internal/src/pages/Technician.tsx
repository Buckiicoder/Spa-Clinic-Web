import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Toast from "../components/Toast";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { socket } from "../services/socket";
import {
  fetchMySessions,
  fetchSessionDetail,
  selectMySessions,
  selectSessionDetail,
} from "../features/technician/technicianSlice";

import {
  startTrackingSession,
  completeTrackingSession,
  completeStepTracking,
  pauseTrackingSession,
  resumeTrackingSession,
} from "../features/tracking/trackingSlice";

import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

export default function Technician() {
  const dispatch = useAppDispatch();
  const socketRef = useRef<any>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const sessions = useAppSelector(selectMySessions);

  const selectedSession = useAppSelector(selectSessionDetail);

  // giao diện ui cập nhật chạy dịch vụ KTV
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // const [stepStartedAt, setStepStartedAt] = useState<number | null>(null);
  const processingStepRef = useRef(false);

  const intervalRef = useRef<any>(null);

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [completeForm, setCompleteForm] = useState({
    skin_reaction: "",
  });
  const [tab, setTab] = useState<"assigned" | "completed">("assigned");

  useEffect(() => {
    dispatch(fetchMySessions());
  }, []);

  useEffect(() => {
    socket.connect();

    socket.emit("join-technician");

    socket.on("session:assigned", async () => {
      await dispatch(fetchMySessions());
    });

    socket.on("tracking:session_started", async () => {
      await dispatch(fetchMySessions());

      if (selectedSession?.id) {
        await dispatch(fetchSessionDetail(selectedSession.id));
      }
    });

    socket.on("tracking:step_completed", async () => {
      if (selectedSession?.id) {
        await dispatch(fetchSessionDetail(selectedSession.id));
      }
    });

    socket.on("tracking:paused", async () => {
      if (selectedSession?.id) {
        await dispatch(fetchSessionDetail(selectedSession.id));
      }
    });

    socket.on("tracking:resumed", async () => {
      if (selectedSession?.id) {
        await dispatch(fetchSessionDetail(selectedSession.id));
      }
    });

    socket.on("tracking:session_completed", async () => {
      await dispatch(fetchMySessions());

      if (selectedSession?.id) {
        await dispatch(fetchSessionDetail(selectedSession.id));
      }
    });

    socket.on("session:updated", async () => {
  await dispatch(fetchMySessions());

  if (selectedSession?.id) {
    await dispatch(
      fetchSessionDetail(selectedSession.id),
    );
  }
});

    return () => {
      socket.disconnect();
    };
  }, [dispatch, selectedSession?.id]);

  const assignedSessions = useMemo(() => {
  return sessions.filter((s: any) =>
    [
      "assigned",
      "in_progress",
      "paused",
      "transfer_pending",
    ].includes(s.status),
  );
}, [sessions]);

  const completedSessions = useMemo(() => {
  return sessions.filter((s: any) =>
    ["done", "partial_done"].includes(s.status),
  );
}, [sessions]);

  const displaySessions =
  tab === "assigned"
    ? assignedSessions
    : completedSessions;

  const handleCompleteSession = useCallback(async () => {
    if (!selectedSession) return;

    /**
     * 🔥 chưa hoàn thành hết step
     */
    const isNotFinished =
      selectedSession.current_step_no < selectedSession.total_steps;

    if (isNotFinished) {
      const confirmComplete = window.confirm(
        "Khách chưa hoàn thành toàn bộ quy trình dịch vụ.\n\nCác bước còn lại sẽ bị hủy bỏ.\n\nBạn có chắc muốn hoàn thành buổi dịch vụ ngay bây giờ?",
      );

      if (!confirmComplete) {
        return;
      }

      await dispatch(
        completeTrackingSession({
          id: selectedSession.id,
          data: {
            skin_reaction: "",
          },
        }),
      );

      await dispatch(fetchMySessions());

      await dispatch(fetchSessionDetail(selectedSession.id));

      return;
    }
    setShowCompleteModal(true);
  }, [dispatch, selectedSession]);

  const handleSubmitCompleteForm = async () => {
    if (!selectedSession) return;

    await dispatch(
      completeTrackingSession({
        id: selectedSession.id,
        data: completeForm,
      }),
    );

    setShowCompleteModal(false);

    setCompleteForm({
      skin_reaction: "",
    });

    await dispatch(fetchMySessions());

    await dispatch(fetchSessionDetail(selectedSession.id));
  };

  useEffect(() => {
    setActiveStepIndex(0);
    setElapsedSeconds(0);
    // setStepStartedAt(null);
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
    if (!selectedSession?.current_step_no) return;

    const index = steps.findIndex(
      (s: any) => s.step_no === selectedSession.current_step_no,
    );

    if (index >= 0) {
      setActiveStepIndex(index);
    }
  }, [selectedSession?.current_step_no, steps]);

  useEffect(() => {
    if (selectedSession?.status !== "in_progress" || !steps.length) {
      return;
    }

    if (!currentStep?.started_at) {
      return;
    }

    const startedTime = new Date(currentStep.started_at).getTime();

    // setStepStartedAt(startedTime);

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      const latestStep = steps[activeStepIndex];

      if (!latestStep) {
        clearInterval(intervalRef.current);
        return;
      }

      const durationSeconds = latestStep.duration_minutes * 60;

      const realElapsed = Math.floor((Date.now() - startedTime) / 1000);

      setElapsedSeconds(realElapsed);

      /**
       * 🔥 complete step
       */
      if (realElapsed >= durationSeconds && !processingStepRef.current) {
        processingStepRef.current = true;

        clearInterval(intervalRef.current);

        try {
          /**
           * 🔥 update backend tracking
           */
          await dispatch(
            completeStepTracking({
              id: selectedSession.id,
              current_step_no: latestStep.step_no,
            }),
          );

          //  reload realtime detail
          await dispatch(fetchSessionDetail(selectedSession.id));

          //  step cuối -> complete session
          if (activeStepIndex >= steps.length - 1) {
            await handleCompleteSession();
          }
        } finally {
          processingStepRef.current = false;
        }
      }
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [
    selectedSession?.status,
    selectedSession?.id,
    activeStepIndex,
    currentStep?.started_at,
    steps,
    dispatch,
    handleCompleteSession,
  ]);

  const getStatusColor = (status: string) => {
  switch (status) {
    case "assigned":
      return "bg-indigo-100 text-indigo-700";

    case "in_progress":
      return "bg-blue-100 text-blue-700";

    case "paused":
      return "bg-yellow-100 text-yellow-700";

    case "transfer_pending":
      return "bg-purple-100 text-purple-700";

    case "partial_done":
      return "bg-orange-100 text-orange-700";

    case "done":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

  const getStatusText = (status: string) => {
  switch (status) {
    case "assigned":
      return "Chờ tiếp nhận";

    case "in_progress":
      return "Đang thực hiện";

    case "paused":
      return "Tạm dừng";

    case "transfer_pending":
      return "Chờ chuyển ca";

    case "partial_done":
      return "Hoàn thành sớm";

    case "done":
      return "Đã hoàn thành";

    default:
      return status;
  }
};

  const handleReceiveCustomer = async () => {
    if (!selectedSession) return;

    await dispatch(startTrackingSession(selectedSession.id));
    await dispatch(fetchMySessions());
    await dispatch(fetchSessionDetail(selectedSession.id));
    // setStepStartedAt(Date.now());
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

          <div className="flex border-b mb-4">
  <button
    onClick={() => setTab("assigned")}
    className={`flex-1 py-2 text-sm transition ${
      tab === "assigned"
        ? "border-b-2 border-amber-500 font-semibold"
        : "text-gray-500"
    }`}
  >
    Đang chờ phục vụ
  </button>

  <button
    onClick={() => setTab("completed")}
    className={`flex-1 py-2 text-sm transition ${
      tab === "completed"
        ? "border-b-2 border-green-500 font-semibold"
        : "text-gray-500"
    }`}
  >
    Đã hoàn thành
  </button>
</div>

          <div className="space-y-3 max-h-[78vh] overflow-auto pr-1">
            {displaySessions.map((s: any) => (
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

            {displaySessions.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-10">
                {tab === "assigned"
  ? "Chưa có khách hàng đang chờ"
  : "Chưa có ca hoàn thành"}
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
                <div className="flex gap-3">
                  {selectedSession.status === "assigned" ? (
                    <button
                      onClick={handleReceiveCustomer}
                      className="px-5 py-2 rounded-2xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition"
                    >
                      Nhận khách
                    </button>
                  ) : selectedSession.status === "in_progress" ? (
                    <>
                      {selectedSession?.pause_count < 1 &&
                        selectedSession?.status === "in_progress" && (
                          <button
                            onClick={async () => {
                              try {
                                await dispatch(
                                  pauseTrackingSession(selectedSession.id),
                                ).unwrap();

                                setToast({
                                  message:
                                    "Đã tạm dừng dịch vụ. Thời gian tối đa 3 phút.",
                                  type: "success",
                                });

                                await dispatch(
                                  fetchSessionDetail(selectedSession.id),
                                );
                              } catch (err: any) {
                                setToast({
                                  message: err || "Không thể tạm dừng dịch vụ",
                                  type: "error",
                                });
                              }
                            }}
                            className="px-5 py-2 rounded-2xl bg-gray-500 text-white font-medium"
                          >
                            Tạm dừng
                          </button>
                        )}

                      <button
                        onClick={handleCompleteSession}
                        className="px-5 py-2 rounded-2xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                      >
                        Hoàn thành
                      </button>
                    </>
                  ) : selectedSession.status === "paused" ? (
                    <button
                      onClick={async () => {
                        try {
                          await dispatch(
                            resumeTrackingSession(selectedSession.id),
                          ).unwrap();

                          setToast({
                            message: "Đã tiếp tục dịch vụ",
                            type: "success",
                          });

                          await dispatch(
                            fetchSessionDetail(selectedSession.id),
                          );
                        } catch (err: any) {
                          setToast({
                            message: err || "Không thể tiếp tục dịch vụ",
                            type: "error",
                          });
                        }
                      }}
                      className="px-5 py-2 rounded-2xl bg-green-600 text-white font-medium"
                    >
                      Tiếp tục
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
                      const isActive =
                        step.step_no === selectedSession?.current_step_no;

                      const isDone = step.tracking_status === "completed";

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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-5">Hoàn thành dịch vụ</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phản ứng da
                </label>

                <textarea
                  value={completeForm.skin_reaction}
                  onChange={(e) =>
                    setCompleteForm((prev) => ({
                      ...prev,
                      skin_reaction: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full border rounded-2xl px-4 py-3"
                  placeholder="Ví dụ: Da hơi đỏ nhẹ sau treatment..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-5 py-2 rounded-2xl border"
              >
                Hủy
              </button>

              <button
                onClick={handleSubmitCompleteForm}
                className="px-5 py-2 rounded-2xl bg-green-600 text-white"
              >
                Lưu & Hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
