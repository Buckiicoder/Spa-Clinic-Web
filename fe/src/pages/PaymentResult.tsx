import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Home } from "lucide-react";

export default function PaymentResult() {
  const responseMessages: Record<string, string> = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công nhưng giao dịch bị nghi ngờ",
    "09": "Thẻ chưa đăng ký Internet Banking",
    "10": "Xác thực thông tin thẻ không đúng",
    "11": "Hết hạn chờ thanh toán",
    "12": "Thẻ bị khóa",
    "13": "Sai OTP",
    "24": "Khách hàng hủy giao dịch",
    "51": "Không đủ số dư",
    "65": "Vượt hạn mức giao dịch",
    "75": "Ngân hàng đang bảo trì",
    "79": "Nhập sai mật khẩu quá số lần quy định",
    "99": "Lỗi không xác định",
  };

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const source = params.get("source");

  const gateway = params.get("gateway");

  //-----------------------------------
  // ZALOPAY
  //-----------------------------------

  const apptransid = params.get("apptransid");

  //-----------------------------------
  // VNPAY
  //-----------------------------------

  const success = params.get("success");

  const txnRef = params.get("txnRef");

  const responseCode = params.get("responseCode");

  const isSuccess = success === "true" ||
  responseCode === "00";;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl bg-white shadow-xl border overflow-hidden">
          {/* HEADER */}
          <div
            className={`p-8 text-center ${
              isSuccess ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {isSuccess ? (
              <CheckCircle size={80} className="mx-auto text-green-600" />
            ) : (
              <XCircle size={80} className="mx-auto text-red-600" />
            )}

            <h1 className="mt-4 text-3xl font-bold">
              {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
            </h1>

            <p className="mt-2 text-gray-600">
              {isSuccess
                ? "Giao dịch của bạn đã được xử lý thành công."
                : "Giao dịch chưa hoàn tất. Vui lòng thử lại."}
            </p>
          </div>

          {/* CONTENT */}
          <div className="p-8 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500">Cổng thanh toán</span>

              <span className="font-semibold uppercase">{gateway}</span>
            </div>

            {gateway === "vnpay" && (
              <>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Mã giao dịch</span>

                  <span className="font-medium">{txnRef || "--"}</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-500">Mã phản hồi</span>

                  <span className="font-medium">{responseCode || "--"}</span>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="font-medium">
                    {responseMessages[responseCode || "99"]}
                  </p>
                </div>
              </>
            )}

            {gateway === "zalopay" && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">AppTransId</span>

                <span className="font-medium">{apptransid || "--"}</span>
              </div>
            )}

            {/* BUTTON */}
            <button
              onClick={() => {
    if (source === "staff") {
      navigate("/trangchu");
    } else {
      navigate("/");
    }
  }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-semibold text-white transition hover:opacity-90"
            >
              <Home size={20} />
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
