import { useEffect, useMemo, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  // ChevronDown,
  Plus,
  Search,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../app/hook";

import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  selectServices,
  selectLoading,
} from "../features/service/serviceSlice";
import ServiceModal from "../modal/ServiceModal";
import ServiceCategorySelect from "../components/ServiceCategorySelect";

export default function Service() {
  const dispatch = useAppDispatch();

  const services = useAppSelector(selectServices);
  const loading = useAppSelector(selectLoading);

  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [openModal, setOpenModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);

  // ================= FETCH =================
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // ================= FILTER =================
  const filteredServices = useMemo(() => {
    return services.filter((item: any) => {
      const keyword = search.toLowerCase();

      // 🔍 SEARCH
      const matchSearch =
        item.name?.toLowerCase().includes(keyword) ||
        (item.area || "").toLowerCase().includes(keyword);

      // 🔘 STATUS
      const matchStatus = onlyActive ? item.is_active : true;

      // 🌳 CATEGORY FILTER
      let matchCategory = true;

      if (filterCategory) {
        matchCategory =
          item.id === filterCategory || item.parent_id === filterCategory;
      }

      return matchSearch && matchStatus && matchCategory;
    });
  }, [services, search, onlyActive, filterCategory]);

  const displayServices = useMemo(() => {
    return filteredServices.filter(
      (s: any) => s.area, // chỉ leaf
    );
  }, [filteredServices]);

  // ================= PAGINATION =================
  const totalPage = Math.max(1, Math.ceil(displayServices.length / limit));

  const paginatedServices = displayServices.slice(
    (page - 1) * limit,
    page * limit,
  );

  // ================= SUBMIT =================
  const handleSubmit = async (data: any) => {
    try {
      if (!data.name || data.name.trim() === "") {
        alert("Tên dịch vụ không được để trống");
        return;
      }

      const isLeaf =
        !!data.parent_id &&
        typeof data.area === "string" &&
        data.area.trim().length > 0;

      // ✅ chỉ validate package nếu là leaf
      if (isLeaf) {
        if (!data.packages || data.packages.length === 0) {
          alert("Phải có ít nhất 1 gói dịch vụ");
          return;
        }

        for (const pkg of data.packages) {
          if (!pkg.name || pkg.price === undefined || pkg.price === null) {
            alert("Gói dịch vụ không hợp lệ");
            return;
          }
        }
      }

      if (selectedService) {
        await dispatch(
          updateService({
            id: selectedService.id,
            data,
          }),
        ).unwrap();
      } else {
        await dispatch(createService(data)).unwrap();
      }

      setOpenModal(false);
      setSelectedService(null);
    } catch (err) {
      console.error(err);
      alert("Lưu dịch vụ thất bại");
    }
  };

  // ================= EDIT =================
  const handleOpenEdit = (service: any) => {
    setSelectedService(service);
    setOpenModal(true);
  };

  // ================= DELETE =================
  const handleDelete = async (e: React.MouseEvent, service: any) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa dịch vụ "${service.name}" không?`,
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteService(service.id)).unwrap();
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* HEADER */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-black">Dịch vụ</h1>

          <button
            className="flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            onClick={() => {
              setSelectedService(null);
              setOpenModal(true);
            }}
          >
            <Plus size={18} />
            Thêm dịch vụ
          </button>
        </div>

        {/* FILTER */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
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
                placeholder="Tìm theo tên dịch vụ hoặc vùng..."
                className="h-12 w-full rounded-2xl border border-gray-200 pl-11 pr-4 text-sm focus:border-black outline-none"
              />
            </div>

            {/* TOGGLE */}
            <label className="flex items-center gap-3 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  setOnlyActive(!onlyActive);
                  setPage(1);
                }}
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

            <div className="min-w-52">
              <ServiceCategorySelect
                services={services}
                value={filterCategory}
                onChange={setFilterCategory}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Vùng/Công nghệ</th>
                  <th className="p-3 text-left">Gói dịch vụ</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  paginatedServices.map((item: any) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenEdit(item)}
                      className="cursor-pointer border-t hover:bg-amber-50"
                    >
                      <td className="p-3">{item.id}</td>

                      <td className="p-3 font-medium">{item.name}</td>

                      <td className="p-3">{item.area || "-"}</td>

                      {/* PACKAGES */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {item.packages?.map((p: any) => (
                            <span
                              key={p.id}
                              className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                            >
                              {p.name} - {p.price} ({p.unit})
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.is_active ? "Hoạt động" : "Ngừng"}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            className="rounded bg-amber-500 px-3 py-1 text-xs text-white"
                          >
                            Sửa
                          </button>

                          <button
                            onClick={(e) => handleDelete(e, item)}
                            className="rounded border px-3 py-1 text-xs"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {loading && (
              <div className="py-10 text-center text-gray-400">
                Đang tải dữ liệu...
              </div>
            )}

            {!loading && paginatedServices.length === 0 && (
              <div className="py-10 text-center text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Tổng: {filteredServices.length}
            </span>

            {/* LIMIT */}
            <div className="flex items-center gap-2 text-sm">
              <span>Hiển thị</span>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span>dòng</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <span>
              Trang {page}/{totalPage}
            </span>

            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="disabled:opacity-40"
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={page === totalPage}
              onClick={() => setPage(page + 1)}
              className="disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>

            <button
              disabled={page === totalPage}
              onClick={() => setPage(totalPage)}
              className="disabled:opacity-40"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <ServiceModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedService(null);
        }}
        initialData={selectedService}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
