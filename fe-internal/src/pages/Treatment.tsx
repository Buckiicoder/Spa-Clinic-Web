import { useEffect, useMemo, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  // Plus,
  Search,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  fetchTreatmentPackages,
  fetchTreatmentDetail,
  saveTreatmentPlan,
  selectTreatmentPackages,
  selectTreatmentLoading,
} from "../features/treatment/treatmentSlice";
import TreatmentModal from "../modal/TreatmentModal";

export default function Treatment() {
  const dispatch = useAppDispatch();

  const packages = useAppSelector(selectTreatmentPackages);
  const loading = useAppSelector(selectTreatmentLoading);

  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [openModal, setOpenModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // ================= FETCH =================
  useEffect(() => {
    dispatch(fetchTreatmentPackages());
  }, [dispatch]);

  // ================= FILTER =================
  const filtered = useMemo(() => {
    return packages.filter((p: any) => {
      const keyword = search.toLowerCase();

      const matchSearch = p.name?.toLowerCase().includes(keyword);

      const matchStatus = onlyActive ? p.is_active : true;

      return matchSearch && matchStatus;
    });
  }, [packages, search, onlyActive]);

  // ================= PAGINATION =================
  const totalPage = Math.max(1, Math.ceil(filtered.length / limit));

  const paginated = filtered.slice((page - 1) * limit, page * limit);

  // ================= OPEN DETAIL =================
  const handleOpen = async (pkg: any) => {
    try {
      await dispatch(fetchTreatmentDetail(pkg.id)).unwrap();

      setSelectedPackage(pkg);
      setOpenModal(true);
    } catch (err) {
      console.error(err);
      alert("Không tải được chi tiết");
    }
  };

  // ================= SAVE =================
  const handleSave = async (data: any) => {
    try {
      await dispatch(
        saveTreatmentPlan({
          packageId: selectedPackage.id,
          data,
        }),
      ).unwrap();

      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý liệu trình</h1>

          {/* <button
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white"
            onClick={() => {
              alert("Tạo package ở Service nhé 😄");
            }}
          >
            <Plus size={18} />
            Thêm liệu trình
          </button> */}
        </div>

        {/* FILTER */}
        <div className="mb-5 flex gap-4 items-center">
          {/* SEARCH */}
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên liệu trình..."
              className="h-12 w-full rounded-2xl border border-gray-200 pl-11 pr-4 text-sm focus:border-black outline-none"
            />
          </div>

          {/* ACTIVE */}
          <label className="flex items-center gap-3 text-sm font-medium">
            <button
              type="button"
              onClick={() => setOnlyActive(!onlyActive)}
              className={`relative h-7 w-12 rounded-full ${
                onlyActive ? "bg-black" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white ${
                  onlyActive ? "left-6" : "left-1"
                }`}
              />
            </button>
            Chỉ hoạt động
          </label>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-amber-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Tên gói</th>
                <th className="p-3 text-left">Giá</th>
                <th className="p-3 text-left">Số buổi</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                paginated.map((pkg: any) => (
                  <tr
                    key={pkg.id}
                    className="cursor-pointer border-t hover:bg-amber-50"
                    onClick={() => handleOpen(pkg)}
                  >
                    <td className="p-3">{pkg.id}</td>

                    <td className="p-3 font-medium flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                        {pkg.name}
                      </span>
                    </td>

                    <td className="p-3">
                      {Number(pkg.price).toLocaleString()}
                    </td>

                    <td className="p-3">
                      {pkg.total_sessions} {pkg.unit}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          pkg.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pkg.is_active ? "Hoạt động" : "Ngừng"}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen(pkg);
                        }}
                        className="rounded bg-amber-500 px-3 py-1 text-xs text-white"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <div className="py-10 text-center text-gray-400">Đang tải...</div>
          )}

          {!loading && paginated.length === 0 && (
            <div className="py-10 text-center text-gray-400">
              Không có dữ liệu
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <div className="mt-5 flex justify-between items-center">
          <span>Tổng: {filtered.length}</span>

          <div className="flex gap-2 items-center">
            <button onClick={() => setPage(1)}>
              <ChevronsLeft size={18} />
            </button>

            <button onClick={() => setPage(page - 1)}>
              <ChevronLeft size={18} />
            </button>

            <span>
              {page}/{totalPage}
            </span>

            <button onClick={() => setPage(page + 1)}>
              <ChevronRight size={18} />
            </button>

            <button onClick={() => setPage(totalPage)}>
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <TreatmentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSave}
      />
    </div>
  );
}
