import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hook";
import { fetchUser } from "../features/auth/authSlice";
import { uploadAvatarAPI } from "../features/auth/authAPI";
import { useState } from "react";

export default function UserProfile() {
  const user = useSelector(selectUser);
  const dispatch = useAppDispatch();

  const [preview, setPreview] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading user...
      </div>
    );
  }

  const getSexLabel = (sex?: string) => {
    if (!sex) return "Không rõ";

    const value = sex.toLocaleLowerCase();

    if (value === "nam") return "Nam";
    if (value === "nu") return "Nữ";
    return "Không rõ";
  };

  const getRankLabel = (rank?: string) => {
    if (!rank) return "Lỗi rank";

    const value = rank.toUpperCase();

    switch (value) {
      case "BRONZE":
        return "Đồng";
      case "SILVER":
        return "Bạc";
      case "GOLD":
        return "Vàng";
      case "DIAMOND":
        return "Kim cương";
      default:
        return "Đồng";
    }
  };

  const getRoleLabel = (role?: string) => {
    if(!role) return "Lỗi role";

    const value = role.toUpperCase();

    if(value === "CUSTOMER")  
      return "KHÁCH HÀNG";
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ validate loại file
    if (!file.type.startsWith("image/")) {
      alert("Chỉ được upload ảnh!");
      return;
    }

    // ✅ validate size (2MB)
    if (file.size > 20 * 1024 * 1024) {
      alert("Ảnh phải nhỏ hơn 20MB!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await uploadAvatarAPI(formData);

      alert("Cập nhật ảnh đại diện thành công!");

      // ✅ reload redux user
      dispatch(fetchUser());

      // ✅ reset input (QUAN TRỌNG)
      e.target.value = "";
    } catch (error) {
      console.error(error);
      alert("Cập nhật ảnh đại diện thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 p-6 flex justify-center">
      <Navbar />

      <div className="w-full max-w-3xl py-28">
        {preview && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setPreview(false)}
          >
            <img
              src={"http://localhost:5000" + user.avatar}
              className="max-w-[90%] max-h-[90%] rounded-lg"
            />
          </div>
        )}
        <div
          className="
          bg-white/90 backdrop-blur-xl
          border border-amber-200
          rounded-2xl
          shadow-[0_20px_40px_rgba(120,_72,_0,_0.15)]
          p-8
        "
        >
          {/* Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {/* Avatar */}
              <img
                onClick={() => setPreview(true)}
                src={
                  user?.avatar
                    ? "http://localhost:5000" + user.avatar
                    : "https://ui-avatars.com/api/?name=" +
                      (user?.name || "User")
                }
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 border-amber-300 shadow object-cover"
              />

              {/* Hidden input */}
              <input
                type="file"
                accept="image/*"
                id="avatarUpload"
                className="hidden"
                onChange={handleUploadAvatar}
              />

              {/* Button overlay */}
              <label
                htmlFor="avatarUpload"
                className="
        absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
        bg-amber-500 hover:bg-amber-600
        text-white text-xs px-3 py-1
        rounded-full shadow cursor-pointer
      "
              >
                Ảnh
              </label>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-brown-900">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>

              <span
                className="
                inline-block mt-2 px-3 py-1 text-sm
                bg-amber-100 text-amber-700
                rounded-full
              "
              >
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone */}
            <InfoItem label="Điện thoại" value={user.phone} />

            {/* Email */}
            <InfoItem label="Email" value={user.email} />

            {/* Sex */}
            <InfoItem label="Giới tính" value={getSexLabel(user.sex)} />

            {/* Rank */}
            <InfoItem label="Rank" value={getRankLabel(user.rank)} />

            {/* Spending */}
            <InfoItem
              label="Tổng chi tiêu"
              value={
                user.total_spending
                  ? Number(user.total_spending).toLocaleString() + " VNĐ"
                  : "0 VNĐ"
              }
            />
          </div>

          {/* Footer */}
          <div className="mt-10 text-center text-sm text-stone-500">
            Thông tin chỉ mang tính hiển thị, không thể chỉnh sửa
          </div>
        </div>
      </div>
    </div>
  );
}

/* Component nhỏ cho từng field */
function InfoItem({ label, value }: any) {
  return (
    <div
      className="
      bg-amber-50
      border border-amber-200
      rounded-xl
      p-4
      shadow-sm
    "
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}
