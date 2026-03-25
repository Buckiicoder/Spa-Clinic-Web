import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Home() {
  // Smooth scroll
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("href")!;
        document.querySelector(id)?.scrollIntoView({
          behavior: "smooth",
        });
      });
    });
  }, []);

  return (
    <div className="font-sans text-brown-900">

      <Navbar />

      {/* ========= */}
      {/* ================= HERO ================= */}
      <section
        id="home"
        className="min-h-screen bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(60,40,20,.75), rgba(0,0,0,.3)), url('/hero.jpg')",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-white">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Spa & Clinic <br />
            <span className="text-amber-400">Chuẩn Y Khoa</span>
          </h2>

          <p className="max-w-xl text-lg text-gray-200 mb-8">
            Mang đến vẻ đẹp tự nhiên – thư giãn toàn diện – công nghệ hiện đại.
          </p>

          <div className="flex gap-4">
            <a
              href="#services"
              className="bg-amber-500 hover:bg-amber-600 px-8 py-3 rounded-full font-semibold transition"
            >
              Khám phá dịch vụ
            </a>

            <a
              href="#contact"
              className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-brown-900 transition"
            >
              Liên hệ ngay
            </a>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-24 bg-gradient-to-br from-amber-50 via-stone-100 to-amber-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-amber-600 mb-6">
            Về chúng tôi
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Spa Clinic là trung tâm chăm sóc sắc đẹp kết hợp y khoa, ứng dụng
            công nghệ hiện đại, đội ngũ chuyên viên giàu kinh nghiệm.
          </p>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="services" className="py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-amber-600 mb-16">
            Dịch vụ nổi bật
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { path: "/beauty", title: "Làm đẹp da" },
              { path: "/hair", title: "Triệt lông công nghệ cao" },
              { path: "/body", title: "Chăm sóc Body" },
              { path: "/massage", title: "Massage thư giãn" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-2 transition-all"
              >
                <div className="h-40 bg-gray-200 rounded-xl mb-4" />
                <h4 className="font-semibold text-lg group-hover:text-amber-600 transition">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="py-24 bg-white text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-amber-400 mb-6">
            Liên hệ & Đặt lịch
          </h3>
          <p className="text-gray-500 mb-8 font-medium ">
            Hotline: 0909 999 999 – Địa chỉ: TP. Hồ Chí Minh
          </p>

          <button className="bg-amber-500 hover:bg-amber-600 px-10 py-3 rounded-full font-semibold transition">
            Đặt lịch ngay
          </button>
        </div>
      </section>
    </div>
  );
}
