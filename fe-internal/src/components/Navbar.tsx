import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hook";
import { selectUser, logoutAsync } from "../features/auth/authSlice";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(selectUser);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate("/");
  };

  /* ================= CLOSE MENU WHEN ROUTE CHANGE ================= */
  useEffect(() => {
    setOpen(false);
  }, [location]);

  /* ================= HANDLERS ================= */

  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);

  const goLogin = useCallback(() => {
    setOpen(false);
    navigate("/login");
  }, [navigate]);

  const goProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const goBooking = useCallback(() => {
    navigate("/booking");
  }, [navigate]);

  /* ================= RENDER ================= */

  return (
    <div className="">
      {/* ================= NAVBAR ================= */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b border-amber-100 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Hamburger */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={openMenu}
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Logo */}
          <h1 className="text-2xl font-bold text-gray-900">
            <Link to="">
              Spa<span className="text-amber-400">Clinic</span>
            </Link>
          </h1>

          {/* ================= DESKTOP MENU ================= */}
          <ul className={`hidden md:flex items-center gap-8 font-medium`}>
            <li>
              <Link to="/chamcong" className="hover:text-amber-400 transition">
                Chấm công
              </Link>
            </li>

            <li>
              <Link to="" className="hover:text-amber-400 transition">
                Lịch làm
              </Link>
            </li>

            <li>
              <Link to="/checklich" className="hover:text-amber-400 transition">
                Check lịch
              </Link>
            </li>

            {/* SERVICES */}
            {/* <li className="relative group">
              <span className="cursor-pointer hover:text-amber-400 transition">
                Dịch vụ
              </span>

              <ul className="absolute top-full left-0 mt-3 w-48 bg-white text-gray-700 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all">
                <li className="px-4 py-3 hover:bg-amber-50">
                  <Link to="/beauty">Làm đẹp</Link>
                </li>
                <li className="px-4 py-3 hover:bg-amber-50">
                  <Link to="/hair">Triệt lông</Link>
                </li>
                <li className="px-4 py-3 hover:bg-amber-50">
                  <Link to="/body">Body</Link>
                </li>
                <li className="px-4 py-3 hover:bg-amber-50">
                  <Link to="/massage">Massage</Link>
                </li>
              </ul>
            </li> */}

            {/* <li>
              <a href="#contact" className="hover:text-amber-400 transition">
                Liên hệ
              </a>
            </li> */}
          </ul>

          <div className="hidden md:flex items-center gap-5">
            {/* BUTTON ĐẶT LỊCH */}
            <button
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full transition"
              onClick={goBooking}
            >
              Đặt lịch
            </button>

            {/* Nếu chưa login */}
            {!user && (
              <button
                onClick={goLogin}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-full transition"
              >
                Đăng nhập
              </button>
            )}

            {/* Nếu đã login */}
            {user && (
              <div className="relative flex items-center gap-2 cursor-pointer group">
                <img
                  src={
                    user?.avatar
                      ? "http://localhost:5000" + user.avatar
                      : "https://ui-avatars.com/api/?name=" +
                        (user?.name || "User")
                  }
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border"
                />
                <span className="text-sm text-white">{user.name}</span>

                {/* ✅ LUÔN render */}
                <div
                  className="absolute right-0 top-12 w-40 bg-white text-gray-700 rounded-xl shadow-lg font-medium 
      opacity-0 invisible 
      group-hover:opacity-100 group-hover:visible 
      transition-all duration-200"
                >
                  <button
                    onClick={goProfile}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                  >
                    Hồ sơ
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={closeMenu}>
          <aside
            className="absolute top-0 left-0 h-full w-64 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-8 text-amber-600">
              <Link to="/checklich">
              Spa<span className="text-amber-400">Clinic</span>
            </Link></h2>

            <ul className="flex flex-col gap-6 text-gray-700 font-medium ">
              <li className="hover:text-amber-400 transition">
                <Link to="/" onClick={closeMenu}>
                  Chấm công
                </Link>
              </li>

              <li className="hover:text-amber-400 transition">
                <a href="#about" onClick={closeMenu}>
                  Lịch làm
                </a>
              </li>

              <li>
              <Link to="/checklich" className="hover:text-amber-400 transition">
                Check lịch
              </Link>
            </li>

              {/* <li className="hover:text-amber-400 transition">
                <a href="#services" onClick={closeMenu}>
                  Dịch vụ
                </a>
              </li> */}

              {/* <li className="hover:text-amber-400 transition">
                <a href="#contact" onClick={closeMenu}>
                  Liên hệ
                </a>
              </li> */}

              {!user && (
                <li className="hover:text-amber-400 transition">
                  <button onClick={goLogin}>Đăng nhập</button>
                </li>
              )}
            </ul>

            {/* USER MOBILE */}
            {user && (
              <div className="mt-10 border-t pt-6 flex items-center gap-3">
                <img
                  src={
                    user?.avatar
                      ? "http://localhost:5000" + user.avatar
                      : "https://ui-avatars.com/api/?name=" +
                        (user?.name || "User")
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <p className="font-medium">{user.name}</p>

                  <div className="flex gap-4 text-sm text-gray-500 mt-1 font-medium">
                    <button
                      onClick={goProfile}
                      className="hover:text-amber-400"
                    >
                      Hồ sơ
                    </button>

                    <button
                      onClick={handleLogout}
                      className="hover:text-amber-400"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              className="mt-10 w-full bg-amber-500 text-white py-3 rounded-full"
              onClick={goBooking}
            >
              Đặt lịch
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
