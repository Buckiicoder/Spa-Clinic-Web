import { useEffect, useMemo, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  fetchTimekeepingDailyView,
  selectTimekeepingDaily,
  selectTimekeepingDailyLoading,
  selectPendingOvertimeRequests,
  approveOvertimeRequest,
  rejectOvertimeRequest,
  fetchOvertimeRequests,
} from "../features/overtime/overtimeSlice";
import { selectUser } from "../features/auth/authSlice";
import { socket } from "../services/socket";
// import { io } from "socket.io-client";
// import { useRef } from "react";
import OvertimeRequestModal from "../modal/OvertimeRequestModal";
import { useSelector } from "react-redux";

export default function TimekeepingDaily() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // const socketRef = useRef<any>(null);

  const data = useAppSelector(selectTimekeepingDaily);
  const loading = useAppSelector(selectTimekeepingDailyLoading);

  const pendingOtRequests = useAppSelector(selectPendingOvertimeRequests);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("");
  const [shift, setShift] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [realtimeOtMap, setRealtimeOtMap] = useState<Record<number, any>>({});
  const pendingOtMap = useMemo(() => {
    const map: Record<number, any> = {};

    pendingOtRequests.forEach((request: any) => {
      map[request.timekeeping_id] = request;
    });

    return map;
  }, [pendingOtRequests]);
  const [selectedOT, setSelectedOT] = useState<any>(null);
  const [openOTModal, setOpenOTModal] = useState(false);

  console.log(selectedOT);

  useEffect(() => {
    dispatch(
      fetchTimekeepingDailyView({
        date,
        ...(status ? { status } : {}),
      }),
    );

    dispatch(
      fetchOvertimeRequests({
        status: "PENDING",
      }),
    );
  }, [dispatch, date, status]);

  useEffect(() => {
    socket.connect();

    socket.emit("join-manager");

    socket.on("overtime:created", (data: any) => {
      console.log("OT REALTIME:", data);

      setRealtimeOtMap((prev) => ({
        ...prev,

        [data.timekeeping_id]: data,
      }));

      dispatch(
        fetchTimekeepingDailyView({
          date,
          ...(status ? { status } : {}),
        }),
      );
      dispatch(
        fetchOvertimeRequests({
          status: "PENDING",
        }),
      );
    });

    socket.on("overtime:approved", () => {
      dispatch(
        fetchTimekeepingDailyView({
          date,
          ...(status ? { status } : {}),
        }),
      );
      dispatch(
        fetchOvertimeRequests({
          status: "PENDING",
        }),
      );
    });

    socket.on("overtime:rejected", () => {
      dispatch(
        fetchTimekeepingDailyView({
          date,
          ...(status ? { status } : {}),
        }),
      );
      dispatch(
        fetchOvertimeRequests({
          status: "PENDING",
        }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, date, status]);

  const filtered = useMemo(() => {
    return data
      .filter((item: any) => {
        const keyword = search.toLowerCase();

        const matchSearch =
          item.user_name?.toLowerCase().includes(keyword) ||
          String(item.user_id).includes(keyword);

        const matchShift = shift ? item.shift_id === Number(shift) : true;

        return matchSearch && matchShift;
      })
      .sort((a: any, b: any) => a.shift_id - b.shift_id);
  }, [data, search, shift]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / limit));

  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "WORKING":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "OFF":
        return "bg-gray-100 text-gray-600";
      case "BREAK":
        return "bg-yellow-100 text-yellow-700";
      case "SCHEDULED":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "SCHEDULED":
        return "Đã phân ca";
      case "WORKING":
        return "Đang làm việc";
      case "COMPLETED":
        return "Hoàn thành";
      case "OFF":
        return "Nghỉ";
      case "BREAK":
        return "Nghỉ giữa ca";
      default:
        return status;
    }
  };

  const handleOpenOT = (item: any) => {
    const pendingRequest =
      pendingOtMap[item.id] || realtimeOtMap[item.id] || null;

    setSelectedOT({
      ...item,

      overtime_request: pendingRequest,
    });

    setOpenOTModal(true);
  };

  const handleApproveOT = async () => {
    if (!selectedOT?.overtime_request) return;

    await dispatch(
      approveOvertimeRequest({
        id: selectedOT.overtime_request.id,

        data: {
          approved_by: Number(user.id),
          approved_minutes: selectedOT.overtime_request.requested_minutes,
        },
      }) as any,
    );

    setOpenOTModal(false);
  };

  const handleRejectOT = async () => {
    if (!selectedOT?.overtime_request) return;

    await dispatch(
      rejectOvertimeRequest({
        id: selectedOT.overtime_request.id,

        data: {
          approved_by: Number(user.id),
          reject_reason: "Không được duyệt",
        },
      }) as any,
    );

    setOpenOTModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-bold">Chấm công nhân viên</h1>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-xl border px-4 text-sm"
          />
        </div>

        {/* FILTER */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo mã / tên nhân viên"
              className="h-10 w-full rounded-xl border pl-10 text-sm"
            />
          </div>

          {/* status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border px-3 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SCHEDULED">Đã phân ca</option>

            <option value="WORKING">Đang làm việc</option>

            <option value="BREAK">Nghỉ giữa ca</option>

            <option value="COMPLETED">Hoàn thành</option>

            <option value="OFF">Nghỉ</option>
          </select>

          {/* shift */}
          <select
            value={shift}
            onChange={(e) => {
              setShift(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border px-3 text-sm"
          >
            <option value="">Tất cả ca</option>
            <option value="1">Ca sáng</option>
            <option value="3">Ca chiều</option>
            <option value="4">Ca tối</option>
            <option value="2">Fulltime</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">Mã NV</th>
                <th className="p-3">Tên nhân viên</th>
                <th className="p-3">Loại</th>
                <th className="p-3">Ca làm</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Checkin</th>
                <th className="p-3">Checkout</th>
                <th className="p-3">OT</th>
                <th className="p-3">Thông báo</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                paginated.map((item: any) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.user_id}</td>

                    <td className="p-3">{item.user_name}</td>

                    <td className="p-3">{item.employee_type}</td>

                    <td className="p-3">{item.shift_name}</td>

                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          item.status,
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    <td className="p-3">
                      {item.check_in_time
                        ? new Date(item.check_in_time).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="p-3">
                      {item.check_out_time
                        ? new Date(item.check_out_time).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="p-3">
                      {item.ot_minutes ? `${item.ot_minutes}m` : "-"}
                    </td>

                    {/* OT NOTIFICATION BUTTON */}
                    <td className="p-3">
                      <button
                        onClick={() => handleOpenOT(item)}
                        className="relative rounded-lg border p-2 transition hover:bg-gray-100"
                      >
                        <Bell size={16} />

                        {(pendingOtMap[item.id] || realtimeOtMap[item.id]) && (
                          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <div className="py-10 text-center text-gray-400">
              Đang tải dữ liệu...
            </div>
          )}

          {!loading && paginated.length === 0 && (
            <div className="py-10 text-center text-gray-400">
              Không có dữ liệu
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Tổng: {filtered.length} bản ghi
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Hiển thị</span>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span className="text-sm text-gray-500">dòng</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="rounded border p-2"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border p-2"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm">
              {page} / {totalPage}
            </span>

            <button
              disabled={page === totalPage}
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              className="rounded border p-2"
            >
              <ChevronRight size={16} />
            </button>

            <button
              disabled={page === totalPage}
              onClick={() => setPage(totalPage)}
              className="rounded border p-2"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <OvertimeRequestModal
        open={openOTModal}
        onClose={() => setOpenOTModal(false)}
        onSubmit={async () => {}}
        loading={loading}
        mode="manager"
        employeeCode={selectedOT?.user_id}
        employeeName={selectedOT?.user_name}
        overtimeRequest={selectedOT?.overtime_request}
        workDate={selectedOT?.work_date}
        timekeepingId={selectedOT?.id}
        onApprove={handleApproveOT}
        onReject={handleRejectOT}
      />
    </div>
  );
}
