import { useState } from "react";
import { useDispatch } from "react-redux";

import { createSalaryDeduction } from "../features/salary/salary-deduction/salary-deductionSlice";

interface Props {
  open: boolean;

  onClose: () => void;

  onSuccess?: () => void;
}

export default function SalaryDeductionModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const dispatch: any = useDispatch();

  const [form, setForm] = useState({
    name: "",
    amount_value: "",
    amount_type: "FIXED",
    unit_type: "MONTHLY",
    condition_text: "",
    note: "",
  });

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      await dispatch(
        createSalaryDeduction({
          name: form.name,
          amount_type: form.amount_type,
          amount_value: Number(form.amount_value),
          unit_type: form.unit_type,
          condition_text: form.condition_text,
          note: form.note,
        }),
      ).unwrap();

      onSuccess?.();

      onClose();

      setForm({
        name: "",

        amount_value: "",

        amount_type: "FIXED",

        unit_type: "MONTHLY",

        condition_text: "",

        note: "",
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
        <h2 className="text-lg font-semibold mb-4">Thêm giảm trừ</h2>

        <div className="space-y-4">
          <input
            placeholder="Tên giảm trừ"
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
                amount_value: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          />

          <select
            value={form.amount_type}
            onChange={(e) =>
              setForm({
                ...form,
                amount_type: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="FIXED">VNĐ</option>

            <option value="PERCENT">% lương</option>
          </select>

          <select
            value={form.unit_type}
            onChange={(e) =>
              setForm({
                ...form,
                unit_type: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="DAILY">Mỗi ngày</option>

            <option value="MONTHLY">Hàng tháng</option>
          </select>

          <input
            placeholder="Điều kiện áp dụng"
            value={form.condition_text}
            onChange={(e) =>
              setForm({
                ...form,
                condition_text: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="border px-4 py-2 rounded">
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
