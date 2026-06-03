import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Receipt, User, CreditCard, BadgePercent } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchPaymentBillDetail,
  clearPaymentBillDetail,
  selectPaymentBillDetail,
  selectPaymentLoading,
} from "../features/payment/paymentSlice";

import { formatPrice } from "../features/product/productFunction";

export default function BillDetail() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { paymentId } = useParams();

  const loading = useAppSelector(selectPaymentLoading);

  const bill = useAppSelector(selectPaymentBillDetail);

  useEffect(() => {
    if (!paymentId) return;

    dispatch(fetchPaymentBillDetail(Number(paymentId)));

    return () => {
      dispatch(clearPaymentBillDetail());
    };
  }, [dispatch, paymentId]);

  const paymentMethodLabel: Record<string, string> = {
    CASH: "Tiền mặt",
    BANK_TRANSFER: "Chuyển khoản",
    MOMO: "MoMo",
    VNPAY: "VNPay",
    ZALOPAY: "ZaloPay",
    CARD: "Thẻ",
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải dữ liệu... </div>;
  }

  if (!bill) {
    return <div className="p-10 text-center">Không tìm thấy hóa đơn </div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      {" "}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* LEFT */}{" "}
        <div className="xl:col-span-8">
          {/* HEADER */}{" "}
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">
                  Chi tiết hóa đơn
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Mã hóa đơn: {bill.payment_code}
                </p>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-100"
              >
                Quay lại
              </button>
            </div>
          </div>
          {/* CUSTOMER */}
          {/* CUSTOMER INFO */}
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <User size={22} />
              </div>

              <div>
                <h2 className="font-bold text-black">Thông tin khách hàng</h2>

                <p className="text-sm text-gray-500">
                  Thông tin người thanh toán
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-800 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-xl font-bold text-amber-800">
                  {bill.customer_name?.charAt(0)}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-black">
                    {bill.customer_name}
                  </h2>

                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>SĐT: {bill.phone || "---"}</span>

                    <span>Email: {bill.email || "---"}</span>

                    <span>Hạng: {bill.rank || "Member"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">Mã hóa đơn</p>

                  <p className="mt-1 text-sm font-bold text-black">
                    {bill.payment_code}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">Tổng thanh toán</p>

                  <p className="mt-1 text-lg font-bold text-amber-700">
                    {formatPrice(bill.final_amount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">Đã thanh toán</p>

                  <p className="mt-1 text-lg font-bold text-blue-600">
                    {formatPrice(bill.paid_amount)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">Còn lại</p>

                  <p className="mt-1 text-lg font-bold text-red-500">
                    {formatPrice(bill.remaining_amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* ITEMS */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Receipt size={22} />
              </div>

              <div>
                <h2 className="font-bold text-black">Chi tiết dịch vụ</h2>

                <p className="text-sm text-gray-500">
                  Các dịch vụ trong hóa đơn
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">Dịch vụ</th>

                    <th className="p-3 text-left">Gói</th>

                    <th className="p-3 text-left">SL</th>

                    <th className="p-3 text-left">Đơn giá</th>

                    <th className="p-3 text-left">Thành tiền</th>
                  </tr>
                </thead>

                <tbody>
                  {bill.items?.map((item: any) => (
                    <tr key={item.payment_item_id} className="border-t">
                      <td className="p-3">{item.service_name}</td>

                      <td className="p-3">{item.package_name}</td>

                      <td className="p-3">{item.quantity}</td>

                      <td className="p-3">{formatPrice(item.unit_price)}</td>

                      <td className="p-3 font-semibold text-amber-700">
                        {formatPrice(item.final_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div className="space-y-6 xl:col-span-4">
          {/* SUMMARY */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Receipt size={22} />
              </div>

              <div>
                <h2 className="font-bold text-black">Tổng quan hóa đơn</h2>

                <p className="text-sm text-gray-500">Thông tin thanh toán</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 text-sm">
                <span>Tạm tính</span>

                <span>{formatPrice(bill.subtotal_amount)}</span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span>Giảm giá</span>

                <span className="text-green-600">
                  -{formatPrice(bill.discount_amount)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3 text-base">
                <span className="font-semibold text-black">Thành tiền</span>

                <span className="text-xl font-bold text-amber-700">
                  {formatPrice(bill.final_amount)}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span>Đã thanh toán</span>

                <span className="text-blue-600">
                  {formatPrice(bill.paid_amount)}
                </span>
              </div>

              <div className="flex justify-between">
                {bill.remaining_amount > 0 ? (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-orange-700">
                      Hóa đơn chưa thanh toán đủ
                    </p>

                    <p className="mt-1 text-sm text-orange-600">
                      Còn lại {formatPrice(bill.remaining_amount)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      Đã thanh toán hoàn tất
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DISCOUNT */}
          {bill.discount_id && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <BadgePercent size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-black">Mã giảm giá</h2>

                  <p className="text-sm text-gray-500">
                    Ưu đãi áp dụng cho hóa đơn
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold">{bill.discount_code}</p>

                <p className="text-sm text-gray-500">{bill.discount_name}</p>
              </div>
            </div>
          )}

          {/* TRANSACTIONS */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <CreditCard size={22} />

              <h2 className="font-bold">Lịch sử thanh toán</h2>
            </div>

            <div className="space-y-3">
              {bill.transactions?.map((item: any) => (
                <div
                  key={item.transaction_id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold uppercase text-black">
                      {paymentMethodLabel[item.payment_method]}
                    </p>

                    <p className="text-xs text-gray-500">
                      {item.paid_at
                        ? new Date(item.paid_at).toLocaleString("vi-VN")
                        : "---"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      {formatPrice(item.amount)}
                    </p>

                    {item.transaction_code && (
                      <p className="text-xs text-gray-500">
                        {item.transaction_code}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
