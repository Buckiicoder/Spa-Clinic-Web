import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import {
  fetchPositions,
  fetchPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  selectPositions,
  selectPositionLoading,
  selectSelectedPosition,
  clearSelectedPosition,
} from "../features/position/positionSlice";

import {
  fetchStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
  selectStaffs,
  selectStaffLoading,
  selectSelectedStaff,
  fetchStaffById,
  clearSelectedStaff,
} from "../features/staff/staffSlice";
import PositionModal from "../modal/PositionModal";
import StaffModal from "../modal/StaffModal";

export default function StaffManage() {
  const dispatch = useAppDispatch();

  const positions = useAppSelector(selectPositions);
  const positionLoading = useAppSelector(selectPositionLoading);

  const selectedPositionRedux = useAppSelector(selectSelectedPosition);

  const [openPositionModal, setOpenPositionModal] = useState(false);
  const [searchPosition, setSearchPosition] = useState("");

  const staffs = useAppSelector(selectStaffs);
  const loading = useAppSelector(selectStaffLoading);
  const selectedStaffRedux = useAppSelector(selectSelectedStaff);

  const [tab, setTab] = useState("position");
  const [openModal, setOpenModal] = useState(false);

  // FETCH DATA
  useEffect(() => {
    if (tab === "staff") {
      dispatch(fetchStaffs());
    }

    if (tab === "position") {
      dispatch(fetchPositions());
    }
  }, [tab, dispatch]);

  const handleOpenCreatePosition = () => {
    dispatch(clearSelectedPosition());
    setOpenPositionModal(true);
  };

  const handleOpenEditPosition = (id: number) => {
    dispatch(fetchPositionById(id));
    setOpenPositionModal(true);
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm("Xóa chức danh này?")) return;

    try {
      await dispatch(deletePosition(id));

      dispatch(clearSelectedPosition()); // ✅ reset redux
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenCreate = () => {
    dispatch(clearSelectedStaff());
    setOpenModal(true);
  };

  const handleOpenEdit = (id: number) => {
    dispatch(fetchStaffById(id));
    setOpenModal(true);
  };

  const handleSubmitPosition = async (data: any) => {
    try {
      if (selectedPositionRedux) {
        const { id, ...rest } = data;

        await dispatch(
          updatePosition({
            id,
            data: rest, // 🔥 CHỈ gửi name, description
          }),
        );
      } else {
        await dispatch(createPosition(data));
      }

      setOpenPositionModal(false);
      dispatch(clearSelectedPosition());
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedStaffRedux) {
        await dispatch(
          updateStaff({
            id: selectedStaffRedux.id,
            data,
          }),
        );
      } else {
        await dispatch(createStaff(data));
      }

      setOpenModal(false);
      dispatch(clearSelectedStaff());
      dispatch(fetchStaffs()); // refresh
    } catch (err) {
      console.log(err);
    }
  };

  const filteredPositions = positions.filter((p: any) =>
    p.name.toLowerCase().includes(searchPosition.toLowerCase()),
  );

  const handleDelete = async (e: any, staff: any) => {
    e.stopPropagation(); // ❗ chặn click row

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa nhân viên "${staff.name}" không?`,
    );

    if (!confirmDelete) return;

    try {
      await dispatch(deleteStaff(staff.id));
      dispatch(fetchStaffs());
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "position", label: "Chức danh" },
          { key: "staff", label: "Nhân viên" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-5 py-2 rounded-t-xl border transition-all duration-300
              ${
                tab === item.key
                  ? "text-white border-b-white bg-amber-500 shadow font-semibold"
                  : "bg-gray-100 hover:bg-amber-100"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="border rounded-b-2xl p-5 bg-white shadow-sm">
        {/* ================== POSITION TAB ================== */}
        {tab === "position" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">Quản lý chức vụ</h1>

              <button
                onClick={handleOpenCreatePosition}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl"
              >
                <Plus size={16} /> Thêm chức danh
              </button>
            </div>

            <div className="relative w-full max-w-xl mb-4">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Tìm theo tên chức vụ..."
                value={searchPosition}
                onChange={(e) => setSearchPosition(e.target.value)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {!positionLoading &&
                filteredPositions.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => handleOpenEditPosition(p.id)}
                    className="p-4 rounded-2xl border shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    {/* HEADER CARD */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{p.name}</h3>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePosition(p.id);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1 rounded-lg transition"
                      >
                        Xóa
                      </button>
                    </div>

                    <p className="text-gray-500 mt-2 text-sm">
                      {p.description || "Không có mô tả"}
                    </p>
                  </div>
                ))}
            </div>

            {/* LOADING */}
            {positionLoading && (
              <div className="text-center py-10 text-gray-400">
                Đang tải dữ liệu...
              </div>
            )}

            {/* EMPTY */}
            {!positionLoading && filteredPositions.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                Không có dữ liệu
              </div>
            )}
          </div>
        )}

        <PositionModal
          open={openPositionModal}
          onClose={() => {
            setOpenPositionModal(false);
            dispatch(clearSelectedPosition());
          }}
          initialData={selectedPositionRedux}
          onSubmit={handleSubmitPosition}
        />

        {/* ================== STAFF TAB ================== */}
        {tab === "staff" && (
          <div>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold">Quản lý nhân viên</h1>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
             bg-gradient-to-r from-amber-600 to-amber-700 
             text-white shadow-md 
             hover:from-orange-500 hover:to-red-500 transition"
                onClick={handleOpenCreate}
              >
                <Plus size={16} /> Thêm nhân viên
              </button>
            </div>

            {/* SEARCH (UI trước, chưa gắn API) */}
            <div className="relative w-full max-w-xl mb-4">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Tìm theo , tên, số điện thoại..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-gray-700">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Tên</th>
                    <th className="p-3 text-left">SĐT</th>
                    <th className="p-3 text-left">Giới tính</th>
                    <th className="p-3 text-left">Chức vụ</th>
                    <th className="p-3 text-left">Nhân viên</th>
                    <th className="p-3 text-left">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading &&
                    staffs.map((s: any) => (
                      <tr
                        key={s.id}
                        onClick={() => handleOpenEdit(s.id)}
                        className="border-t hover:bg-amber-50 cursor-pointer transition"
                      >
                        <td className="p-3 font-medium">{s.id}</td>
                        <td className="p-3">{s.name}</td>
                        <td className="p-3">{s.phone}</td>
                        <td className="p-3">{s.gender}</td>
                        <td className="p-3">{s.position_name}</td>
                        <td className="p-3">{s.employee_type.toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())}</td>
                        <td className="p-3">
                          <button
                            onClick={(e) => handleDelete(e, s)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1 rounded-lg transition"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* LOADING */}
              {loading && (
                <div className="text-center py-10 text-gray-400">
                  Đang tải dữ liệu...
                </div>
              )}

              {/* EMPTY */}
              {!loading && staffs.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  Không có dữ liệu
                </div>
              )}
            </div>

            {/* MODAL */}
            <StaffModal
              open={openModal}
              onClose={() => {
                setOpenModal(false);
                dispatch(clearSelectedStaff());
              }}
              initialData={selectedStaffRedux}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
