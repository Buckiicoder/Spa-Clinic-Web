import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  Phone,
  ShieldCheck,
  // Sparkles,
  Star,
  Stethoscope,
  Timer,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import Navbar from "../components/Navbar";
import {
  selectUser,
  selectPendingRatings,
  selectAuth,
  fetchPendingRatings,
} from "../features/auth/authSlice";
import PendingRatingsModal from "../modal/PendingRatingModal";
import RatingReminderModal from "../modal/RatingReminderModal";

const services = [
  {
    path: "/beauty",
    title: "Làm đẹp da",
    desc: "Tư vấn mụn, thâm, nám, tàn nhang và phục hồi hàng rào bảo vệ da theo từng tình trạng.",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
    price: "Từ 450.000đ",
  },
  {
    path: "/hair",
    title: "Triệt lông công nghệ cao",
    desc: "Giảm lông lâu dài bằng năng lượng ánh sáng, có bước test da và hướng dẫn chăm sóc sau buổi.",
    image:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80",
    price: "Từ 250.000đ",
  },
  {
    path: "/body",
    title: "Chăm sóc Body",
    desc: "Làm sạch, dưỡng sáng, chăm sóc vùng lưng, body acne và liệu trình thư giãn phục hồi.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
    price: "Từ 500.000đ",
  },
  {
    path: "/massage",
    title: "Massage thư giãn",
    desc: "Kỹ thuật xoa bóp giảm căng cơ, cải thiện cảm giác thư giãn và hỗ trợ phục hồi năng lượng.",
    image:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80",
    price: "Từ 350.000đ",
  },
];

const clinicHighlights = [
  { icon: Stethoscope, label: "Soi da & tư vấn", value: "Cá nhân hóa" },
  { icon: ShieldCheck, label: "Quy trình", value: "An toàn, rõ bước" },
  { icon: Users, label: "Đội ngũ", value: "Chuyên viên kinh nghiệm" },
  { icon: Timer, label: "Đặt lịch", value: "Nhanh trong ngày" },
];

export default function Home() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const pendingRatings = useAppSelector(selectPendingRatings);
  const isAuthenticated = useAppSelector(selectAuth);
  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [openRatingModal, setOpenRatingModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    dispatch(fetchPendingRatings());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (pendingRatings.length > 0 && isAuthenticated) {
      setOpenReminderModal(true);
    }
  }, [pendingRatings, isAuthenticated]);

  const reminderKey = `rating_reminder_${user?.id}`;

  useEffect(() => {
    if (
      pendingRatings.length > 0 &&
      isAuthenticated &&
      !sessionStorage.getItem(reminderKey)
    ) {
      setOpenReminderModal(true);
      sessionStorage.setItem(reminderKey, "shown");
    }
  }, [pendingRatings, isAuthenticated, reminderKey]);

  return (
    <div className="font-sans text-slate-900 bg-white">
      <Navbar />

      <section
        id="home"
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(90deg,#8C7967 0%, #B7AEA3 45%, #D8D3CC 100%)",
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 text-white">
          <div className="max-w-xl md:ml-[18%]">
            <h1 className="leading-none font-bold">
              <span className="block text-[52px] md:text-[64px] text-white">
                Spa & Clinic
              </span>

              <span className="block text-[52px] md:text-[64px] text-[#F4A621]">
                Chuẩn Y Khoa
              </span>
            </h1>
            <p className="mt-5 text-sm md:text-base text-white/80 leading-7 max-w-lg">
              Mang đến vẻ đẹp tự nhiên – thư giãn toàn diện – công nghệ hiện đại
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
    document
      .getElementById("services")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }}
                className="
  bg-[#F4A621]
  hover:bg-[#E29400]
  text-white
  px-8
  py-3
  rounded-full
  text-sm
  font-semibold
  transition
"
              >
                Khám phá dịch vụ
              </button>
              <button
                onClick={() => {
    document
      .getElementById("contact")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }}
                className="
  border
  border-white
  text-white
  px-8
  py-3
  rounded-full
  text-sm
  font-semibold
  hover:bg-white/10
  transition
"
              >
                Liên hệ ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#2F2A26] py-5 text-white">
        <div className="max-w-7xl mx-auto grid gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {clinicHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto grid gap-12 px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="text-base font-semibold uppercase tracking-[.24em] text-[#F4A621]">
              Về cơ sở
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              SpaClinic tập trung vào tư vấn rõ ràng trước khi làm đẹp
            </h2>
            <p className="mt-5 text-gray-600 leading-8">
              Khách hàng được ghi nhận tình trạng, soi da hoặc kiểm tra vùng
              điều trị, tư vấn lựa chọn dịch vụ, chi phí dự kiến và hướng dẫn
              chăm sóc sau buổi. Mục tiêu là giúp bạn hiểu làn da, chọn liệu
              trình phù hợp và duy trì kết quả tốt hơn tại nhà.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Tư vấn tình trạng"],
                ["02", "Đề xuất phác đồ"],
                ["03", "Theo dõi sau buổi"],
              ].map(([step, title]) => (
                <div
                  key={step}
                  className="rounded-lg border border-[#E5DED4] p-5"
                >
                  <p className="text-sm font-bold text-amber-600">{step}</p>
                  <p className="mt-2 font-semibold">{title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
              alt="Không gian tư vấn và chăm sóc da tại spa clinic"
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
                Dịch vụ nổi bật
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold">
                Chọn đúng nhu cầu, đọc rõ thông tin trước khi đặt lịch
              </h2>
            </div>
            <Link
              to="/booking"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-400"
            >
              Đặt lịch ngay
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold text-amber-600">
                    {item.price}
                  </p>
                  <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {item.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-amber-600">
                    Xem chi tiết
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Khách hàng nhận được gì
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Dịch vụ không chỉ là một buổi làm đẹp
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {[
              "Được hỏi kỹ tiền sử kích ứng, thói quen chăm sóc và mục tiêu điều trị.",
              "Có hướng dẫn chăm sóc tại nhà sau liệu trình để giảm kích ứng và tái phát.",
              "Chi phí được trao đổi trước, tùy vùng điều trị và mức độ tình trạng.",
            ].map((text) => (
              <div
                key={text}
                className="rounded-lg border border-slate-200 p-6"
              >
                <Star className="text-amber-500" size={22} />
                <p className="mt-4 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-slate-950 py-20 text-white">
        <div className="max-w-7xl mx-auto grid gap-8 px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-500">
              Liên hệ & đặt lịch
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Cần tư vấn tình trạng da hoặc chọn dịch vụ phù hợp?
            </h2>
            <div className="mt-6 flex flex-col gap-3 text-slate-300 sm:flex-row sm:gap-8">
              <span className="inline-flex items-center gap-2">
                <Phone size={18} />
                0909 999 999
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={18} />
                Thành phố Hà Nội
              </span>
            </div>
          </div>
          <Link
            to="/booking"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-3 font-semibold transition hover:bg-amber-400"
          >
            Đặt lịch ngay
            <CalendarCheck size={18} />
          </Link>
        </div>
      </section>

      <RatingReminderModal
        open={openReminderModal}
        total={pendingRatings.length}
        onClose={() => setOpenReminderModal(false)}
        onConfirm={() => {
          setOpenReminderModal(false);
          setOpenRatingModal(true);
        }}
      />

      <PendingRatingsModal
        open={openRatingModal}
        onClose={() => setOpenRatingModal(false)}
      />
    </div>
  );
}
