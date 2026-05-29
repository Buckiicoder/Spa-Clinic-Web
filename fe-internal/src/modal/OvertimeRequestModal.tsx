import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
// import { formatTimeForInput } from "../utils/generalFunction";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;

  timekeepingId: number;
  workDate: string;
  defaultStartTime?: string;

  mode?: "employee" | "manager";

  employeeCode?: string | number;

  employeeName?: string;

  overtimeRequest?: any;

  onApprove?: () => Promise<void>;

  onReject?: () => Promise<void>;
}

export default function OvertimeRequestModal({
  open,
  onClose,
  onSubmit,

  loading = false,

  mode = "employee",

  timekeepingId,
  workDate,
  defaultStartTime,

  employeeCode,
  employeeName,

  overtimeRequest,

  onApprove,
  onReject,
}: Props) {
  //test dữ liệu vào
  console.log("overtimeRequest", overtimeRequest);

  const [requestedStartTime, setRequestedStartTime] = useState("");
  const [requestedEndTime, setRequestedEndTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;

    if (mode === "employee") {
      setRequestedStartTime(defaultStartTime || "");

      setRequestedEndTime("");

      setReason("");

      return;
    }

    if (overtimeRequest) {
      const extractTime = (value?: string | null) => {
        if (!value) return "";

        // yyyy-mm-ddTHH:mm:ss
        if (value.includes("T")) {
          return value.slice(11, 16);
        }

        // fallback cho trường hợp chỉ có HH:mm:ss
        return value.slice(0, 5);
      };

      setRequestedStartTime(extractTime(overtimeRequest.requested_start_time));

      setRequestedEndTime(extractTime(overtimeRequest.requested_end_time));

      setReason(overtimeRequest.reason || "");
    }
  }, [open, mode, overtimeRequest, defaultStartTime]);

  const requestedMinutes = useMemo(() => {
    if (mode === "manager") {
      return Number(overtimeRequest?.requested_minutes || 0);
    }

    if (!requestedStartTime || !requestedEndTime) {
      return 0;
    }

    const [startHour, startMinute] = requestedStartTime.split(":").map(Number);

    const [endHour, endMinute] = requestedEndTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const diff = endMinutes - startMinutes;

    return diff > 0 ? diff : 0;
  }, [requestedStartTime, requestedEndTime, overtimeRequest, mode]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!requestedStartTime || !requestedEndTime) {
      alert("Vui lòng chọn thời gian OT");
      return;
    }

    if (requestedMinutes <= 0) {
      alert("Thời gian OT không hợp lệ");
      return;
    }

    await onSubmit({
      timekeeping_id: timekeepingId,
      work_date: workDate,
      requested_start_time: requestedStartTime,
      requested_end_time: requestedEndTime,
      requested_minutes: requestedMinutes,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gửi yêu cầu OT</h2>

            <p className="mt-1 text-sm text-gray-500">
              Tạo yêu cầu tăng ca cho ca làm hiện tại
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Ngày làm việc
              </label>

              <input
                value={overtimeRequest?.work_date || workDate || ""}
                disabled
                className="h-11 w-full rounded-2xl border bg-gray-100 px-4 text-sm outline-none"
              />
            </div>

            {mode === "manager" && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Mã nhân viên
                  </label>

                  <input
                    value={employeeCode || ""}
                    disabled
                    className="h-11 w-full rounded-2xl border bg-gray-100 px-4 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tên nhân viên
                  </label>

                  <input
                    value={employeeName || ""}
                    disabled
                    className="h-11 w-full rounded-2xl border bg-gray-100 px-4 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tổng OT
              </label>

              <input
                value={`${requestedMinutes} phút`}
                disabled
                className="h-11 w-full rounded-2xl border bg-gray-100 px-4 text-sm font-semibold text-violet-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Giờ bắt đầu OT
              </label>

              <input
                type="time"
                value={requestedStartTime}
                disabled={mode === "manager"}
                onChange={(e) => setRequestedStartTime(e.target.value)}
                className="h-11 w-full rounded-2xl border px-4 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Giờ kết thúc OT
              </label>

              <input
                type="time"
                value={requestedEndTime}
                disabled={mode === "manager"}
                onChange={(e) => setRequestedEndTime(e.target.value)}
                className="h-11 w-full rounded-2xl border px-4 text-sm outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Lý do OT
            </label>

            <textarea
              rows={4}
              value={reason}
              disabled={mode === "manager"}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do tăng ca..."
              className="w-full rounded-2xl border p-4 text-sm outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-5">
          <button
            onClick={onClose}
            className="rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:bg-gray-100"
          >
            Đóng
          </button>

          {mode === "employee" ? (
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          ) : (
            <>
              <button
                onClick={() => onReject?.()}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white"
              >
                Từ chối
              </button>

              <button
                onClick={() => onApprove?.()}
                className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Chấp thuận
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
