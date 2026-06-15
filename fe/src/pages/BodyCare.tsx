import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Droplets,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";

const bodyConcerns = [
  "Da lưng hoặc ngực dễ nổi mụn do mồ hôi, ma sát quần áo và bít tắc lỗ chân lông.",
  "Da body xỉn màu, khô ráp do nắng, tẩy tế bào chết sai cách hoặc thiếu dưỡng ẩm.",
  "Vùng khuỷu tay, đầu gối, bikini dễ sạm do ma sát và chăm sóc không đều.",
  "Cơ thể mệt mỏi, căng cơ sau làm việc lâu hoặc vận động cường độ cao.",
];

const protocol = [
  "Kiểm tra vùng da body, xác định mụn, sạm, khô ráp hoặc nhu cầu thư giãn.",
  "Làm sạch, xông ấm, tẩy tế bào chết dịu nhẹ và xử lý vùng bít tắc khi phù hợp.",
  "Ủ dưỡng, massage hoặc kết hợp công nghệ hỗ trợ săn chắc theo gói đã chọn.",
  "Hướng dẫn tắm rửa, dưỡng ẩm, thay đổi thói quen mặc đồ và lịch chăm sóc lại.",
];

const prices = [
  ["Chăm sóc da body thư giãn", "500.000đ - 900.000đ/buổi"],
  ["Làm sạch mụn lưng", "700.000đ - 1.400.000đ/buổi"],
  ["Dưỡng sáng body", "900.000đ - 2.000.000đ/buổi"],
  ["Săn chắc, detox body", "1.200.000đ - 3.000.000đ/buổi"],
];

export default function BodyCare() {
  return (
    <div className="bg-white text-slate-900">
      <Navbar />

      <section
        className="min-h-[78vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,23,42,.82), rgba(15,23,42,.36)), url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-24 text-white">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Droplets size={16} />
            Body care, detox và chăm sóc da toàn thân
          </p>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-bold leading-tight">
            Chăm sóc body cho da sạch, mịn và cơ thể nhẹ nhõm hơn
          </h1>
          <p className="mt-6 max-w-2xl text-slate-100 leading-8">
            Liệu trình tập trung vào làm sạch, dưỡng da, thư giãn và cải thiện
            các vùng dễ sạm, mụn lưng hoặc khô ráp. Trước khi thực hiện, chuyên
            viên kiểm tra vùng da để chọn mức tác động phù hợp.
          </p>
          <Link
            to="/booking"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Đặt lịch chăm sóc body
            <CalendarCheck size={18} />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Nguyên nhân thường gặp
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Body cũng cần được chăm sóc đúng cách
            </h2>
            <p className="mt-5 leading-8 text-gray-600">
              Mồ hôi, ma sát, sản phẩm tắm gội còn sót lại và chống nắng chưa
              đều có thể làm da body xỉn màu, nổi mụn hoặc thô ráp. Chăm sóc
              định kỳ giúp làm sạch tốt hơn và duy trì cảm giác dễ chịu.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {bodyConcerns.map((item) => (
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
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Cách thực hiện tại cơ sở
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Quy trình body care theo từng vùng cần chăm sóc
            </h2>
            <div className="mt-7 space-y-4">
              {protocol.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-lg border border-slate-200 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80"
              alt="Chăm sóc body tại spa"
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#2F2A26]  text-white">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-300">
              Duy trì tại nhà
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Cách hạn chế mụn và sạm body tái phát
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {[
              "Tắm sau khi đổ mồ hôi, thay đồ thoáng và giặt ga gối thường xuyên.",
              "Dưỡng ẩm sau tắm, chống nắng vùng hở và tránh chà xát quá mạnh.",
              "Không tự nặn mụn lưng viêm; nên kiểm tra nếu mụn đau, lan rộng hoặc tái phát dai dẳng.",
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
              Chi phí thay đổi theo vùng chăm sóc, thời lượng, sản phẩm sử dụng
              và mức độ mụn hoặc sạm da.
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
            <h2 className="text-3xl font-bold">Cần chọn gói body phù hợp?</h2>
            <p className="mt-3 text-amber-50">Đặt lịch để được kiểm tra vùng da và tư vấn trước khi làm.</p>
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
