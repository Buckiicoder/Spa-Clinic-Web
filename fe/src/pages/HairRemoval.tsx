import Navbar from "../components/Navbar";
import { useEffect } from "react";

export default function HairRemoval() {
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
            "linear-gradient(to right, rgba(60,40,20,.7), rgba(0,0,0,.3)), url('/services/hair.jpg')",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Triệt lông <span className="text-amber-400">CNC</span>
          </h1>
          <p className="max-w-xl text-gray-200">
            Công nghệ triệt lông không đau – hiệu quả lâu dài – an toàn tuyệt
            đối.
          </p>
        </div>
      </section>

      <section className="py-20 bg-amber-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            "Triệt lông vĩnh viễn",
            "Không đau – không rát",
            "Phù hợp mọi loại da",
          ].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl p-6 shadow hover:-translate-y-1 transition"
            >
              <h3 className="font-semibold text-lg mb-2">{item}</h3>
              <p className="text-gray-600">
                Ứng dụng công nghệ CNC thế hệ mới, mang lại hiệu quả vượt trội.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
