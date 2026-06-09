import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { selectUser, fetchUser } from "../features/auth/authSlice";
import { SERVER_URL } from "../services/env";
import {
  fetchMyServiceHistory,
  selectCustomerInfo,
  selectCustomerProfiles,
  // selectCustomerPayments,
  selectCustomerPortalLoading,
  updateMyProfile,
  rescheduleSession,
} from "../features/customer/customerSlice";
import {
  fetchCustomerUnpaidProfiles,
  selectCustomerUnpaidProfiles,
} from "../features/payment/paymentSlice";
import { uploadAvatarAPI } from "../features/auth/authAPI";
import { useAppDispatch } from "../app/hook";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Camera,
  Calendar,
  CreditCard,
  // MapPin,
  // Phone,
  User,
  Wallet,
  // ShieldCheck,
} from "lucide-react";

export default function UserProfile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // auth user (vẫn giữ)
  const user = useSelector(selectUser);

  const [preview, setPreview] = useState(false);

  const [editing, setEditing] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",

    gender: "",

    dob: "",

    city: "",
    ward: "",
    address_detail: "",

    avatar: "",
  });

  const customer = useSelector(selectCustomerInfo);

  const unpaidProfiles = useSelector(selectCustomerUnpaidProfiles) as any[];

  const [rescheduleModal, setRescheduleModal] = useState(false);

  const [selectedSession, setSelectedSession] = useState<any>(null);

  const [rescheduleForm, setRescheduleForm] = useState({
    service_date: "",
    service_time: "",
  });

  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  useEffect(() => {
    if (!customer) return;

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",

      gender: customer.gender || "",

      dob: customer.dob ? customer.dob.split("T")[0] : "",

      city: customer.city || "",
      ward: customer.ward || "",
      address_detail: customer.address_detail || "",

      avatar: customer.avatar || "",
    });
  }, [customer]);

  useEffect(() => {
    dispatch(fetchMyServiceHistory());
  }, [dispatch]);

  useEffect(() => {
    if (customer?.id) {
      dispatch(fetchCustomerUnpaidProfiles(customer.id));
    }
  }, [dispatch, customer?.id]);

  const profiles = useSelector(selectCustomerProfiles);

  // const payments = useSelector(selectCustomerPayments);

  const loading = useSelector(selectCustomerPortalLoading);

  const validate = () => {
    const newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    }

    if (!form.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    if (!form.dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh";
    }

    return newErrors;
  };

  const lastUpdatedAt = customer?.profile_updated_at;

  const canEdit = useMemo(() => {
    if (!lastUpdatedAt) return true;

    const last = new Date(lastUpdatedAt).getTime();

    const now = Date.now();

    const diffDays = (now - last) / (1000 * 60 * 60 * 24);

    return diffDays >= 7;
  }, [lastUpdatedAt]);

  const totalSpent = useMemo(() => {
    return profiles.reduce(
      (profileSum: number, profile: any) =>
        profileSum +
        (profile.payments || []).reduce(
          (paymentSum: number, payment: any) =>
            paymentSum + Number(payment.paid_amount || 0),
          0,
        ),
      0,
    );
  }, [profiles]);

  const totalTransactions = useMemo(() => {
    return profiles.reduce(
      (sum: number, profile: any) => sum + (profile.payments?.length || 0),
      0,
    );
  }, [profiles]);

  const unpaidCount = Array.isArray(unpaidProfiles)
  ? unpaidProfiles.length
  : 0;

  console.log("unpaidProfiles", unpaidProfiles);
console.log("unpaidCount", unpaidCount);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-gray-500 text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  // const getGenderLabel = (gender?: string) => {
  //   if (!gender) return "Không rõ";

  //   const value = gender.toLowerCase();

  //   if (value === "male" || value === "nam") return "Nam";
  //   if (value === "female" || value === "nu") return "Nữ";

  //   return "Không rõ";
  // };

  const getRankLabel = (rank?: string) => {
    if (!rank) return "Đồng";

    switch (rank.toUpperCase()) {
      case "BRONZE":
        return "Đồng";
      case "SILVER":
        return "Bạc";
      case "GOLD":
        return "Vàng";
      case "DIAMOND":
        return "Kim cương";
      case "VIP":
        return "VIP";
      case "SUPER_VIP":
        return "SUPER VIP";
      default:
        return "Đồng";
    }
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "KHÁCH HÀNG";
    return "KHÁCH HÀNG";
  };

  const formatMoney = (value?: number | string) => {
    return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
  };

  const formatDate = (date?: string) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const openRescheduleModal = (session: any) => {
    setSelectedSession(session);

    setRescheduleForm({
      service_date: session.service_date
        ? session.service_date.split("T")[0]
        : "",
      service_time: session.service_time || "",
    });

    setRescheduleModal(true);
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Chỉ được upload ảnh!");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Ảnh phải nhỏ hơn 20MB!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await uploadAvatarAPI(formData);

      alert("Cập nhật ảnh đại diện thành công!");

      dispatch(fetchUser());
      dispatch(fetchMyServiceHistory());

      e.target.value = "";
    } catch (error) {
      console.error(error);
      alert("Cập nhật ảnh đại diện thất bại");
    }
  };

  const handleUpdateProfile = async () => {
    const validateErrors = validate();

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    const confirmed = window.confirm(
      "Bạn có chắc muốn cập nhật thông tin cá nhân không?",
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      await dispatch(
        updateMyProfile({
          name: form.name,
          phone: form.phone,
          email: form.email,

          gender: form.gender,
          dob: form.dob,

          city: form.city,
          ward: form.ward,
          address_detail: form.address_detail,

          avatar: form.avatar,
        }),
      ).unwrap();

      alert("Cập nhật thành công");
      setErrors({});
      dispatch(fetchMyServiceHistory());

      setEditing(false);
    } catch (err: any) {
      alert(err?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSession) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn thay đổi lịch hẹn không?",
    );

    if (!confirmed) return;

    try {
      setRescheduleLoading(true);

      await dispatch(
        rescheduleSession({
          session_id: Number(selectedSession.id),
          service_date: rescheduleForm.service_date,
          service_time: rescheduleForm.service_time,
        }),
      ).unwrap();

      alert("Đổi lịch thành công");

      setRescheduleModal(false);

      dispatch(fetchMyServiceHistory());
    } catch (err: any) {
      alert(err?.message || "Đổi lịch thất bại");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCreatePayment = () => {
    if (!customer) return;

    navigate(`/payment/customer/${customer.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <Navbar />

      {/* Preview Avatar */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(false)}
        >
          <img
            src={SERVER_URL + user.avatar}
            className="max-w-full max-h-full rounded-2xl"
          />
        </div>
      )}

      <div className="mx-auto max-w-[1500px] px-3 py-24 md:px-6">
        {/* HEADER */}
        {/* PROFILE LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
          {/* LEFT SIDEBAR */}
          <div className="xl:col-span-4 2xl:col-span-4 space-y-6 xl:sticky xl:top-24 self-start">
            {/* USER CARD */}
            <div className="rounded-3xl bg-white shadow-sm border border-stone-200 overflow-hidden">
              {/* top banner */}
              <div className="h-28 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400" />

              <div className="px-6 pb-6 -mt-14">
                <div className="flex flex-col items-center">
                  {/* avatar */}
                  <div className="relative">
                    <img
                      onClick={() => setPreview(true)}
                      src={
                        user?.avatar
                          ? SERVER_URL + user.avatar
                          : "https://ui-avatars.com/api/?name=" +
                            (user?.name || "User")
                      }
                      alt="avatar"
                      className="
                  w-32 h-32
                  rounded-3xl
                  border-[6px] border-white
                  object-cover
                  bg-white
                  shadow-xl
                "
                    />

                    <label
                      htmlFor="avatarUpload"
                      className="
                  absolute -bottom-4 left-1/2 -translate-x-1/2
                  flex items-center gap-1
                  rounded-full bg-amber-600
                  px-4 py-2
                  text-xs font-semibold text-white
                  shadow-lg cursor-pointer
                  hover:bg-amber-600 transition w-24
                "
                    >
                      <Camera size={14} />
                      Đổi ảnh
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      id="avatarUpload"
                      className="hidden"
                      onChange={handleUploadAvatar}
                    />
                  </div>

                  {/* user info */}
                  <div className="mt-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {customer?.name}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                      {customer?.email}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <span className="rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-700">
                        {getRoleLabel(user.role)}
                      </span>

                      <span className="rounded-full bg-yellow-100 px-4 py-1 text-xs font-semibold text-yellow-700">
                        {getRankLabel(customer?.rank)}
                      </span>

                      <span
                        className={`rounded-full px-4 py-1 text-xs font-semibold ${
                          customer?.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {customer?.is_active
                          ? "Đang hoạt động"
                          : "Ngưng hoạt động"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* INFO */}
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                      Thông tin cá nhân
                    </h3>

                    {!editing ? (
                      <button
                        disabled={!canEdit}
                        onClick={() => {
                          setErrors({});
                          setEditing(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm"
                      >
                        {!canEdit && (
                          <p className="text-xs text-red-500">
                            Bạn chỉ được cập nhật thông tin mỗi 7 ngày.
                          </p>
                        )}
                        Chỉnh sửa
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setErrors({});
                          setEditing(false);
                        }}
                        className="px-4 py-2 rounded-xl border text-sm"
                      >
                        Hủy
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ tên
                    </label>

                    <input
                      disabled={!editing}
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border px-3 py-2 disabled:bg-gray-100"
                    />

                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số điện thoại
                    </label>

                    <input
                      disabled={!editing}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          phone: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border px-3 py-2 disabled:bg-gray-100"
                    />

                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>

                    <input
                      disabled={!editing}
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border px-3 py-2 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Giới tính
                      </label>

                      <select
                        disabled={!editing}
                        value={form.gender}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gender: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border px-3 py-2"
                      >
                        <option value="">Chọn</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.gender}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ngày sinh
                      </label>

                      <input
                        type="date"
                        disabled={!editing}
                        value={form.dob}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            dob: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border px-3 py-2"
                      />
                      {errors.dob && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.dob}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Thành phố
                    </label>

                    <input
                      disabled={!editing}
                      value={form.city}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          city: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phường/Xã
                    </label>

                    <input
                      disabled={!editing}
                      value={form.ward}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ward: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Địa chỉ
                    </label>

                    <textarea
                      rows={3}
                      disabled={!editing}
                      value={form.address_detail}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address_detail: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border px-3 py-2"
                    />
                  </div>

                  {editing && (
                    <button
                      onClick={handleUpdateProfile}
                      disabled={submitting}
                      className="
      w-full
      rounded-xl
      bg-amber-500
      py-3
      text-white
      font-semibold
      hover:bg-amber-600
    "
                    >
                      {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="xl:col-span-8 2xl:col-span-8 space-y-6 min-w-0 w-full">
            {/* STATS */}
            <div
              className="
      grid
      grid-cols-2
      lg:grid-cols-4
      gap-4
    "
            >
              <StatCard
                icon={<Wallet size={18} />}
                title="Tổng chi tiêu"
                value={formatMoney(totalSpent)}
              />

              <StatCard
                icon={<CreditCard size={18} />}
                title="Giao dịch"
                value={totalTransactions}
              />

              <StatCard
                icon={<User size={18} />}
                title="Điểm tích lũy"
                value={customer?.loyalty_points || 0}
              />

              <StatCard
                icon={<Calendar size={18} />}
                title="Lượt sử dụng"
                value={customer?.total_visits || 0}
              />
            </div>

            {/* SERVICE PACKAGES */}
            <div
              className="
                  rounded-3xl
                  border border-stone-200
                  bg-white
                  p-5 xl:p-6
                  shadow-sm
                "
            >
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Gói dịch vụ đã mua
                  </h2>

                  <div className="text-gray-500 text-sm">
                    Tổng hồ sơ liệu trình: {profiles.length}
                  </div>
                </div>
                {/* {console.log("profiles", profiles)} */}

                {unpaidCount > 0 && (
                  <button
                    onClick={handleCreatePayment}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                  >
                    <Wallet size={18} />
                    Thanh toán
                    {unpaidCount > 0 && (
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                        {unpaidCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 items-stretch">
                {profiles.map((profile: any) => (
                  <div
                    key={profile.id}
                    className="
    group
  rounded-3xl
  border border-stone-200
  bg-gradient-to-b from-white to-stone-50/70
  shadow-sm
  transition-all
  duration-300
  hover:-translate-y-1
  hover:shadow-lg
  overflow-hidden
  h-full
  flex flex-col
  "
                  >
                    <div className="p-6">
                      {/* Top */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {profile.package_name}
                          </h3>

                          <p className="text-amber-600 mt-1 font-medium">
                            {profile.service_name}
                          </p>
                        </div>

                        <span
                          className="
                          px-3 py-1
                          rounded-full
                          text-xs font-medium
                          bg-green-100 text-green-700
                        "
                        >
                          {profile.status}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500">
                            Tiến trình liệu trình
                          </span>

                          <span className="font-semibold text-gray-700">
                            {profile.used_sessions}/{profile.total_sessions}{" "}
                            buổi
                          </span>
                        </div>

                        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            style={{
                              width: `${
                                (profile.used_sessions /
                                  profile.total_sessions) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <SmallInfo
                          label="Giá gói"
                          value={formatMoney(profile.package_price)}
                        />

                        <SmallInfo
                          label="Ngày bắt đầu"
                          value={formatDate(profile.started_at)}
                        />

                        <SmallInfo
                          label="Bác sĩ tư vấn"
                          value={profile.doctor_name || "Chưa phân công"}
                        />

                        <SmallInfo
                          label="KTV gần nhất"
                          value={
                            profile.latest_technician_name || "Chưa thực hiện"
                          }
                        />
                        {/* <SmallInfo
  label="Buổi hẹn tiếp theo"
  value={
    profile.next_session
      ? `Buổi ${profile.next_session.session_no}`
      : "Chưa có lịch"
  }
/> */}

                        <div className="bg-stone-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-1">
                            Ngày hẹn tiếp theo
                          </p>

                          {profile.next_session ? (
                            <>
                              <p className="font-semibold text-gray-800">
                                Buổi {profile.next_session.session_no}
                              </p>

                              <p className="text-sm text-amber-600 mt-1">
                                {formatDate(profile.next_session.service_date)}
                              </p>

                              <p className="text-sm text-gray-500">
                                {profile.next_session.service_time}
                              </p>

                              <button
                                onClick={() =>
                                  openRescheduleModal(profile.next_session)
                                }
                                className="
          mt-3
          px-3 py-2
          text-xs
          rounded-lg
          bg-amber-500
          text-white
          hover:bg-amber-600
        "
                              >
                                Đổi lịch
                              </button>
                            </>
                          ) : (
                            <p className="font-semibold text-gray-500">
                              Chưa có lịch
                            </p>
                          )}
                        </div>

                        <SmallInfo
                          label="Giờ hẹn"
                          value={profile.next_session?.service_time || "--:--"}
                        />
                        {/* <SmallInfo
  label="Buổi gần nhất"
  value={
    profile.latest_session_no
      ? `Buổi ${profile.latest_session_no}`
      : "Chưa có"
  }
/>

<SmallInfo
  label="Ngày điều trị"
  value={formatDate(profile.latest_service_date)}
/> */}
                      </div>

                      {/* Sessions */}
                      <div className="mt-6 border-t pt-5">
                        <h4 className="font-semibold text-gray-800 mb-4">
                          Lịch điều trị
                        </h4>

                        <div className="space-y-3">
                          {profile.sessions?.length > 0 ? (
                            profile.sessions.map((session: any) => (
                              <div
                                key={session.id}
                                className="
            rounded-2xl
            border
            border-stone-200
            bg-stone-50
            p-4
          "
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">
                                      Buổi {session.session_no}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      {formatDate(session.service_date)}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      {session.service_time || "--:--"}
                                    </p>
                                  </div>

                                  <span
                                    className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${
                  session.status === "done"
                    ? "bg-green-100 text-green-700"
                    : session.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }
              `}
                                  >
                                    {session.status}
                                  </span>
                                </div>

                                {session.technician_name && (
                                  <p className="mt-2 text-sm text-gray-600">
                                    KTV: {session.technician_name}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              Chưa có lịch điều trị
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payments */}
                      <div className="mt-6 border-t pt-5">
                        <h4 className="font-semibold text-gray-800 mb-4">
                          Lịch sử thanh toán
                        </h4>

                        <div className="space-y-3">
                          {profile.payments?.length > 0 ? (
                            profile.payments.map((payment: any) => (
                              <div
                                key={payment.payment_id}
                                className="
                                  rounded-2xl
                                  border border-stone-200
                                  bg-[#fafafa]
                                  p-4
                                "
                              >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {payment.payment_code}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      {formatDate(payment.created_at)}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-lg font-bold text-amber-600">
                                      {formatMoney(payment.paid_amount)}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      {payment.status}
                                    </p>
                                  </div>

                                  {payment.transactions?.length > 0 && (
                                    <div className="mt-3 border-t pt-3 space-y-2">
                                      {payment.transactions.map((tx: any) => (
                                        <div
                                          key={tx.id}
                                          className="flex items-center justify-between text-sm"
                                        >
                                          <div>
                                            <p className="font-medium">
                                              {tx.payment_method}
                                            </p>

                                            <p className="text-gray-500">
                                              {formatDate(tx.paid_at)}
                                            </p>
                                          </div>

                                          <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                              {formatMoney(tx.amount)}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                              {tx.status}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">
                              Chưa có thanh toán
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Đổi lịch hẹn</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Ngày hẹn</label>

                <input
                  type="date"
                  value={rescheduleForm.service_date}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      service_date: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Giờ hẹn</label>

                <input
                  type="time"
                  value={rescheduleForm.service_time}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      service_time: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRescheduleModal(false)}
                className="
            px-4 py-2
            border
            rounded-xl
          "
              >
                Hủy
              </button>

              <button
                disabled={rescheduleLoading}
                onClick={handleReschedule}
                className="
            px-4 py-2
            rounded-xl
            bg-amber-500
            text-white
          "
              >
                {rescheduleLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmallInfo({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-stone-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>

      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}

// function ProfileInfoItem({
//   icon,
//   label,
//   value,
// }: {
//   icon: any;
//   label: string;
//   value: any;
// }) {
//   return (
//     <div
//       className="
//       flex items-start gap-3
//       rounded-2xl
//       border border-stone-200
//       bg-stone-50/80
//       px-4 py-3
//     "
//     >
//       <div className="mt-1 text-amber-500">{icon}</div>

//       <div>
//         <p className="text-xs text-gray-500">{label}</p>

//         <p className="mt-1 font-semibold text-gray-800 break-words">{value}</p>
//       </div>
//     </div>
//   );
// }

function StatCard({
  icon,
  title,
  value,
}: {
  icon: any;
  title: string;
  value: any;
}) {
  return (
    <div
      className="rounded-3xl border border-stone-200  bg-white px-5 py-4  shadow-sm hover:shadow-md transition min-h-[120px] flex flex-col justify-between
        "
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div
          className=" flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50  text-amber-500
            "
        >
          {icon}
        </div>
      </div>

      <h3
        className=" mt-4 text-xl xl:text-2xl
            font-bold  text-gray-800 break-words "
      >
        {value}
      </h3>
    </div>
  );
}
