import Navbar from "../components/Navbar";
import { useEffect } from "react";

export default function BodyCare() {

    // Smooth scroll khi click anchor
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
    <div className="text-brown-900">
      <Navbar />
      
      <section
        className="min-h-[70vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(60,40,20,.7), rgba(0,0,0,.3)), url('/services/body.jpg')",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Chăm sóc <span className="text-amber-400">Body</span>
          </h1>
          <p className="max-w-xl text-gray-200">
            Thon gọn vóc dáng – tái tạo năng lượng – nuôi dưỡng cơ thể toàn diện.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-600">
              Liệu trình body cao cấp
            </h2>
            <p className="text-gray-600">
              Kết hợp massage, công nghệ giảm mỡ, detox và chăm sóc da body.
            </p>
          </div>

          <div className="bg-amber-100 rounded-2xl p-8">
            <ul className="space-y-2 text-gray-700">
              <li>• Giảm mỡ – săn chắc</li>
              <li>• Trắng da toàn thân</li>
              <li>• Thư giãn – giải độc</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
