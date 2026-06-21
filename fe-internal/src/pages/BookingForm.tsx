import { useState, useEffect } from "react";
// import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import {
  checkInBooking,
  createBookingStaff,
  updateBooking,
  searchCustomers,
  checkBookingCapacity,
  getDayCapacity,
  selectBookingCapacity,
  selectDayCapacity,
  selectCheckingCapacity,
} from "../features/internalBooking/bookingSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hook";
import { selectUser } from "../features/auth/authSlice";
import {
  fetchServices,
  selectMiddleServices,
  fetchMiddleServices,
} from "../features/service/serviceSlice";
import { getBookingByIdAPI } from "../features/internalBooking/bookingAPI";

export default function BookingForm() {
  const { id } = useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // view | edit
  const isView = mode === "view";
  const isEdit = !!id;

  const action = searchParams.get("action");
  const services = useSelector(selectMiddleServices);
  const capacity = useSelector(selectBookingCapacity);
  const dayCapacity = useSelector(selectDayCapacity);
  const checkingCapacity = useSelector(selectCheckingCapacity);
  const user = useSelector(selectUser);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({ phone: "" });
  const customers = useSelector(
    (state: any) => state.internalBooking.customers,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    quantity: 1,

    // 🔥 booking extra
    note: "",
    source: "",
    customer_note: "",
    customer_status: "",
    referrer_id: "",
  });

  useEffect(() => {
    if (action === "checkin" && id && user.id) {
      dispatch(checkInBooking(id, user.id))
        .unwrap()
        .then((res) => {
          setBooking(res);
        });
    }
  }, [action, id, dispatch, user.id]);

  // load services
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMiddleServices());
  }, [dispatch]);

  useEffect(() => {
    if (!form.date) return;

    dispatch(
      getDayCapacity({
        bookingDate: form.date,
        quantity: Number(form.quantity),
      }),
    );
  }, [form.date, form.quantity, dispatch]);

  useEffect(() => {
    if (!form.date || !form.time) return;

    dispatch(
      checkBookingCapacity({
        booking_date: form.date,
        booking_time: form.time,
        quantity: Number(form.quantity),
      }),
    );
  }, [form.date, form.time, form.quantity, dispatch]);

  useEffect(() => {
    if (capacity && !capacity.available) {
      setForm((prev: any) => ({
        ...prev,
        time: "",
      }));
    }
  }, [capacity]);

  const formatDateLocal = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-CA"); // ✅ yyyy-mm-dd đúng timezone VN
  };

  // load booking (edit mode)
  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await getBookingByIdAPI(id);
        const b = res.data;

        setBooking(b); // 🔥 QUAN TRỌNG
        setCheckedIn(b.status === "CHECKED_IN");

        setForm({
          name: b.name || "",
          phone: b.phone || "",
          email: b.email || "",
          service: b.service_id,
          date: formatDateLocal(b.booking_date), // ✅ FIX
          time: b.booking_time?.slice(0, 5),
          quantity: b.quantity,

          note: b.note || "",

          // ✅ customer đúng DB
          source: b.source || "",
          customer_note: b.customer_note || "",
          customer_status: b.customer_status || "",
          referrer_id: b.referrer_id || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // validate phone
  const validatePhone = (value: string) => {
    const phoneRegex = /^(03|09|05|07|08)\d{8}$/;

    if (!value) {
      setError({ phone: "Vui lòng nhập số điện thoại" });
    } else if (value.length !== 10) {
      setError({ phone: "SĐT phải đủ 10 số" });
    } else if (!phoneRegex.test(value)) {
      setError({ phone: "Phải bắt đầu bằng 03 hoặc 09" });
    } else {
      setError({ phone: "" });
    }
  };

  // search customer
  const searchCustomer = async (phone: string) => {
    if (phone.length < 3) {
      return;
    }

    dispatch(searchCustomers({ phone }));
    setShowDropdown(true);
  };

  // handle change
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    const newValue =
      type === "checkbox"
        ? checked
        : name === "quantity"
          ? Number(value)
          : value;

    const newForm = { ...form, [name]: newValue };

    if (name === "phone") {
      const onlyNumber = value.replace(/\D/g, "").slice(0, 10);
      newForm.phone = onlyNumber;

      validatePhone(onlyNumber);
      searchCustomer(onlyNumber);
    }

    setForm(newForm);
  };

  // select customer
  const handleSelectCustomer = (c: any) => {
    setForm((prev: any) => ({
      ...prev,
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",

      // nếu API trả thêm
      source: c.source || "",
      customer_note: c.customer_note || "",
      customer_status: c.customer_status || "",
    }));

    setShowDropdown(false);
  };

  // const toISOStringLocal = (date: string, time: string) => {
  //   return new Date(`${date}T${time}:00`).toISOString();
  // };

  const handleToggleCheckIn = async () => {
    if (!id || !user.id) return;

    // nếu đã checkin rồi thì không cho undo (tuỳ business)
    if (checkedIn) return;

    try {
      const res = await dispatch(checkInBooking(id)).unwrap();

      setBooking(res);
      setCheckedIn(true);

      alert("Đã check-in khách");
    } catch (err: any) {
      alert(err?.message || "Check-in thất bại");
    }
  };

  // submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    validatePhone(form.phone);
    if (error.phone) return;

    if (Number(form.quantity) > 3) {
      alert("Một lần đặt lịch chỉ tối đa 3 khách");
      return;
    }

    const bookingDateTime = new Date(`${form.date}T${form.time}:00`);

    if (bookingDateTime < new Date()) {
      alert("Không thể đặt lịch trong quá khứ");
      return;
    }

    if (capacity && !capacity.available) {
      alert("Khung giờ này không đủ sức chứa");
      return;
    }

    try {
      if (isEdit) {
        await dispatch(
          updateBooking({
            id,
            data: {
              service_id: Number(form.service),
              booking_date: form.date,
              booking_time: form.time,
              quantity: Number(form.quantity),
              note: form.note,
              source: form.source,
              customer_note: form.customer_note,
              customer_status: form.customer_status,
              referrer_id: form.referrer_id || null,
            },
          }),
        );

        alert("Cập nhật thành công");
      } else {
        await dispatch(
          createBookingStaff({
            name: form.name,
            phone: form.phone,
            email: form.email,

            service_id: Number(form.service),
            booking_date: form.date,
            booking_time: form.time,
            quantity: form.quantity,

            note: form.note,

            // ✅ customer
            source: form.source,
            customer_note: form.customer_note,
            customer_status: form.customer_status,
            referrer_id: form.referrer_id,
          }),
        );

        alert("Đặt lịch thành công");

        // reset
        setForm({
          name: "",
          phone: "",
          email: "",
          service: "",
          date: "",
          time: "",
          quantity: 1,

          note: "",

          source: "",
          customer_note: "",
          customer_status: "",
          referrer_id: "",
        });
      }

      navigate("/checklich");
    } catch (err: any) {
      alert(err?.message || "Thất bại");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const slotMap = Object.fromEntries(
    dayCapacity.map((slot: any) => [slot.time, slot]),
  );

  const timeSlots = [];

  let hour = 8;
  let minute = 0;

  while (hour < 20 || (hour === 19 && minute <= 30)) {
    timeSlots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );

    minute += 30;

    if (minute === 60) {
      hour++;
      minute = 0;
    }
  }

  const today = new Date().toLocaleDateString("en-CA");

  const now = new Date();

  const currentTime =
    `${String(now.getHours()).padStart(2, "0")}:` +
    `${String(now.getMinutes()).padStart(2, "0")}`;

  const isPastTime = (date: string, time: string) => {
    if (date !== today) return false;

    return time < currentTime;
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-6 py-20">
      {/* <Navbar /> */}

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-amber-600 mb-6 text-center">
          {isEdit ? "Cập nhật đặt lịch" : "Đặt lịch"}
        </h1>

        {isView && booking && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border">
            <p>
              <b>Mã:</b> {booking.booking_code}
            </p>
            <p>
              <b>Trạng thái:</b> {booking.status}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME + PHONE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div className="relative">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Số điện thoại
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3"
              />

              {error.phone && (
                <p className="text-red-500 text-sm mt-1">{error.phone}</p>
              )}

              {showDropdown && customers.length > 0 && (
                <div className="absolute z-10 bg-white border rounded-xl shadow w-full mt-1 max-h-48 overflow-y-auto">
                  {customers.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="px-4 py-2 hover:bg-amber-100 cursor-pointer text-sm"
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-gray-500">{c.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EMAIL
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div> */}
          </div>

          {/* SERVICE */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn dịch vụ
            </label>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              required
              className="w-full rounded-xl border px-4 py-3"
            >
              <option value="">Vui lòng chọn dịch vụ</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* QUANTITY */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Số người
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={(e) => {
                  const value = Math.min(
                    3,
                    Math.max(1, Number(e.target.value)),
                  );

                  setForm((prev: any) => ({
                    ...prev,
                    quantity: value,
                  }));
                }}
                min={1}
                max={3}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Người giới thiệu
              </label>
              <input
                name="referrer_id"
                value={form.referrer_id}
                onChange={handleChange}
                placeholder="Người giới thiệu (ID)"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Chọn ngày
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            {/* TIME */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Chọn giờ
              </label>
              <select
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full rounded-xl border px-4 py-3"
              >
                <option value="">-- Chọn giờ --</option>

                {timeSlots.map((time) => {
                  const slot = slotMap[time];

                  const disabledByCapacity = slot && !slot.available;

                  const disabledByPast = isPastTime(form.date, time);

                  const disabled = disabledByCapacity || disabledByPast;

                  return (
                    <option key={time} value={time} disabled={disabled}>
                      {disabledByPast
                        ? `${time} (Đã qua)`
                        : disabledByCapacity
                          ? `${time} (Đã đầy)`
                          : `${time} (còn ${slot?.remaining ?? "-"} chỗ)`}
                    </option>
                  );
                })}
              </select>

              {capacity && !capacity.available && (
                <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-3">
                  <div className="font-medium text-red-700">
                    Khung giờ này không đủ sức chứa
                  </div>

                  <div className="text-sm text-red-600 mt-1">
                    Đang có {capacity.bookingCount}/{capacity.maxCapacity} khách
                  </div>

                  <div className="text-sm text-red-600">
                    Còn lại {capacity.remaining} chỗ
                  </div>
                </div>
              )}

              {capacity &&
                !capacity.available &&
                capacity.suggestions?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Khung giờ còn trống:</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {capacity.suggestions.map((slot: any) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() =>
                            setForm((prev: any) => ({
                              ...prev,
                              time: slot.time,
                            }))
                          }
                          className="px-3 py-1 rounded-full bg-green-100 text-green-700"
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
          {/* DATE */}

          {/* QUANTITY */}
          {/* <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            disabled={isView}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          /> */}

          {/* CUSTOMER INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Nguồn khách
              </label>
              <input
                name="source"
                value={form.source}
                onChange={handleChange}
                placeholder="Nguồn khách (Facebook, Zalo...)"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Trạng thái khách
              </label>
              <input
                name="customer_status"
                value={form.customer_status}
                onChange={handleChange}
                placeholder="Trạng thái khách (new, old...)"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Ghi chú khách hàng
              </label>
              <textarea
                name="customer_note"
                value={form.customer_note}
                onChange={handleChange}
                placeholder="Ghi chú khách hàng"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            {/* BOOKING NOTE */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Ghi chú lịch hẹn
              </label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Ghi chú cho lịch hẹn (dị ứng, yêu cầu đặc biệt...)"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
          </div>

          {/* CHECK-IN TOGGLE */}

          <div className="flex items-center justify-start bg-whiterounded-xl">
            <span className=" text-sm font-medium text-gray-700 pr-5">
              Khách đã đến
            </span>

            <button
              type="button"
              onClick={handleToggleCheckIn}
              className={`relative h-7 w-12 rounded-full transition ${
                checkedIn ? "bg-amber-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  checkedIn ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {!isView && (
            <button className="w-full bg-amber-500 text-white py-3 rounded-xl">
              {isEdit ? "Cập nhật" : "Đặt lịch"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
