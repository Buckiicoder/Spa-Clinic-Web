import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import Toast from "../components/Toast";
import { socket } from "../services/socket";
import { formatTimeForInput } from "../utils/generalFunction";
import {
  fetchConsultedToday,
  fetchTechnicians,
  assignTechnician,
  selectConsultedToday,
  selectTechnicians,
} from "../features/technician/technicianSlice";
import { io } from "socket.io-client";

export default function ManagerAssign() {
  const dispatch = useAppDispatch();

  const consultedToday = useAppSelector(selectConsultedToday);
  const technicians = useAppSelector(selectTechnicians);

  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const [toast, setToast] = useState<any>(null);
  const socketRef = useRef<any>(null);

  const [tab, setTab] = useState<
    "waiting_assign" | "assigned" | "working" | "completed"
  >("waiting_assign");

  useEffect(() => {
    dispatch(fetchConsultedToday());
    dispatch(fetchTechnicians());
  }, [dispatch]);

  useEffect(() => {
    socket.connect();

    // 🔥 join manager room
    socket.emit("join-manager");

    // 🔥 realtime khi có thay đổi session
    socket.on("session:updated", async () => {
      const updatedBookings = await dispatch(fetchConsultedToday()).unwrap();

      await dispatch(fetchTechnicians());

      // 🔥 update selected booking realtime
      if (selectedBooking) {
        const fresh = updatedBookings.find(
          (x: any) => x.session_id === selectedBooking.session_id,
        );

        setSelectedBooking(fresh || null);
      }
    });

    // 🔥 realtime khi manager khác assign
    socket.on("session:assigned", async () => {
      const updatedBookings = await dispatch(fetchConsultedToday()).unwrap();

      await dispatch(fetchTechnicians());

      if (selectedBooking) {
        const fresh = updatedBookings.find(
          (x: any) => x.session_id === selectedBooking.session_id,
        );

        setSelectedBooking(fresh || null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedBooking]);

  const waitingBookings = useMemo(() => {
    return consultedToday.filter(
      (b: any) => !b.technician_id && ["scheduled"].includes(b.status),
    );
  }, [consultedToday]);

  const assignedBookings = useMemo(() => {
    return consultedToday.filter(
      (b: any) => b.technician_id && ["assigned"].includes(b.status),
    );
  }, [consultedToday]);

  const workingBookings = useMemo(() => {
    return consultedToday.filter(
      (b: any) =>
        b.technician_id &&
        ["in_progress", "paused", "transfer_pending"].includes(b.status),
    );
  }, [consultedToday]);

  const completedBookings = useMemo(() => {
    return consultedToday.filter((b: any) =>
      ["done", "partial_done"].includes(b.status),
    );
  }, [consultedToday]);

  const displayBookings =
    tab === "waiting_assign"
      ? waitingBookings
      : tab === "assigned"
        ? assignedBookings
        : tab === "working"
          ? workingBookings
          : completedBookings;

  const handleAssign = async (sessionId: number, technicianId: number) => {
    try {
      await dispatch(
        assignTechnician({
          session_id: sessionId,
          technician_id: technicianId,
        }),
      ).unwrap();

      // 🔥 reload data mới
      const updatedBookings = await dispatch(fetchConsultedToday()).unwrap();

      await dispatch(fetchTechnicians());

      // 🔥 update selected booking realtime
      const updatedBooking = updatedBookings.find(
        (x: any) => x.session_id === selectedBooking?.session_id,
      );

      if (updatedBooking) {
        setSelectedBooking(updatedBooking);
      }

      setToast({
        type: "success",
        message: "Đã gán kỹ thuật viên",
      });
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Gán thất bại",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-amber-100 text-amber-700";

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
      case "scheduled":
        return "Chờ phân ca";

      case "assigned":
        return "Đã phân KTV";

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

  const getAvailableTechnicians = (currentSession: any) => {
    return technicians.filter((t: any) => {
      // 🔥 giữ technician hiện tại
      if (t.id === currentSession.technician_id) {
        return true;
      }

      // 🔥 technician đang có session khác
      const isBusy = consultedToday.some(
        (session: any) =>
          session.technician_id === t.id &&
          session.session_id !== currentSession.session_id &&
          ["assigned", "in_progress", "paused", "transfer_pending"].includes(
            session.status,
          ),
      );

      return !isBusy;
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="flex gap-6">
        {/* ================= LEFT ================= */}
        <div className="w-[28%] rounded-3xl border bg-white p-4 shadow-sm">
          {/* TAB */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => setTab("waiting_assign")}
              className={`flex-1 py-2 text-sm transition ${
                tab === "waiting_assign"
                  ? "border-b-2 border-amber-500 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Chờ phân ca
            </button>

            <button
              onClick={() => setTab("assigned")}
              className={`flex-1 py-2 text-sm transition ${
                tab === "assigned"
                  ? "border-b-2 border-blue-500 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Đã phân
            </button>

            <button
              onClick={() => setTab("working")}
              className={`flex-1 py-2 text-sm transition ${
                tab === "working"
                  ? "border-b-2 border-green-500 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Đang làm
            </button>

            <button
              onClick={() => setTab("completed")}
              className={`flex-1 py-2 text-sm transition ${
                tab === "completed"
                  ? "border-b-2 border-gray-700 font-semibold"
                  : "text-gray-500"
              }`}
            >
              Hoàn thành
            </button>
          </div>

          {/* LIST */}
          <div className="space-y-3 max-h-[75vh] overflow-auto pr-1">
            {displayBookings.map((b: any) => {
              const totalSessions = b.total_sessions || 0;

              const assignedSessions = b.technician_id ? 1 : 0;

              return (
                <div
                  key={`${b.booking_id}-${b.session_id}`}
                  onClick={() => {
                    const freshBooking = displayBookings.find(
                      (x: any) => x.booking_id === b.booking_id,
                    );

                    setSelectedBooking(freshBooking);
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition hover:bg-gray-50 ${
                    selectedBooking?.booking_id === b.booking_id
                      ? "border-amber-500 bg-amber-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{b.name}</p>

                      <p className="text-xs text-gray-500">{b.phone}</p>

                      <p className="text-xs text-gray-400 mt-1">
                        {b.service_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Buổi</p>

                      <p className="text-sm font-semibold">
                        {assignedSessions}/{totalSessions}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {b.booking_time}
                    </span>

                    <span
                      className={`text-[11px] px-2 py-1 rounded-full ${getStatusColor(
                        b.status,
                      )}`}
                    >
                      {getStatusText(b.status)}
                    </span>
                  </div>
                </div>
              );
            })}

            {displayBookings.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-10">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="w-[72%] rounded-3xl border bg-white p-6 shadow-sm">
          {!selectedBooking ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Chọn khách hàng để quản lý phân ca
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Điều phối dịch vụ</h1>

                  <p className="text-sm text-gray-600 mt-2 border-b-2 border-black border-opacity-40">
                    {selectedBooking.name} • {selectedBooking.phone}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Dịch vụ</p>

                  <p className="font-semibold">
                    {selectedBooking.service_name}
                  </p>
                </div>
              </div>

              {/* CUSTOMER INFO */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="rounded-2xl border p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Buổi hiện tại</p>

                  <p className="font-semibold text-sm">
                    {`${selectedBooking.session_no}/${selectedBooking.total_sessions}`}
                  </p>
                </div>

                <div className="rounded-2xl border p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Trạng thái</p>

                  <p className="font-semibold text-sm">
                    {selectedBooking.status}
                  </p>
                </div>

                <div className="rounded-2xl border p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Giờ bắt đầu làm</p>

                  <p className="font-semibold text-sm">
                    {formatTimeForInput(selectedBooking.started_at) || 0}
                  </p>
                </div>

                <div className="rounded-2xl border p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Ghi chú</p>

                  <p className="font-semibold text-sm">
                    {selectedBooking.diagnosis || "Không có"}
                  </p>
                </div>
              </div>

              {/* PROFILES */}
              <div className="rounded-2xl border overflow-hidden">
                {/* HEADER */}
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {selectedBooking.service_name} -{" "}
                      {selectedBooking.package_name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Tổng liệu trình: {selectedBooking.total_sessions} buổi
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Đã sử dụng</p>

                    <p className="font-semibold">
                      {selectedBooking.used_sessions || 0}/
                      {selectedBooking.total_sessions}
                    </p>
                  </div>
                </div>

                {/* SESSION */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    {/* LEFT */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          Buổi {selectedBooking.session_no}
                        </p>

                        <span
                          className={`text-[11px] px-2 py-1 rounded-full ${getStatusColor(
                            selectedBooking.status,
                          )}`}
                        >
                          {getStatusText(selectedBooking.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Ngày làm</p>

                          <p className="font-medium">
                            {new Date(
                              selectedBooking.service_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">KTV phụ trách</p>

                          <p className="font-medium">
                            {selectedBooking.technician_name || "Chưa phân"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Step hiện tại</p>

                          <p className="font-medium">
                            {selectedBooking.current_step_name ||
                              "Chưa bắt đầu"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Step {selectedBooking.tracking_step_no || 0}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500">Còn lại</p>

                          <p className="font-medium">
                            {selectedBooking.remaining_seconds
                              ? `${Math.floor(
                                  selectedBooking.remaining_seconds / 60,
                                )} phút`
                              : "--"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="w-[240px]">
                      <select
                        value={selectedBooking.technician_id || ""}
                        onChange={(e) =>
                          handleAssign(
                            Number(selectedBooking.session_id),
                            Number(e.target.value),
                          )
                        }
                        disabled={["done", "partial_done"].includes(
                          selectedBooking.status,
                        )}
                        className="w-full border rounded-xl px-3 py-2 text-sm"
                      >
                        <option value="">Chọn kỹ thuật viên</option>

                        {getAvailableTechnicians(selectedBooking).map(
                          (t: any) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Tiến độ session</span>

                      <span>
                        {selectedBooking.completed_steps || 0}/
                        {selectedBooking.total_steps || 0}
                        {" • "}
                        {selectedBooking.progress_percent || 0}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all"
                        style={{
                          width: `${selectedBooking.progress_percent || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
  <span className="pl-4 pb-2">
    {selectedBooking.current_tracking_status ||
      "Waiting"}
  </span>

  <span className="pr-4 pb-3">
    Tạm dừng:{" "}
    {selectedBooking.current_step_pause_count || 0}
  </span>
</div>
              </div>

              {/* TECHNICIAN LIST */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Nhân viên hôm nay</h3>

                  <p className="text-sm text-gray-500">
                    {technicians.length} nhân viên
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {technicians.map((t: any) => (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-black p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {t.id} - {t.name}
                          </p>

                          {/* <p className="text-xs text-gray-500 mt-0">
                            {t.phone}
                          </p> */}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full ${
                            t.is_busy
                              ? "bg-red-500 text-red-500"
                              : "bg-green-500 text-green-500"
                          }`}
                        ></div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs text-gray-500">Trạng thái</p>

                        <p
                          className={`text-sm font-medium mt-1 ${
                            t.is_busy ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          {t.is_busy
                            ? "Đang phục vụ khách"
                            : "Sẵn sàng nhận ca"}
                        </p>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        Session hiện tại:
                      </div>

                      <p className="text-sm mt-1 font-medium">
                        {t.current_customer_name || "Chưa có"}
                      </p>
                    </div>
                  ))}
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
    </div>
  );
}
