import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";

const concerns = [
  "Mụn viêm, mụn ẩn, dầu thừa và lỗ chân lông bí tắc",
  "Thâm sau mụn, sạm da, nám, tàn nhang và da không đều màu",
  "Da yếu, khô căng, bong tróc hoặc dễ kích ứng sau treatment",
  "Dấu hiệu lão hóa sớm, da thiếu đàn hồi và kém rạng rỡ",
];

const treatmentSteps = [
  "Soi da, hỏi thói quen chăm sóc và tiền sử kích ứng.",
  "Làm sạch, xử lý nhân mụn hoặc vùng sắc tố khi phù hợp.",
  "Kết hợp phục hồi, peel/ánh sáng/laser hoặc hoạt chất theo tình trạng.",
  "Dặn dò chống nắng, phục hồi hàng rào da và lịch tái khám.",
];

const prices = [
  ["Chăm sóc da cơ bản", "450.000đ - 700.000đ/buổi"],
  ["Điều trị mụn chuyên sâu", "700.000đ - 1.500.000đ/buổi"],
  ["Thâm, nám, tàn nhang", "1.200.000đ - 3.500.000đ/buổi"],
  ["Phục hồi, trẻ hóa da", "900.000đ - 2.800.000đ/buổi"],
];

export default function BeautySkin() {
  return (
    <div className="bg-white text-amber-900">
      <Navbar />

      <section
        className="min-h-[78vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,23,42,.82), rgba(15,23,42,.42)), url('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 pt-24 text-white">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Sparkles size={16} />
            Làm đẹp da chuẩn tư vấn cá nhân hóa
          </p>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-bold leading-tight">
            Chăm sóc mụn, thâm nám và phục hồi da theo từng tình trạng
          </h1>
          <p className="mt-6 max-w-2xl text-slate-100 leading-8">
            Những vết thâm, mụn hoặc mảng sạm có thể liên quan đến viêm sau
            mụn, nắng, nội tiết, mỹ phẩm không phù hợp hoặc hàng rào da suy yếu.
            SpaClinic kiểm tra da trước khi đề xuất liệu trình.
          </p>
          <Link
            to="/booking"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-white transition hover:bg-amber-600"
          >
            Đặt lịch soi da
            <CalendarCheck size={18} />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto grid gap-10 px-6 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Vấn đề thường gặp
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Vì sao da xuất hiện mụn, thâm hoặc sạm màu?
            </h2>
            <p className="mt-5 leading-8 text-gray-600">
              Mụn thường liên quan đến dầu thừa, tế bào chết, vi khuẩn và phản
              ứng viêm trong nang lông. Thâm, nám hoặc tàn nhang thường đậm hơn
              khi da viêm, tiếp xúc nắng nhiều hoặc chăm sóc sau mụn chưa đúng.
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
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80"
              alt="Chăm sóc da mặt chuyên sâu"
              className="h-[520px] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-600">
              Điều trị tại cơ sở
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Quy trình giúp khách hiểu rõ trước khi bắt đầu
            </h2>
            <div className="mt-7 space-y-4">
              {treatmentSteps.map((step, index) => (
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
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-400">
              Chăm sóc sau liệu trình
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Giữ da ổn định để hạn chế tái phát
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-2">
            {[
              "Chống nắng đều, che chắn kỹ và tránh treatment mạnh khi da đang kích ứng.",
              "Không tự nặn mụn viêm, hạn chế sờ tay lên mặt và làm sạch dịu nhẹ.",
              "Duy trì dưỡng ẩm, tái khám đúng hẹn và báo ngay nếu có đỏ rát kéo dài.",
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
            <h2 className="mt-4 text-3xl font-bold text-[#2F2A26]">Giá tham khảo</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Chi phí thực tế phụ thuộc vùng điều trị, mức độ mụn/thâm nám, công
              nghệ sử dụng và số buổi cần theo dõi.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {prices.map(([name, price]) => (
              <div key={name} className="grid gap-2 border-b border-slate-200 p-5 last:border-b-0 sm:grid-cols-2">
                <p className="font-semibold">{name}</p>
                <p className="text-gray-700 sm:text-right">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#2F2A26] py-16 text-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Muốn biết tình trạng da thuộc nhóm nào?</h2>
            <p className="mt-3 text-amber-50">Đặt lịch soi da để được tư vấn dịch vụ phù hợp.</p>
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
