import Navbar from "../components/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { logoutAsync } from "../features/auth/authSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BeautySkin() {
  const token = useSelector((state: any) => state.auth.token);
  const dispatch = useDispatch<any>();
  const navigate = useNavigate<any>();

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate("/");
  };
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
      <Navbar token={token} onLogout={handleLogout} />

      {/* HERO */}
      <section
        className="min-h-[70vh] flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(60,40,20,.7), rgba(0,0,0,.3)), url('/services/beauty.jpg')",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Làm đẹp da <span className="text-amber-400">Chuẩn Y Khoa</span>
          </h1>
          <p className="max-w-xl text-gray-200">
            Trẻ hóa – phục hồi – tái tạo làn da bằng công nghệ hiện đại và liệu
            trình cá nhân hóa.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-amber-600 mb-4">
              Dịch vụ nổi bật
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Trẻ hóa da công nghệ cao</li>
              <li>• Điều trị mụn – nám – tàn nhang</li>
              <li>• Cấp ẩm – phục hồi da chuyên sâu</li>
              <li>• Liệu trình theo từng loại da</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-2xl p-8 shadow">
            <h3 className="text-xl font-semibold mb-4">
              Vì sao chọn Spa Clinic?
            </h3>
            <p className="text-gray-600">
              Đội ngũ chuyên gia da liễu, thiết bị đạt chuẩn y khoa, liệu trình
              an toàn – hiệu quả – rõ rệt sau từng buổi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
