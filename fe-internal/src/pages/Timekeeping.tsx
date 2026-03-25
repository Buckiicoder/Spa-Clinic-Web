import Navbar from "../components/Navbar";

export default function TimeKeeping() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
      
      <Navbar />

      <div className="max-w-5xl mx-auto pt-28 px-6">

        {/* TITLE */}
        {/* <h1 className="text-3xl font-bold text-amber-600 mb-8">
          Chấm công
        </h1> */}

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-500">Tổng công</p>
            <p className="text-2xl font-bold text-amber-600">4.5 / 27</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-500">Ngày phép còn</p>
            <p className="text-2xl font-bold text-amber-600">2.5</p>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Tháng 08 / 2024
          </h2>

          {/* WEEK HEADER */}
          <div className="grid grid-cols-7 text-center text-gray-400 mb-2">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;

              return (
                <div
                  key={day}
                  className={`py-2 rounded-lg cursor-pointer transition
                    ${
                      day === 6
                        ? "bg-amber-500 text-white font-semibold"
                        : "hover:bg-amber-100"
                    }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* TODAY INFO */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">
              Hôm nay, 06/08/2024
            </h3>
            <button className="text-amber-500 font-medium">
              Thao tác
            </button>
          </div>

          <div className="text-gray-600 text-sm space-y-1">
            <p>Thời gian làm việc: 08 giờ 00 phút</p>
            <p>Vào: 09:00</p>
            <p>Ra: --:--</p>
            <p className="font-semibold text-amber-600">
              Tổng công: 0.5
            </p>
          </div>
        </div>

        {/* CHECK IN BUTTON */}
        <div className="text-center">
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-3 rounded-full font-semibold transition">
            Chấm công ngay
          </button>
        </div>

      </div>
    </div>
  );
}