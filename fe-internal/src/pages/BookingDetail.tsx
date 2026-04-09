import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getBookingByIdAPI,
  checkInBookingAPI,
} from "../features/internalBooking/bookingAPI";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ fetch booking
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBookingByIdAPI(id!);
        setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // ✅ render status
  const renderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "CHƯA ĐẾN";
      case "CONFIRMED":
        return "CHƯA XÁC NHẬN";
      case "CHECKED_IN":
        return "ĐÃ ĐẾN";
      case "CANCELLED":
        return "ĐÃ HỦY";
      case "COMPLETED":
        return "HOÀN THÀNH";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CHECKED_IN":
        return "bg-blue-100 text-blue-700";
      case "CANCELLED":
        return "bg-red-100 text-red-600";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ✅ check-in (LOCAL STATE UPDATE)
  const handleCheckIn = async () => {
    try {
      const res = await checkInBookingAPI(booking.id);

      // 🔥 update UI ngay lập tức
      setBooking(res.data);
    } catch (err) {
      console.error(err);
      alert("Check-in thất bại");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading booking...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 p-6 flex justify-center">
      {/* <Navbar /> */}

      <div className="w-full max-w-3xl py-24">
        <div className="bg-white/90 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-[0_20px_40px_rgba(120,_72,_0,_0.15)] p-8">
          
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-amber-600 py-1">
                Chi tiết đặt lịch
              </h2>
              <p className="text-gray-500 font-medium">
                Mã: {booking.booking_code}
              </p>
            </div>

            <span
              className={`px-4 py-2 rounded-full font-semibold ${getStatusStyle(
                booking.status
              )}`}
            >
              {renderStatus(booking.status)}
            </span>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem label="Tên khách" value={booking.name} />
            <InfoItem label="SĐT" value={booking.phone} />
            <InfoItem label="Email" value={booking.email || "Không có"} />
            <InfoItem label="Dịch vụ" value={booking.service_name} />

            <InfoItem
              label="Ngày"
              value={new Date(booking.booking_date).toLocaleDateString("vi-VN")}
            />

            <InfoItem label="Giờ" value={booking.booking_time} />
            <InfoItem label="Số lượng" value={booking.quantity} />
            <InfoItem label="Trạng thái" value={renderStatus(booking.status)} />
          </div>

          {/* NOTE */}
          {booking.note && (
            <div className="mt-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                <p>{booking.note}</p>
              </div>
            </div>
          )}

          {/* BUTTON */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => navigate("/checklich")}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full"
            >
              Quay lại
            </button>

            <button
              disabled={booking.status === "CHECKED_IN"}
              onClick={handleCheckIn}
              className={`px-5 py-2 rounded-full text-white ${
                booking.status === "CHECKED_IN"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              Xác nhận
            </button>
          </div>

          <div className="mt-10 text-center text-sm text-stone-500">
            Thông tin đặt lịch của khách hàng
          </div>
        </div>
      </div>
    </div>
  );
}

/* COMPONENT */
function InfoItem({ label, value }: any) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
