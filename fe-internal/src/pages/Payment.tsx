import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  Wallet,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchAvailableDiscounts,
  calculatePaymentDiscount,
  createPayment,
  selectAvailableDiscounts,
  selectCalculatedDiscount,
  selectPaymentLoading,
  fetchCustomerUnpaidProfiles,
  selectCustomerUnpaidProfiles,
  selectPaymentCustomerInfo,
  selectPaymentSummary,
  fetchPaymentSummaryByProfile,
  // createVNPayPayment,
  createZaloPayPayment,
  // selectZaloPayOrderUrl,
} from "../features/payment/paymentSlice";

import { formatPrice } from "../features/product/productFunction";
import type { CustomerUnpaidProfile } from "../types/payment";

export default function Payment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { customerId } = useParams();

  const loading = useAppSelector(selectPaymentLoading);

  const unpaidProfiles = useAppSelector(selectCustomerUnpaidProfiles);

  const customerInfo = useAppSelector(selectPaymentCustomerInfo);

  const profileList = Array.isArray(unpaidProfiles) ? unpaidProfiles : [];

  const discounts = useAppSelector(selectAvailableDiscounts);

  const calculation = useAppSelector(selectCalculatedDiscount);

  const paymentSummaryData = useAppSelector(selectPaymentSummary);

  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);

  const [selectedProfile, setSelectedProfile] =
    useState<CustomerUnpaidProfile | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "BANK_TRANSFER" | "MOMO" | "ZALOPAY"
  >("CASH");

  const [paidAmount, setPaidAmount] = useState<number>(0);

  const [note, setNote] = useState("");

  const [redirectingZaloPay, setRedirectingZaloPay] =
  useState(false);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (!customerId) return;

    dispatch(fetchCustomerUnpaidProfiles(Number(customerId)));
  }, [dispatch, customerId]);

  useEffect(() => {
    if (profileList.length > 0) {
      const stillExists = profileList.find(
        (item: CustomerUnpaidProfile) =>
          item.profile_id === selectedProfile?.profile_id,
      );

      if (!stillExists) {
        setSelectedProfile(profileList[0]);
      }
    } else {
      setSelectedProfile(null);
    }
  }, [profileList, selectedProfile]);

  useEffect(() => {
    setSelectedDiscount(null);
  }, [selectedProfile?.profile_id]);

  useEffect(() => {
    setPage(1);
  }, [profileList.length]);

  useEffect(() => {
    if (!selectedProfile) return;

    dispatch(fetchAvailableDiscounts(Number(selectedProfile.profile_id)));

    dispatch(fetchPaymentSummaryByProfile(Number(selectedProfile.profile_id)));

    dispatch(
      calculatePaymentDiscount({
        profile_id: selectedProfile.profile_id,

        discount_id: selectedDiscount?.id,
      }),
    );
  }, [dispatch, selectedProfile, selectedDiscount]);

  const paymentMethods = [
    {
      key: "CASH",
      label: "Tiền mặt",
      icon: Banknote,
    },

    {
      key: "BANK_TRANSFER",
      label: "QR Chuyển khoản",
      icon: QrCode,
    },

    {
      key: "MOMO",
      label: "MoMo",
      icon: Wallet,
    },

    {
      key: "ZALOPAY",
      label: "ZaloPay",
      icon: CreditCard,
    },
  ];

  const paymentSummary = useMemo<{
    subtotal: number;
    discount: number;
    final: number;
    paid: number;
    remaining: number;
  }>(() => {
    return {
      subtotal:
        calculation?.subtotal_amount ||
        Number(
          paymentSummaryData?.subtotal_amount ||
            selectedProfile?.package_price ||
            0,
        ),

      discount:
        calculation?.discount_amount ||
        Number(paymentSummaryData?.discount_amount || 0),

      final:
        calculation?.final_amount ||
        Number(
          paymentSummaryData?.final_amount ||
            selectedProfile?.package_price ||
            0,
        ),

      paid: Number(paymentSummaryData?.paid_amount || 0),

      remaining: Number(
        paymentSummaryData?.remaining_amount ||
          calculation?.final_amount ||
          selectedProfile?.package_price ||
          0,
      ),
    };
  }, [calculation, selectedProfile, paymentSummaryData]);

  useEffect(() => {
    if (paymentSummary.remaining > 0) {
      setPaidAmount(paymentSummary.remaining);
    }
  }, [paymentSummary.remaining]);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const totalPages = Math.ceil(profileList.length / limit);

  const paginatedProfiles = profileList.slice((page - 1) * limit, page * limit);

  const zaloPayAmount = paymentSummary.remaining;

  const handleZaloPayPayment = async () => {
    if (!selectedProfile) return;

    if (paidAmount <= 0) {
      alert("Số tiền thanh toán không hợp lệ");
      return;
    }

    try {
      setRedirectingZaloPay(true);

      const result = await dispatch(
        createZaloPayPayment({
          profile_id: Number(selectedProfile.profile_id),
          discount_id: selectedDiscount?.id,
          amount: paidAmount,
        }),
      ).unwrap();

      if (result?.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      throw new Error("Không tạo được link Zalopay");
    } catch (err: any) {
      console.log(err);

      alert(err?.message || "Khởi tạo thanh toán Zalopay thất bại");
    } finally {
      setRedirectingZaloPay(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedProfile) return;

    if (paidAmount > paymentSummary.remaining) {
      alert("Số tiền vượt quá công nợ");
      return;
    }

    if (paidAmount <= 0) {
      alert("Số tiền thanh toán không hợp lệ");
      return;
    }

    if (paymentMethod === "ZALOPAY") {
      return handleZaloPayPayment();
    }

    try {
      await dispatch(
        createPayment({
          customer_id: selectedProfile.customer_id,

          profile_id: Number(selectedProfile.profile_id),

          discount_id: selectedDiscount?.id,

          note,

          payment_methods: [
            {
              payment_method: paymentMethod,

              amount: Number(paidAmount),
            },
          ],
        }),
      ).unwrap();

      alert("Thanh toán thành công");

      dispatch(fetchCustomerUnpaidProfiles(Number(customerId)));

      dispatch(fetchPaymentSummaryByProfile(selectedProfile.profile_id));

      setSelectedDiscount(null);

      setSelectedProfile(null);
      setPaidAmount(0);
      setNote("");
    } catch (err: any) {
      console.log(err);

      alert(err?.message || "Thanh toán thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* LEFT */}
        <div className="xl:col-span-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* HEADER */}
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">
                  Thanh toán liệu trình
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Danh sách gói dịch vụ chưa thanh toán của khách hàng
                </p>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold transition hover:bg-gray-100"
              >
                Quay lại
              </button>
            </div>

            {/* CUSTOMER INFO */}
            {customerInfo && (
              <div className="mb-6 rounded-3xl border border-gray-800 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-xl font-bold text-amber-800">
                    {customerInfo.full_name?.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black">
                      {customerInfo.full_name}
                    </h2>

                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>SĐT: {customerInfo.phone || "---"}</span>

                      <span>Email: {customerInfo.email || "---"}</span>

                      <span>Hạng: {customerInfo.rank || "Member"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-white p-4 border border-gray-200">
                    <p className="text-xs text-gray-500">Tổng chi tiêu</p>

                    <p className="mt-1 text-lg font-bold text-amber-700">
                      {formatPrice(Number(customerInfo.total_spending || 0))}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border border-gray-200">
                    <p className="text-xs text-gray-500">Tổng lượt đến</p>

                    <p className="mt-1 text-lg font-bold text-black">
                      {customerInfo.total_visits || 0}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border border-gray-200">
                    <p className="text-xs text-gray-500">
                      Hồ sơ chưa thanh toán
                    </p>

                    <p className="mt-1 text-lg font-bold text-red-500">
                      {profileList.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border border-gray-200">
                    <p className="text-xs text-gray-500">Khách hàng từ</p>

                    <p className="mt-1 text-sm font-semibold text-black">
                      {customerInfo.first_visit_at
                        ? new Date(
                            customerInfo.first_visit_at,
                          ).toLocaleDateString("vi-VN")
                        : "---"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-amber-50 text-gray-700">
                    <tr>
                      <th className="p-3 text-left">Mã hồ sơ</th>

                      <th className="p-3 text-left">Dịch vụ</th>

                      <th className="p-3 text-left">Gói liệu trình</th>

                      <th className="p-3 text-left">Số buổi</th>

                      <th className="p-3 text-left">Đã dùng</th>

                      <th className="p-3 text-left">Trạng thái</th>

                      <th className="p-3 text-left">Giá</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading &&
                      paginatedProfiles.map((item: CustomerUnpaidProfile) => {
                        const active =
                          selectedProfile?.profile_id === item.profile_id;

                        return (
                          <tr
                            key={item.profile_id}
                            onClick={() => setSelectedProfile(item)}
                            className={`border-t transition cursor-pointer ${
                              active ? "bg-amber-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="p-3 font-semibold">
                              #{item.profile_id}
                            </td>

                            <td className="p-3 font-medium">
                              {item.service_name}
                            </td>

                            <td className="p-3">{item.package_name}</td>

                            <td className="p-3">{item.total_sessions}</td>

                            <td className="p-3">{item.used_sessions}</td>

                            <td className="p-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  Number(item.remaining_amount || 0) > 0 &&
                                  Number(item.paid_amount || 0) > 0
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {Number(item.paid_amount || 0) > 0
                                  ? "Thanh toán một phần"
                                  : "Chưa thanh toán"}
                              </span>
                            </td>

                            <td className="p-3 font-semibold text-amber-700">
                              {formatPrice(
                                Number(
                                  item.remaining_amount || item.package_price,
                                ),
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {loading && (
                  <div className="py-10 text-center text-gray-400">
                    Đang tải dữ liệu...
                  </div>
                )}

                {!loading && profileList.length === 0 && (
                  <div className="py-10 text-center text-gray-400">
                    Không có dữ liệu
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-gray-500">
                {profileList.length === 0 ? 0 : (page - 1) * limit + 1}–
                {Math.min(page * limit, profileList.length)} trên{" "}
                {profileList.length} bản ghi
              </p>

              <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="font-medium">Số hàng mỗi trang</span>

                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-10 rounded-xl border border-gray-200 bg-white px-4 outline-none"
                  >
                    <option value={10}>10</option>

                    <option value={20}>20</option>

                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Trang {page} trên {totalPages || 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={page === 1}
                      onClick={() => setPage(1)}
                    >
                      <ChevronsLeft size={18} />
                    </button>

                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => prev - 1)}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      <ChevronRight size={18} />
                    </button>

                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={page === totalPages || totalPages === 0}
                      onClick={() => setPage(totalPages)}
                    >
                      <ChevronsRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DISCOUNT */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mt-4">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <BadgePercent size={22} />
              </div>

              <div>
                <h2 className="font-bold text-black">Mã giảm giá</h2>

                <p className="text-sm text-gray-500">
                  Các ưu đãi phù hợp với khách hàng
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {discounts?.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Không có mã giảm giá khả dụng
                  </p>

                  {paymentSummaryData?.discount_id && (
                    <p className="mt-2 text-xs text-orange-600">
                      Đơn thanh toán này đã áp dụng mã giảm giá trước đó nên
                      không thể dùng thêm.
                    </p>
                  )}
                </div>
              )}

              {discounts?.map((discount: any) => {
                const active = selectedDiscount?.id === discount.id;

                return (
                  <button
                    key={discount.id}
                    onClick={() =>
                      setSelectedDiscount(active ? null : discount)
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-amber-600 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-black">
                        {discount.code}
                      </h3>

                      {active && (
                        <CheckCircle2 size={18} className="text-amber-700" />
                      )}
                    </div>

                    <p className="text-sm text-gray-500">{discount.name}</p>

                    <div className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {discount.discount_type === "PERCENT"
                        ? `Giảm ${discount.discount_value}%`
                        : `Giảm ${formatPrice(discount.discount_value)}`}
                    </div>
                  </button>
                );
              })}
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
                <h2 className="font-bold text-black">Thông tin thanh toán</h2>

                <p className="text-sm text-gray-500">
                  Chi tiết thanh toán dịch vụ
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 text-sm">
                <span className="text-gray-500">Tổng tiền dịch vụ</span>

                <span className="font-semibold">
                  {formatPrice(paymentSummary.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3 text-sm">
                <span className="text-gray-500">Tổng giảm giá</span>

                <span className="font-semibold text-green-600">
                  -{formatPrice(paymentSummary.discount)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3 text-base">
                <span className="font-semibold text-black">Thành tiền</span>

                <span className="text-xl font-bold text-amber-700">
                  {formatPrice(paymentSummary.final)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3 text-sm">
                <span className="text-gray-500">Đã thanh toán</span>

                <span className="font-semibold text-blue-600">
                  {formatPrice(paymentSummary.paid)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-3 text-base">
                <span className="font-semibold text-black">
                  Còn cần thanh toán
                </span>

                <span className="text-xl font-bold text-red-500">
                  {formatPrice(paymentSummary.remaining)}
                </span>
              </div>

              {paymentSummary.paid > 0 && paymentSummary.remaining > 0 && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-orange-700">
                    Khách hàng đã thanh toán một phần
                  </p>

                  <p className="mt-1 text-sm text-orange-600">
                    Còn lại {formatPrice(paymentSummary.remaining)} cần thanh
                    toán tiếp.
                  </p>
                </div>
              )}

              {/* PAYMENT METHOD */}
              <div className="pt-2">
                <p className="mb-3 text-sm font-semibold text-black">
                  Phương thức thanh toán
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;

                    return (
                      <button
                        key={method.key}
                        onClick={() => setPaymentMethod(method.key as any)}
                        className={`rounded-2xl border p-4 transition ${
                          paymentMethod === method.key
                            ? "border-amber-700 bg-amber-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon size={22} />

                          <span className="text-sm font-medium">
                            {method.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PAID AMOUNT */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Số tiền khách thanh toán
                </label>

                <input
                  type="number"
                  disabled={paymentMethod === "ZALOPAY"}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* NOTE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Ghi chú
                </label>

                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: khách thanh toán trước 50%, phần còn lại thanh toán sau buổi thứ 3..."
                  className="w-full rounded-2xl border border-gray-200 p-4 text-sm outline-none transition focus:border-black"
                />
              </div>

              {/* QR */}
              {paymentMethod === "BANK_TRANSFER" && (
                <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-52 w-52 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                      <img
                        src="../public/z7890128759983_fed34790b398a5823c444e4bf5f8ed7e.jpg"
                        alt=""
                      />
                    </div>

                    <div className="text-center">
                      <p className="font-semibold text-black">
                        Quét mã QR để thanh toán
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Hệ thống QR động ngân hàng sẽ phát triển sau
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "ZALOPAY" && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow">
                      <CreditCard size={42} className="text-blue-600" />
                    </div>

                    <div className="text-center">
                      <h3 className="font-bold text-blue-700">
                        Thanh toán qua ZaloPay
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        Bạn sẽ được chuyển đến cổng thanh toán ZaloPay để hoàn tất
                        giao dịch.
                      </p>

                      <div className="mt-4 rounded-xl bg-white p-4 border">
                        <p className="text-xs text-gray-500">
                          Số tiền thanh toán
                        </p>

                        <p className="mt-1 text-2xl font-bold text-red-600">
                          {formatPrice(zaloPayAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT HISTORY */}
              {paymentSummaryData?.transactions?.length > 0 && (
                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-black">
                      Lịch sử thanh toán
                    </h3>

                    <span className="text-xs text-gray-500">
                      {paymentSummaryData.transactions.length} lần
                    </span>
                  </div>

                  <div className="space-y-3">
                    {paymentSummaryData.transactions.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                      >
                        <div>
                          <p className="text-sm font-semibold uppercase text-black">
                            {item.payment_method}
                          </p>

                          <p className="text-xs text-gray-500">
                            {new Date(item.paid_at).toLocaleString("vi-VN")}
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
              )}

              {/* ACTION */}
              <button
                onClick={handleCreatePayment}
                disabled={loading || redirectingZaloPay}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-amber-700 text-sm font-semibold text-white transition hover:bg-black"
              >
                {redirectingZaloPay
                  ? "Đang chuyển đến Zalopay..."
                  : paymentMethod === "ZALOPAY"
                    ? "Thanh toán qua Zalopay"
                    : "Xác nhận thanh toán"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
