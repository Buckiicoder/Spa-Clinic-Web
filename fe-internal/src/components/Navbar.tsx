import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hook";
import { selectUser, logoutAsync } from "../features/auth/authSlice";
import { LayoutDashboard, Clock, CalendarCheck } from "lucide-react";

export default function Navbar({ open, setOpen }: any) {
  const navigate = useNavigate();
  const [openAccount, setOpenAccount] = useState(false);

  const user = useSelector(selectUser);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate("/");
  };

  const goLogin = useCallback(() => {
    setOpen(false);
    navigate("/login");
  }, [navigate]);

  const goProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  /* ================= RENDER ================= */

  return (
    <div className="">
      {/* ================= NAVBAR ================= */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-[60] bg-white px-2 py-1 rounded-lg shadow border border-gray-300"
        >
          ☰
        </button>
      )}

      <div className="flex">
        {/* SIDEBAR */}
        <aside
          className={`
  fixed top-0 left-0 h-screen bg-white border-r shadow-sm z-50
  transition-all duration-300 ease-in-out
  ${open ? "w-64" : "w-20"}
`}
        >
          <div className="p-3 flex flex-col h-full">
            {/* CLOSE BUTTON (mobile) */}
            {/* <button
              onClick={closeMenu}
              className="absolute top-4 right-4 border border-gray-500 rounded-lg px-2 py-1 font-bold btext-gray-500 hover:text-black text-l"
            >
              ✕
            </button> */}

            {/* LOGO */}
            <div className="mb-6 px-2">
              <Link to="/">
                {open ? (
                  <h1 className="text-xl font-bold text-gray-900">
                    Spa<span className="text-amber-400">Clinic</span>
                  </h1>
                ) : (
                  <br />
                )}
              </Link>
            </div>

            {/* MENU */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <ul className="flex flex-col gap-2 text-gray-700 font-medium">
                {/* Dashboard */}
                <li className="group relative">
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50"
                  >
                    <LayoutDashboard size={18} />
                    {open && <span>Dashboard</span>}
                  </Link>

                  {!open && (
                    <span
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 
      bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 
      group-hover:opacity-100 transition whitespace-nowrap"
                    >
                      Dashboard
                    </span>
                  )}
                </li>

                {/* Chấm công */}
                <li className="group relative">
                  <Link
                    to="/chamcong"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50"
                  >
                    <Clock size={18} />
                    {open && <span>Chấm công</span>}
                  </Link>

                  {!open && (
                    <span
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 
      bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 
      group-hover:opacity-100 transition whitespace-nowrap"
                    >
                      Chấm công
                    </span>
                  )}
                </li>

                {/* Check lịch */}
                <li className="group relative">
                  <Link
                    to="/checklich"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-amber-50"
                  >
                    <CalendarCheck size={18} />
                    {open && <span>Check lịch</span>}
                  </Link>

                  {!open && (
                    <span
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 
      bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 
      group-hover:opacity-100 transition whitespace-nowrap"
                    >
                      Check lịch
                    </span>
                  )}
                </li>
              </ul>
            </div>

            {/* PUSH xuống dưới */}
            <div className="mt-auto pt-6 border-t relative">
              {!user && (
                <button
                  onClick={goLogin}
                  className="w-full bg-amber-500 text-white py-2 rounded-lg"
                >
                  Đăng nhập
                </button>
              )}
              {user && (
                <div
                  className="flex items-center gap-2 px-2 cursor-pointer"
                  onClick={() => setOpenAccount(!openAccount)}
                >
                  <img
                    src={
                      user?.avatar
                        ? "http://localhost:5000" + user.avatar
                        : "https://ui-avatars.com/api/?name=" +
                          (user?.name || "User")
                    }
                    className="w-10 h-10 rounded-full"
                  />

                  {open && (
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  )}
                </div>
              )}

              {/* DROPDOWN */}
              {openAccount && (
                <div className="absolute bottom-16 left-2 w-48 bg-white shadow-lg rounded-xl border z-50">
                  <button
                    onClick={goProfile}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                  >
                    Tài khoản
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
