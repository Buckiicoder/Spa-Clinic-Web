import { useEffect, useState, useMemo } from "react";
// import { io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { socket } from "../services/socket";
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
  // fetchNextSessionInfo,
  selectNextSessionInfoByBooking,
  fetchNextSessionInfoByBooking,
  fetchReExaminationInfo,
  selectReExaminationInfo,
} from "../features/doctor/doctorSlice";

import {
  fetchServices,
  selectServices,
} from "../features/service/serviceSlice";
import { selectUser } from "../features/auth/authSlice";

export default function DoctorExamination() {
  const dispatch = useAppDispatch();

  const consultations = useAppSelector(selectWaitingConsultations);
  const services = useAppSelector(selectServices);
  const booking = useAppSelector(selectConsultationDetail);
  const canEdit = booking?.status === "IN_CONSULTATION";
  const user = useAppSelector(selectUser);
  const isFollowUp = !!booking?.profile_id;
  const nextSessionInfo = useAppSelector(selectNextSessionInfoByBooking);
  const reExamInfo = useAppSelector(selectReExaminationInfo);
  const [packageSearch, setPackageSearch] = useState("");
  const [tab, setTab] = useState<"waiting" | "done">("waiting");
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);

  const [searchResults, setSearchResults] = useState<any[]>([]);

  // const socketRef = useRef<any>(null);

  const [form, setForm] = useState({
    diagnosis: "",
    consultation_note: "",
    recommended_package_id: "",
  });

  const [errors, setErrors] = useState({
    diagnosis: "",
    consultation_note: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    dispatch(fetchWaitingConsultations());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    socket.connect();

    socket.emit("join-doctor");

    const handleBookingUpdated = (updatedBooking: any) => {
      dispatch(fetchWaitingConsultations());

      // nếu đang mở đúng booking này
      // thì reload detail luôn
      if (booking?.id === updatedBooking.id) {
        dispatch(fetchConsultationDetail(updatedBooking.id));
      }
    };

    socket.on("booking:updated", handleBookingUpdated);

    return () => {
      socket.off("booking:updated", handleBookingUpdated);
    };
  }, [dispatch, booking?.id]);

  useEffect(() => {
    if (booking) {
      setForm({
        diagnosis: booking.diagnosis || "",
        consultation_note: booking.consultation_note || "",
        recommended_package_id: booking.recommended_package_id || "",
      });
    }
  }, [booking]);

  useEffect(() => {
    if (!reExamInfo?.profile || !reExamInfo?.sessionInfo) {
      return;
    }

    setSelectedPackages([
      {
        id: Number(reExamInfo.profile.package_id),

        profile_id: Number(reExamInfo.profile.profile_id),

        name: reExamInfo.profile.package_name,

        service_id: reExamInfo.profile.service_id,

        service_name: reExamInfo.profile.service_name,

        total_sessions: reExamInfo.profile.total_sessions,

        price: reExamInfo.profile.price,

        next_session_no: reExamInfo.sessionInfo.next_session_no,

        current_session_no: reExamInfo.sessionInfo.current_session_no,

        remaining_sessions: reExamInfo.sessionInfo.remaining_sessions,
      },
    ]);
  }, [reExamInfo]);

  const waitingBookings = useMemo(() => {
    return consultations.filter((b: any) => b.status === "CHECKED_IN");
  }, [consultations]);

  const completedBookings = useMemo(() => {
    return consultations.filter((b: any) =>
      ["IN_CONSULTATION", "CONSULTED", "IN_TREATMENT", "COMPLETED"].includes(
        b.status,
      ),
    );
  }, [consultations]);

  const displayBookings =
    tab === "waiting" ? waitingBookings : completedBookings;

  const handleSelect = async (bookingId: number) => {
    setSelectedPackages([]);

    const detail = await dispatch(fetchConsultationDetail(bookingId)).unwrap();

    // khách tái khám
    if (detail?.profile_id) {
      await dispatch(fetchNextSessionInfoByBooking(bookingId));

      await dispatch(fetchReExaminationInfo(bookingId));
    }
  };

  const handleStart = () => {
    if (!booking) return;
    dispatch(startConsultation(booking.id));
  };

  const handleSave = () => {
    if (!canEdit) {
      setToast({
        type: "error",
        message: "Vui lòng nhận khách trước khi tư vấn",
      });
      return;
    }

    const newErrors = {
      diagnosis: "",
      consultation_note: "",
    };

    let hasError = false;

    if (!form.diagnosis?.trim()) {
      newErrors.diagnosis = "Vui lòng nhập chẩn đoán";
      hasError = true;
    }

    if (!form.consultation_note?.trim()) {
      newErrors.consultation_note = "Vui lòng nhập ghi chú tư vấn";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    if (!booking) return;

    dispatch(
      updateConsultation({
        id: booking.id,
        data: form,
      }),
    );
  };

  const handleComplete = async () => {
    if (!canEdit) {
      setToast({
        type: "error",
        message: "Vui lòng nhận khách trước khi hoàn thành tư vấn",
      });
      return;
    }

    if (!booking) return;

    try {
      if (selectedPackages.length > 0) {
        await Promise.all(
          selectedPackages.map(async (pkg) => {
            if (nextSessionInfo?.remaining_sessions <= 0) {
              throw new Error("Liệu trình đã hoàn tất");
            }

            if (pkg.profile_id) {
              if (!pkg.next_session_date) {
                throw new Error(`Chưa chọn ngày buổi ${pkg.next_session_no}`);
              }

              if (!pkg.next_session_time) {
                throw new Error(`Chưa chọn giờ buổi ${pkg.next_session_no}`);
              }

              await dispatch(
                createSession({
                  profile_id: pkg.profile_id,
                  session_no: nextSessionInfo?.next_session_no,
                  service_date: pkg.next_session_date,
                  service_time: pkg.next_session_time,
                }),
              ).unwrap();

              return;
            }

            // 🔥 validate chỉ buổi 1
            if (!pkg.session1_date) {
              throw new Error(`Chưa chọn ngày buổi 1 (${pkg.name})`);
            }

            if (!pkg.session1_time) {
              throw new Error(`Chưa chọn giờ buổi 1 (${pkg.name})`);
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

            const profileId = Number(res.id);

            // ============================
            // Xác định ngày hẹn tiếp theo
            // ============================

            await dispatch(
              createSession({
                profile_id: Number(profileId),
                session_no: 1,
                service_date: pkg.session1_date,
                service_time: pkg.session1_time,
              }),
            ).unwrap();

            if (pkg.session2_date && pkg.session2_time) {
              await dispatch(
                createSession({
                  profile_id: Number(profileId),
                  session_no: 2,
                  service_date: pkg.session2_date,
                  service_time: pkg.session2_time,
                }),
              ).unwrap();
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
            {displayBookings.map((b: any) => (
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

              {isFollowUp && reExamInfo && (
                <div className="mb-6 border rounded-xl p-4 bg-purple-50">
                  <h3 className="font-semibold mb-3">Thông tin tái khám</h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Chẩn đoán trước đó</p>

                      <p className="font-medium">
                        {reExamInfo.diagnosis || "Chưa có"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Ghi chú bác sĩ</p>

                      <p className="font-medium">
                        {reExamInfo.consultation_note || "Chưa có"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Gói liệu trình</p>

                      <p className="font-medium">{reExamInfo.package_name}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Tiến độ điều trị</p>

                      <p className="font-medium">
                        {reExamInfo.used_sessions}/{reExamInfo.total_sessions}
                        buổi
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Còn lại</p>

                      <p className="font-medium">
                        {nextSessionInfo?.remaining_sessions} buổi
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {booking.status === "CHECKED_IN" && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-700">
                    Vui lòng bấm <b>"Nhận khách"</b> trước khi nhập chẩn đoán,
                    ghi chú tư vấn hoặc tạo liệu trình.
                  </p>
                </div>
              )}

              {/* FORM */}
              <div className="space-y-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Chẩn đoán <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      disabled={!canEdit}
                      value={form.diagnosis}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          diagnosis: e.target.value,
                        });

                        if (errors.diagnosis) {
                          setErrors((prev) => ({
                            ...prev,
                            diagnosis: "",
                          }));
                        }
                      }}
                      className={`w-full rounded-xl p-3 border ${
                        errors.diagnosis ? "border-red-500" : "border-gray-300"
                      } ${
                        !canEdit
                          ? "bg-gray-100 cursor-not-allowed opacity-70"
                          : ""
                      }`}
                    />

                    {errors.diagnosis && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.diagnosis}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Ghi chú tư vấn <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      disabled={!canEdit}
                      value={form.consultation_note}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          consultation_note: e.target.value,
                        });

                        if (errors.consultation_note) {
                          setErrors((prev) => ({
                            ...prev,
                            consultation_note: "",
                          }));
                        }
                      }}
                      className={`w-full rounded-xl p-3 border ${
                        errors.consultation_note
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        !canEdit
                          ? "bg-gray-100 cursor-not-allowed opacity-70"
                          : ""
                      }`}
                    />

                    {errors.consultation_note && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.consultation_note}
                      </p>
                    )}
                  </div>
                </div>
                {!isFollowUp && (
                  <>
                    <div>
                      <label className="text-sm font-medium">
                        Tìm gói liệu trình
                      </label>

                      <input
                        disabled={!canEdit}
                        value={packageSearch}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPackageSearch(value);

                          const results: any[] = [];

                          services.forEach((s: any) => {
                            s.packages?.forEach((p: any) => {
                              if (
                                p.name
                                  .toLowerCase()
                                  .includes(value.toLowerCase())
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
                        className={`w-full border rounded-xl p-3" ${
                          !canEdit
                            ? "bg-gray-100 cursor-not-allowed opacity-70"
                            : ""
                        }`}
                        placeholder="Tìm gói..."
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-3 border rounded-xl overflow-hidden">
                        {searchResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              if (!canEdit) return;

                              setSelectedPackages((prev) => {
                                if (prev.find((x) => x.id === p.id))
                                  return prev;

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
                  </>
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
                            disabled={!canEdit || isFollowUp}
                            onClick={() =>
                              setSelectedPackages((prev) =>
                                prev.filter((x) => x.id !== p.id),
                              )
                            }
                            className={`text-sm ml-3 ${
                              canEdit
                                ? "text-red-500"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Xóa
                          </button>
                        </div>

                        {!isFollowUp ? (
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            {/* Buổi 1 */}
                            <div>
                              <p className="text-xs mb-1">Buổi 1 (bắt buộc)</p>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  disabled={!canEdit}
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
                                  className="border rounded px-2 py-1"
                                />

                                <input
                                  disabled={!canEdit}
                                  type="time"
                                  value={p.session1_time || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setSelectedPackages((prev) =>
                                      prev.map((pkg) =>
                                        pkg.id === p.id
                                          ? { ...pkg, session1_time: value }
                                          : pkg,
                                      ),
                                    );
                                  }}
                                  className="border rounded px-2 py-1"
                                />
                              </div>
                            </div>

                            {/* Buổi 2 */}
                            <div>
                              <p className="text-xs mb-1">Buổi 2 (tuỳ chọn)</p>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  disabled={!canEdit}
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
                                  className="border rounded px-2 py-1"
                                />

                                <input
                                  disabled={!canEdit}
                                  type="time"
                                  value={p.session2_time || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setSelectedPackages((prev) =>
                                      prev.map((pkg) =>
                                        pkg.id === p.id
                                          ? { ...pkg, session2_time: value }
                                          : pkg,
                                      ),
                                    );
                                  }}
                                  className="border rounded px-2 py-1"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {(nextSessionInfo?.remaining_sessions ?? 0) <= 0 ? (
                              <div className="text-green-600 text-sm">
                                Đã hoàn thành toàn bộ liệu trình
                              </div>
                            ) : (
                              <div className="mt-3">
                                <p className="text-xs mb-1">
                                  Buổi {nextSessionInfo?.next_session_no}
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="date"
                                    disabled={!canEdit}
                                    value={p.next_session_date || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;

                                      setSelectedPackages((prev) =>
                                        prev.map((pkg) =>
                                          pkg.id === p.id
                                            ? {
                                                ...pkg,
                                                next_session_date: value,
                                              }
                                            : pkg,
                                        ),
                                      );
                                    }}
                                    className="border rounded px-2 py-1"
                                  />

                                  <input
                                    type="time"
                                    disabled={!canEdit}
                                    value={p.next_session_time || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;

                                      setSelectedPackages((prev) =>
                                        prev.map((pkg) =>
                                          pkg.id === p.id
                                            ? {
                                                ...pkg,
                                                next_session_time: value,
                                              }
                                            : pkg,
                                        ),
                                      );
                                    }}
                                    className="border rounded px-2 py-1"
                                  />
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
                                  Đã điều trị:
                                  {nextSessionInfo?.current_session_no}/
                                  {nextSessionInfo?.total_sessions}
                                  buổi
                                </p>
                              </div>
                            )}
                          </>
                        )}
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
