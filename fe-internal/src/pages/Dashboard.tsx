import { useEffect } from "react";
import { BarChart3, Users, Calendar, DollarSign } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  useEffect(() => {
    document.title = "Spa Clinic Dashboard";
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans">
      {/* NAVBAR */}
      {/* <Navbar /> */}

      <div className="flex">

        {/* MAIN */}
        <main className="flex-1 p-6">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-black">
              Dashboard Tổng Quan
            </h1>

            <div className="flex items-center gap-3">
              <input
                placeholder="Tìm kiếm..."
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm focus:border-amber-600 outline-none"
              />

              <div className="w-10 h-10 bg-amber-200 rounded-full" />
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {[
              {
                title: "Lịch hẹn hôm nay",
                value: "32",
                icon: <Calendar />,
              },
              {
                title: "Khách hàng",
                value: "1,245",
                icon: <Users />,
              },
              {
                title: "Doanh thu",
                value: "120M",
                icon: <DollarSign />,
              },
              {
                title: "Dịch vụ",
                value: "48",
                icon: <BarChart3 />,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500 text-sm">
                    {card.title}
                  </span>
                  <span className="text-amber-600">{card.icon}</span>
                </div>

                <div className="text-2xl font-bold text-black">
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* CHART */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg text-amber-700 mb-4">
                Doanh thu theo tháng
              </h3>

              <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                Chart placeholder
              </div>
            </div>

            {/* BOOKINGS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg text-amber-700 mb-4">
                Lịch hẹn gần đây
              </h3>

              <ul className="space-y-4 text-sm">
                {[1, 2, 3].map((item) => (
                  <li
                    key={item}
                    className="flex justify-between border-b pb-2"
                  >
                    <span>Khách #{item}</span>
                    <span className="text-amber-600">Đã đặt</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* TABLE */}
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg text-amber-700 mb-5">
              Danh sách khách hàng
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="p-3 text-left">Tên</th>
                    <th className="p-3 text-left">SĐT</th>
                    <th className="p-3 text-left">Dịch vụ</th>
                    <th className="p-3 text-left">Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {[1, 2, 3, 4].map((row) => (
                    <tr
                      key={row}
                      className="border-t hover:bg-amber-50 transition"
                    >
                      <td className="p-3">Nguyễn Văn A</td>
                      <td className="p-3">0909 999 999</td>
                      <td className="p-3">Chăm sóc da</td>
                      <td className="p-3 text-green-600">Hoàn thành</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
