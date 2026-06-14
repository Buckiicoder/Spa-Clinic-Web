import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";

const concerns = [
  "Lông rậm do cơ địa, hormone, di truyền hoặc thói quen cạo nhổ lặp lại.",
  "Viêm nang lông, lông mọc ngược và thâm da sau cạo hoặc waxing.",
  "Vùng da dễ kích ứng khi dùng kem tẩy lông hoặc wax nóng.",
  "Nhu cầu giảm lông lâu dài ở nách, tay, chân, bikini, mép hoặc lưng.",
];

const steps = [
  "Tư vấn vùng triệt, màu da, màu lông và tiền sử kích ứng.",
  "Làm sạch, cạo ngắn vùng lông và che chắn vùng nhạy cảm.",
  "Điều chỉnh mức năng lượng, test điểm nhỏ rồi thực hiện theo vùng.",
  "Làm dịu da, dặn tránh nắng, tránh wax/nhổ và hẹn buổi tiếp theo.",
];

const prices = [
  ["Nách hoặc mép", "250.000đ - 500.000đ/buổi"],
  ["Tay hoặc chân", "700.000đ - 1.800.000đ/buổi"],
  ["Bikini", "800.000đ - 2.000.000đ/buổi"],
  ["Combo nhiều vùng", "2.000.000đ - 6.000.000đ/liệu trình"],
];

export default function HairRemoval() {
  return (
    <div className="bg-white text-slate-900">
      <Navbar />

      <section
        className="min-h-[78vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,23,42,.82), rgba(15,23,42,.38)), url('https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-24 text-white">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Zap size={16} />
            Triệt lông bằng công nghệ ánh sáng
          </p>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-bold leading-tight">
            Giảm lông lâu dài, hạn chế viêm nang lông và lông mọc ngược
          </h1>
          <p className="mt-6 max-w-2xl text-slate-100 leading-8">
            Công nghệ triệt lông dùng năng lượng ánh sáng tác động vào nang lông
            đang ở pha phát triển. Hiệu quả thường cần nhiều buổi và có thể cần
            duy trì tùy cơ địa, vùng điều trị và màu lông.
          </p>
          <Link
            to="/booking"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Đặt lịch test da
            <CalendarCheck size={18} />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Khi nào nên cân nhắc
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Triệt lông phù hợp khi bạn muốn giảm lông theo hướng lâu dài
            </h2>
            <p className="mt-5 leading-8 text-gray-600">
              Laser hoặc IPL thường hiệu quả hơn với lông có sắc tố đậm. Da vừa
              rám nắng, đang kích ứng hoặc có bệnh da hoạt động cần được kiểm
              tra trước để giảm nguy cơ bỏng, thâm hoặc rát kéo dài.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {concerns.map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white p-5">
                <CheckCircle2 className="text-amber-600" size={22} />
                <p className="mt-4 text-sm leading-6 text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto grid gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80"
              alt="Tư vấn triệt lông công nghệ cao"
              className="h-[520px] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Cách điều trị tại cơ sở
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Quy trình triệt lông chú trọng test da và chăm sóc sau buổi
            </h2>
            <div className="mt-7 space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-lg border border-slate-200 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#2F2A26] text-white">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-300">
              Hạn chế tái phát và kích ứng
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Chăm sóc đúng giữa các buổi triệt lông
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {[
              "Không wax hoặc nhổ lông giữa liệu trình; nếu cần chỉ cạo nhẹ theo hướng dẫn.",
              "Tránh nắng, sauna, tẩy tế bào chết mạnh và sản phẩm gây rát trong 24-48 giờ đầu.",
              "Dưỡng ẩm, làm dịu da và báo cơ sở nếu có phồng rộp, đau rát hoặc thâm kéo dài.",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-6">
                <ShieldCheck className="text-amber-300" size={22} />
                <p className="mt-4 text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <ClipboardList className="text-amber-600" size={34} />
            <h2 className="mt-4 text-3xl font-bold">Giá tham khảo</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Giá phụ thuộc vùng triệt, mật độ lông, màu da, số buổi và gói duy
              trì. Cơ sở sẽ báo chi phí sau khi kiểm tra vùng điều trị.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {prices.map(([name, price]) => (
              <div key={name} className="grid gap-2 border-b border-slate-200 p-5 last:border-b-0 sm:grid-cols-2">
                <p className="font-semibold">{name}</p>
                <p className="text-amber-700 sm:text-right">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#2F2A26] py-16 text-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Chưa biết vùng da có phù hợp để triệt?</h2>
            <p className="mt-3 text-amber-50">Đặt lịch test da và nghe tư vấn số buổi dự kiến.</p>
          </div>
          <Link
            to="/booking"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Đặt lịch ngay
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
