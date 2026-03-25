import Navbar from "../components/Navbar";
import { useEffect } from "react";

export default function RelaxMassage() {

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
            "linear-gradient(to right, rgba(60,40,20,.75), rgba(0,0,0,.35)), url('/services/massage.jpg')",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Massage <span className="text-amber-400">Thư giãn</span>
          </h1>
          <p className="max-w-xl text-gray-200">
            Giải tỏa căng thẳng – phục hồi năng lượng – cân bằng cơ thể & tinh thần.
          </p>
        </div>
      </section>

      <section className="py-20 bg-amber-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-amber-600 mb-6">
            Trải nghiệm thư giãn đỉnh cao
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 mb-10">
            Không gian yên tĩnh, hương liệu tự nhiên, kỹ thuật massage chuyên sâu.
          </p>

          <button className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3 rounded-full font-semibold transition">
            Đặt lịch massage
          </button>
        </div>
      </section>
    </div>
  );
}
