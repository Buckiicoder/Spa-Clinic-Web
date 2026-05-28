import { useState } from "react";
import { useDispatch } from "react-redux";

import { createSalaryAllowance } from "../features/salary/salary-allowance/salary-allowanceSlice";

interface Props {
  open: boolean;

  onClose: () => void;

  onSuccess?: () => void;
}

export default function SalaryAllowanceModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const dispatch: any = useDispatch();

  const [form, setForm] = useState({
    name: "",

    amount_value: "",

    amount_type: "FIXED",

    apply_type: "MONTHLY",
  });

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      await dispatch(
        createSalaryAllowance({
          ...form,

          amount_value: Number(
            form.amount_value,
          ),
        }),
      ).unwrap();

      onSuccess?.();

      onClose();

      setForm({
        name: "",

        amount_value: "",

        amount_type: "FIXED",

        apply_type: "MONTHLY",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
      "
    >
      <div
        className="
          bg-white rounded-xl
          p-5 w-full max-w-lg
        "
      >
        <h2 className="text-lg font-semibold mb-4">
          Thêm phụ cấp
        </h2>

        <div className="space-y-4">
          <input
            placeholder="Tên phụ cấp"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="number"
            placeholder="Giá trị"
            value={form.amount_value}
            onChange={(e) =>
              setForm({
                ...form,
                amount_value:
                  e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          />

          <select
            value={form.amount_type}
            onChange={(e) =>
              setForm({
                ...form,
                amount_type:
                  e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="FIXED">
              VNĐ
            </option>

            <option value="PERCENT">
              % lương
            </option>
          </select>

          <select
            value={form.apply_type}
            onChange={(e) =>
              setForm({
                ...form,
                apply_type:
                  e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="DAILY">
              Mỗi ngày
            </option>

            <option value="MONTHLY">
              Hàng tháng
            </option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="
              bg-blue-500 text-white
              px-4 py-2 rounded
            "
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}