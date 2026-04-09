export default function TimeKeeping() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-50">
      <div className="max-w-[1800px] mx-auto px-2 sm:px-3 md:px-6 py-4 md:py-6">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between px-3">
          <h4 className="text-lg md:text-2xl font-bold text-amber-600">
            Chấm công
          </h4>
        </div>

        {/* CALENDAR + TODAY */}
        {/* CALENDAR */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Tháng 08 / 2024
          </h2>

          <div className="grid grid-cols-7 text-center text-gray-400 mb-2">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs md:text-sm">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;

              return (
                <div
                  key={day}
                  className={`py-2 md:py-3 rounded-lg cursor-pointer transition text-sm
            ${
              day === new Date().getDate()
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

        {/* TODAY + SUMMARY */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
          {/* TODAY INFO */}
          <div className="col-span-2 bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3
                  className="text-base md:text-xl font-semibold
                text-gray-800"
                >
                  Hôm nay, 06/08/2024
                </h3>
                <span className="text-sm bg-amber-100 text-amber-600 px-3 py-1 rounded-full font-medium">
                  Đang làm
                </span>
              </div>

              <div className="space-y-2 md:space-y-3 text-gray-700 text-sm md:text-base">
                <p className="flex items-center gap-2 ">
                  <span>Thời gian làm việc:</span>
                  <b>08 giờ 00 phút</b>
                </p>

                <p className="flex items-center gap-2">
                  <span>Vào:</span> <b>09:00</b>
                </p>

                <p className="flex items-center gap-2">
                  <span>Ra:</span> <b>--:--</b>
                </p>

                <p className="flex items-center gap-2 text-amber-600 font-semibold">
                  Tổng công: 0.5
                </p>
              </div>
            </div>

            <button className="mt-4 md:mt-6 bg-amber-500 hover:bg-amber-600 text-white py-2 md:py-3 text-sm md:text-base rounded-xl font-semibold transition">
              Chấm công ngay
            </button>
          </div>

          {/* SUMMARY RIGHT */}
          <div className="flex flex-col gap-4 md:gap-4 font-semibold text-2xl">
            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition ">
              <p className="text-gray-700 text-sm">Tổng công</p>
              <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">4.5 / 27</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-lg transition">
              <p className="text-gray-700 text-sm">Ngày phép còn</p>
              <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">2.5</p>
            </div>
          </div>
        </div>

        {/* HISTORY / EMPTY */}
        <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
          Chưa có dữ liệu chấm công trong tháng này.
        </div>
      </div>
    </div>
  );
}
