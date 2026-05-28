import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { selectUser, fetchUser } from "../features/auth/authSlice";
import {
  fetchMyServiceHistory,
  selectCustomerInfo,
  selectCustomerProfiles,
  selectCustomerPayments,
  selectCustomerPortalLoading,
} from "../features/customer/customerSlice";
import { uploadAvatarAPI } from "../features/auth/authAPI";
import { useAppDispatch } from "../app/hook";
import { useEffect, useMemo, useState } from "react";

import {
  Camera,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  User,
  Wallet,
  ShieldCheck,
} from "lucide-react";

export default function UserProfile() {
  const dispatch = useAppDispatch();

  // auth user (vẫn giữ)
  const user = useSelector(selectUser);

  const [preview, setPreview] = useState(false);

  useEffect(() => {
    dispatch(fetchMyServiceHistory());
  }, [dispatch]);

  const customer = useSelector(selectCustomerInfo);

  const profiles = useSelector(selectCustomerProfiles);

  const payments = useSelector(selectCustomerPayments);

  const loading = useSelector(selectCustomerPortalLoading);

  const totalSpent = useMemo(() => {
    return payments.reduce(
      (sum: number, item: any) => sum + Number(item.paid_amount || 0),
      0,
    );
  }, [payments]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-gray-500 text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const getGenderLabel = (gender?: string) => {
    if (!gender) return "Không rõ";

    const value = gender.toLowerCase();

    if (value === "male" || value === "nam") return "Nam";
    if (value === "female" || value === "nu") return "Nữ";

    return "Không rõ";
  };

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
            src={"http://localhost:5000" + user.avatar}
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
                          ? "http://localhost:5000" + user.avatar
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
                  <ProfileInfoItem
                    icon={<Phone size={16} />}
                    label="Số điện thoại"
                    value={customer?.phone || "Chưa cập nhật"}
                  />

                  <ProfileInfoItem
                    icon={<User size={16} />}
                    label="Giới tính"
                    value={getGenderLabel(customer?.gender)}
                  />

                  <ProfileInfoItem
                    icon={<Calendar size={16} />}
                    label="Ngày sinh"
                    value={formatDate(customer?.dob)}
                  />

                  <ProfileInfoItem
                    icon={<MapPin size={16} />}
                    label="Địa chỉ"
                    value={
                      [customer?.address_detail, customer?.ward, customer?.city]
                        .filter(Boolean)
                        .join(", ") || "Chưa cập nhật"
                    }
                  />

                  <ProfileInfoItem
                    icon={<ShieldCheck size={16} />}
                    label="Xác thực"
                    value={
                      customer?.is_verified ? "Đã xác thực" : "Chưa xác thực"
                    }
                  />
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
                value={payments.length}
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Gói dịch vụ đã mua
                </h2>

                <div className="text-gray-500 text-sm">
                  Tổng hồ sơ liệu trình: {profiles.length}
                </div>
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
                          label="Bác sĩ"
                          value={profile.doctor_name || "Chưa phân công"}
                        />

                        <SmallInfo
                          label="Kỹ thuật viên"
                          value={profile.technician_name || "Chưa phân công"}
                        />
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

            {/* PAYMENT HISTORY */}
            <div
              className="
    mt-10
    rounded-3xl
    border border-stone-200
    bg-white
    p-3 xl:p-4
    shadow-sm
  "
            >
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-800 pl-2">
                  Toàn bộ giao dịch
                </h2>

                <div className="text-sm text-gray-500">
                  Tổng thanh toán: {formatMoney(totalSpent)}
                </div>
              </div>

              <div className="space-y-4 max-w-full overflow-hidden">
                {payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="
        rounded-3xl
        border border-stone-200
        bg-white
        p-4
        shadow-sm
      "
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {payment.payment_code}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(payment.created_at)}
                        </p>

                        <span
                          className="
              mt-3 inline-flex rounded-full
              bg-amber-100
              px-3 py-1
              text-xs font-semibold
              text-amber-700
            "
                        >
                          {payment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
                        <PaymentInfo
                          label="Tổng tiền"
                          value={formatMoney(payment.final_amount)}
                        />

                        <PaymentInfo
                          label="Đã thanh toán"
                          value={formatMoney(payment.paid_amount)}
                        />

                        <PaymentInfo
                          label="Còn lại"
                          value={formatMoney(payment.remaining_amount)}
                        />

                        <PaymentInfo
                          label="Giảm giá"
                          value={formatMoney(payment.discount_amount)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {payments.length === 0 && (
                  <div className="rounded-3xl border border-dashed py-14 text-center text-gray-400 bg-white">
                    Chưa có giao dịch nào
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// function InfoCard({ label, value }: { label: string; value: any }) {
//   return (
//     <div
//       className="
//         bg-white
//         rounded-2xl
//         border border-stone-200
//         p-5
//         shadow-sm
//       "
//     >
//       <p className="text-sm text-gray-500 mb-2">{label}</p>

//       <p className="font-bold text-gray-800 break-words">{value}</p>
//     </div>
//   );
// }

function SmallInfo({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-stone-50 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>

      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function ProfileInfoItem({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <div
      className="
    flex items-start gap-3
    rounded-2xl
    border border-stone-200
    bg-stone-50/80
    px-4 py-3
  "
    >
      <div className="mt-1 text-amber-500">{icon}</div>

      <div>
        <p className="text-xs text-gray-500">{label}</p>

        <p className="mt-1 font-semibold text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}

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
      className="
        rounded-3xl
        border border-stone-200
        bg-white
        px-5 py-4
        shadow-sm
        hover:shadow-md
        transition
        min-h-[120px]
        flex flex-col justify-between
      "
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <div
          className="
            flex h-10 w-10 items-center justify-center
            rounded-2xl
            bg-amber-50
            text-amber-500
          "
        >
          {icon}
        </div>
      </div>

      <h3
        className="
          mt-4
          text-xl xl:text-2xl
          font-bold
          text-gray-800
          break-words
        "
      >
        {value}
      </h3>
    </div>
  );
}

function PaymentInfo({ label, value }: { label: string; value: any }) {
  return (
    <div
      className="
        rounded-2xl
        border border-stone-200
        bg-stone-50
        px-4 py-3
      "
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-base font-bold text-gray-800 break-words">
        {value}
      </p>
    </div>
  );
}
