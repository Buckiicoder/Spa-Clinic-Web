import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";

const needs = [
  "Căng vai gáy, mỏi lưng do ngồi lâu hoặc làm việc với máy tính.",
  "Cảm giác stress, khó thư giãn hoặc ngủ không sâu sau ngày dài.",
  "Cơ bắp mỏi sau vận động, di chuyển nhiều hoặc đứng lâu.",
  "Muốn chăm sóc cơ thể nhẹ nhàng trong không gian yên tĩnh.",
];

const process = [
  "Hỏi vùng đau mỏi, mức lực mong muốn và các chống chỉ định cần lưu ý.",
  "Ngâm chân hoặc làm ấm cơ thể để thư giãn trước khi massage.",
  "Thực hiện kỹ thuật xoa bóp, ấn day, kéo giãn nhẹ theo từng vùng.",
  "Dặn uống nước, nghỉ ngơi và theo dõi phản ứng cơ thể sau buổi.",
];

const prices = [
  ["Massage thư giãn 60 phút", "350.000đ - 550.000đ"],
  ["Massage body 90 phút", "550.000đ - 850.000đ"],
  ["Vai gáy, cổ lưng chuyên sâu", "300.000đ - 650.000đ"],
  ["Combo xông hơi và massage", "700.000đ - 1.200.000đ"],
];

export default function RelaxMassage() {
  return (
    <div className="bg-white text-slate-900">
      <Navbar />

      <section
        className="min-h-[78vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,23,42,.82), rgba(15,23,42,.38)), url('https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-24 text-white">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <HeartPulse size={16} />
            Massage thư giãn và phục hồi năng lượng
          </p>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-bold leading-tight">
            Giảm căng cơ, thư giãn tinh thần và chăm sóc cơ thể nhẹ nhàng
          </h1>
          <p className="mt-6 max-w-2xl text-slate-100 leading-8">
            Massage có thể hỗ trợ thư giãn, giảm cảm giác đau mỏi cơ và cải
            thiện sự dễ chịu sau ngày dài. Cơ sở sẽ hỏi tình trạng sức khỏe để
            chọn kỹ thuật và lực tay phù hợp.
          </p>
          <Link
            to="/booking"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Đặt lịch massage
            <CalendarCheck size={18} />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Khi nào nên massage
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Phù hợp khi cơ thể cần nghỉ và phục hồi
            </h2>
            <p className="mt-5 leading-8 text-gray-600">
              Massage không thay thế điều trị y khoa, nhưng có thể giúp cơ thể
              thư giãn, giảm căng cơ và cải thiện cảm giác khỏe khoắn. Người có
              sốt, viêm cấp, chấn thương mới hoặc bệnh lý đặc biệt nên hỏi ý
              kiến chuyên môn trước.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {needs.map((item) => (
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
              Trải nghiệm tại cơ sở
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Quy trình thư giãn nhưng vẫn có bước kiểm tra an toàn
            </h2>
            <div className="mt-7 space-y-4">
              {process.map((step, index) => (
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
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
              alt="Massage thư giãn tại spa"
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#2F2A26]  text-white">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-300">
              Sau buổi massage
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Duy trì cảm giác thư giãn lâu hơn
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {[
              "Uống nước, nghỉ nhẹ và tránh vận động quá nặng ngay sau buổi.",
              "Giãn cơ, ngủ đủ và điều chỉnh tư thế ngồi để hạn chế đau mỏi quay lại.",
              "Nếu đau nhói, tê bì hoặc triệu chứng kéo dài, nên kiểm tra y tế thay vì chỉ massage.",
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
              Giá phụ thuộc thời lượng, kỹ thuật, tinh dầu và combo xông hơi
              hoặc chăm sóc body kèm theo.
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
            <h2 className="text-3xl font-bold">Cơ thể đang cần được nghỉ ngơi?</h2>
            <p className="mt-3 text-amber-50">Đặt lịch massage và chọn thời lượng phù hợp.</p>
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
