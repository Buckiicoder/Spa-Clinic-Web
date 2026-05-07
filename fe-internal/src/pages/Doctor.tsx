import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../app/hook";
import Toast from "../components/Toast";
import {
  fetchWaitingConsultations,
  fetchConsultationDetail,
  startConsultation,
  completeConsultation,
  updateConsultation,
  selectWaitingConsultations,
  selectConsultationDetail,
  createProfileFromConsultation,
  createSession,
} from "../features/doctor/doctorSlice";
import {
  fetchServices,
  selectServices,
} from "../features/service/serviceSlice";
import { selectUser } from "../features/auth/authSlice";

export default function DoctorExamination() {
  const dispatch = useAppDispatch();

  const waitingList = useAppSelector(selectWaitingConsultations);
  const services = useAppSelector(selectServices);
  const booking = useAppSelector(selectConsultationDetail);
  const user = useAppSelector(selectUser);
  const [packageSearch, setPackageSearch] = useState("");
  const [tab, setTab] = useState<"waiting" | "done">("waiting");
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  /*
[
  {
    id,
    service_id,
    total_sessions,
    sessions: [
      { session_no: 1, date: "" },
      { session_no: 2, date: "" }
    ]
  }
]
*/
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const socketRef = useRef<any>(null);

  const [form, setForm] = useState({
    diagnosis: "",
    consultation_note: "",
    recommended_package_id: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    dispatch(fetchWaitingConsultations());
  }, []);

  useEffect(() => {
    dispatch(fetchServices());
  }, []);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    const socket = socketRef.current;

    socket.emit("join-doctor");

    socket.on("consultation:updated", () => {
      dispatch(fetchWaitingConsultations());
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (booking) {
      setForm({
        diagnosis: booking.diagnosis || "",
        consultation_note: booking.consultation_note || "",
        recommended_package_id: booking.recommended_package_id || "",
      });
    }
  }, [booking]);

  const handleSelect = (id: number) => {
    dispatch(fetchConsultationDetail(id));
  };

  const handleStart = () => {
    if (!booking) return;
    dispatch(startConsultation(booking.id));
  };

  const handleSave = () => {
    if (!booking) return;

    dispatch(
      updateConsultation({
        id: booking.id,
        data: form,
      }),
    );
  };

  const handleComplete = async () => {
    if (!booking) return;

    try {
      if (selectedPackages.length > 0) {
        await Promise.all(
          selectedPackages.map(async (pkg) => {
            // 🔥 validate chỉ buổi 1
            if (!pkg.session1_date) {
              throw new Error(`Chưa chọn ngày buổi 1 (${pkg.name})`);
            }

            // 🔥 1. CREATE PROFILE
            const res = await dispatch(
              createProfileFromConsultation({
                bookingId: booking.id,
                data: {
                  customer_id: booking.customer_id,
                  service_id: pkg.service_id,
                  package_id: pkg.id,
                  doctor_id: user.id,
                  total_sessions: pkg.total_sessions,
                  note: form.consultation_note || null,
                },
              }),
            ).unwrap();

            const profileId = res.id;

            // 🔥 2. CREATE SESSION 1 (bắt buộc)
            await dispatch(
              createSession({
                profile_id: profileId,
                session_no: 1,
                service_date: pkg.session1_date,
                status: "scheduled",
                booking_id: booking.id,
              }),
            );

            // 🔥 3. CREATE SESSION 2 (optional)
            if (pkg.session2_date) {
              await dispatch(
                createSession({
                  profile_id: profileId,
                  session_no: 2,
                  service_date: pkg.session2_date,
                  status: "scheduled",
                  booking_id: booking.id,
                }),
              );
            }
          }),
        );

        setToast({
          type: "success",
          message: "Tạo liệu trình & lịch hẹn thành công",
        });
      }

      dispatch(completeConsultation(booking.id));
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="flex gap-6">
        {/* ================= LEFT ================= */}
        <div className="w-[25%] rounded-3xl border bg-white p-4 shadow-sm">
          <div className="flex mb-4 border-b">
            <button
              onClick={() => setTab("waiting")}
              className={`flex-1 py-2 text-sm ${
                tab === "waiting"
                  ? "border-b-2 border-amber-500 font-medium"
                  : ""
              }`}
            >
              Bệnh nhân chờ
            </button>

            <button
              onClick={() => setTab("done")}
              className={`flex-1 py-2 text-sm ${
                tab === "done" ? "border-b-2 border-amber-500 font-medium " : ""
              }`}
            >
              Đã tư vấn hôm nay
            </button>
          </div>

          <div className="space-y-2">
            {waitingList.map((b: any) => (
              <div
                key={b.id}
                onClick={() => handleSelect(b.id)}
                className={`cursor-pointer rounded-xl border p-3 transition hover:bg-amber-50 ${
                  booking?.id === b.id ? "border-amber-500" : ""
                }`}
              >
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-gray-500">{b.phone}</p>
                <p className="text-xs text-gray-400">{b.service_name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="w-[75%] rounded-3xl border bg-white p-6 shadow-sm">
          {!booking ? (
            <div className="text-center text-gray-400 py-10">
              Chọn bệnh nhân để bắt đầu tư vấn
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">Tư vấn - {booking.name}</h1>

                <div className="flex gap-2">
                  {booking.status === "CHECKED_IN" && (
                    <button
                      onClick={handleStart}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                    >
                      Nhận khách
                    </button>
                  )}

                  {booking.status === "IN_CONSULTATION" && (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-amber-600 text-white rounded-xl"
                      >
                        Lưu
                      </button>

                      <button
                        onClick={handleComplete}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl"
                      >
                        Hoàn thành
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500">SĐT</p>
                  <p className="font-medium">{booking.phone}</p>
                </div>

                <div>
                  <p className="text-gray-500">Dịch vụ</p>
                  <p className="font-medium">{booking.service_name}</p>
                </div>

                <div>
                  <p className="text-gray-500">Thời gian</p>
                  <p className="font-medium">{booking.booking_time}</p>
                </div>

                <div>
                  <p className="text-gray-500">Tổng lượt khám</p>
                  <p className="font-medium">{booking.total_visit || 0}</p>
                </div>

                <div>
                  <p className="text-gray-500">Lần khám gần nhất</p>
                  <p className="font-medium">
                    {booking.last_visit_at
                      ? new Date(booking.last_visit_at).toLocaleDateString()
                      : "Chưa có"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border bg-yellow-50">
                  <p className="text-sm text-gray-500 mb-1">
                    Ghi chú khách hàng
                  </p>
                  <p className="text-sm font-medium">
                    {booking.customer_note || "Không có"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border bg-blue-50">
                  <p className="text-sm text-gray-500 mb-1">Ghi chú đặt lịch</p>
                  <p className="text-sm font-medium">
                    {booking.booking_note || "Không có"}
                  </p>
                </div>
              </div>

              {/* FORM */}
              <div className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Chẩn đoán</label>
                    <textarea
                      value={form.diagnosis}
                      onChange={(e) =>
                        setForm({ ...form, diagnosis: e.target.value })
                      }
                      className="w-full border rounded-xl p-3"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Ghi chú tư vấn
                    </label>
                    <textarea
                      value={form.consultation_note}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          consultation_note: e.target.value,
                        })
                      }
                      className="w-full border rounded-xl p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Tìm gói liệu trình
                  </label>

                  <input
                    value={packageSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPackageSearch(value);

                      const results: any[] = [];

                      services.forEach((s: any) => {
                        s.packages?.forEach((p: any) => {
                          if (
                            p.name.toLowerCase().includes(value.toLowerCase())
                          ) {
                            results.push({
                              ...p,
                              service_id: s.id,
                              service_name: s.name,
                            });
                          }
                        });
                      });

                      setSearchResults(results.slice(0, 5));
                    }}
                    className="w-full border rounded-xl p-3"
                    placeholder="Tìm gói..."
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-3 border rounded-xl overflow-hidden">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPackages((prev) => {
                            if (prev.find((x) => x.id === p.id)) return prev;

                            const sessions = Array.from(
                              { length: p.total_sessions },
                              (_, i) => ({
                                session_no: i + 1,
                                date: "",
                              }),
                            );

                            return [
                              ...prev,
                              {
                                ...p,
                                session1_date: "",
                                session2_date: "",
                              },
                            ];
                          });
                        }}
                        className="flex justify-between p-3 hover:bg-gray-50 cursor-pointer border-b"
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-gray-500">
                            {p.service_name}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm">{p.price}đ</p>
                          <p className="text-xs text-gray-500">
                            {p.total_sessions} buổi
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Gói đã chọn</h3>

                  <div className="border rounded-xl">
                    {selectedPackages.length === 0 && (
                      <p className="p-3 text-sm text-gray-400">
                        Chưa chọn gói nào
                      </p>
                    )}

                    {selectedPackages.map((p) => (
                      <div key={p.id} className="border-b p-3">
                        {/* HEADER */}
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-gray-500">
                              {p.service_name}
                            </p>
                          </div>

                          <div className="text-right">
                            <p>{p.price}đ</p>
                            <p className="text-xs text-gray-500">
                              {p.total_sessions} buổi
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedPackages((prev) =>
                                prev.filter((x) => x.id !== p.id),
                              )
                            }
                            className="text-red-500 text-sm ml-3"
                          >
                            Xóa
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-4">
                          {/* Buổi 1 */}
                          <div>
                            <p className="text-xs mb-1">Buổi 1 (bắt buộc)</p>
                            <input
                              type="date"
                              value={p.session1_date || ""}
                              onChange={(e) => {
                                const value = e.target.value;

                                setSelectedPackages((prev) =>
                                  prev.map((pkg) =>
                                    pkg.id === p.id
                                      ? { ...pkg, session1_date: value }
                                      : pkg,
                                  ),
                                );
                              }}
                              className="border rounded px-2 py-1 w-full"
                            />
                          </div>

                          {/* Buổi 2 */}
                          <div>
                            <p className="text-xs mb-1">Buổi 2 (tuỳ chọn)</p>
                            <input
                              type="date"
                              value={p.session2_date || ""}
                              onChange={(e) => {
                                const value = e.target.value;

                                setSelectedPackages((prev) =>
                                  prev.map((pkg) =>
                                    pkg.id === p.id
                                      ? { ...pkg, session2_date: value }
                                      : pkg,
                                  ),
                                );
                              }}
                              className="border rounded px-2 py-1 w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {toast && (
                <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
