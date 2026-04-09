import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <Navbar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* CONTENT */}
      <div
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "ml-64" : "ml-20"}
        `}
      >
        <div className="">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
