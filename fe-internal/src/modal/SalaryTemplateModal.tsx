import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  createSalaryTemplate,
  fetchSalaryTemplates,
  // fetchSalaryTemplateDetail,
} from "../features/salary/salary-template/salary-templateSlice";

import {
  fetchSalaryAllowances,
  selectSalaryAllowances,
} from "../features/salary/salary-allowance/salary-allowanceSlice";

import {
  fetchSalaryDeductions,
  selectSalaryDeductions,
} from "../features/salary/salary-deduction/salary-deductionSlice";

import SalaryAllowanceModal from "./SalaryAllowanceModal";
import SalaryDeductionModal from "./SalaryDeductionModal";

import { SalaryTemplateFormState } from "../types/salary";

interface Props {
  open?: boolean;
  onClose?: () => void;
  onCreated?: (template: any) => void;

  embedded?: boolean;

  form?: any;

  setForm?: React.Dispatch<React.SetStateAction<any>>;
}

export default function SalaryTemplateModal({
  open = false,
  onClose = () => {},
  onCreated,
  embedded = false,

  form: externalForm,
  setForm: externalSetForm,
}: Props) {
  const dispatch: any = useDispatch();

  const allowanceOptions = useSelector(selectSalaryAllowances);

  const deductionOptions = useSelector(selectSalaryDeductions);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const [allowanceKeyword, setAllowanceKeyword] = useState("");

  const [deductionKeyword, setDeductionKeyword] = useState("");

  const [openAllowanceModal, setOpenAllowanceModal] = useState(false);

  const [openDeductionModal, setOpenDeductionModal] = useState(false);

  const defaultTemplateForm: SalaryTemplateFormState = {
    name: "",

    employee_type: "FULLTIME",

    pay_period: "MONTHLY",

    salary_amount: "",

    salary_unit: "MONTHLY",

    has_commission: false,

    commission_revenue_type: null,

    commission_calculation_type: null,

    commission_value: "",

    commission_unit: "PERCENT",

    minimum_revenue_target: "",

    note: "",

    is_active: true,

    allowances: [],

    deductions: [],
  };

  const [internalForm, setInternalForm] =
    useState<SalaryTemplateFormState>(defaultTemplateForm);

  const form = embedded && externalForm ? externalForm : internalForm;

  const setForm =
    embedded && externalSetForm ? externalSetForm : setInternalForm;

  useEffect(() => {
    if (!embedded && open) {
      setInternalForm(defaultTemplateForm);
    }
  }, [open, embedded]);

  useEffect(() => {
    if (!embedded && !open) return;

    dispatch(fetchSalaryAllowances(""));

    dispatch(fetchSalaryDeductions(""));
  }, [dispatch, open, embedded]);

  useEffect(() => {
    dispatch(fetchSalaryAllowances(allowanceKeyword));
  }, [dispatch, allowanceKeyword]);

  useEffect(() => {
    dispatch(fetchSalaryDeductions(deductionKeyword));
  }, [dispatch, deductionKeyword]);

useEffect(() => {
  if (!form.has_commission) return;

  if (form.commission_calculation_type === "WORK_HOUR") {
    setForm((prev: any) => ({
      ...prev,

      commission_unit: "FIXED_AMOUNT",

      minimum_revenue_target: "0",

      commission_revenue_type: "WORK_HOUR",
    }));
  }
}, [setForm, form.commission_calculation_type, form.has_commission]);

  const isWorkHour = form.commission_calculation_type === "WORK_HOUR";

  const handleSave = async () => {
    try {
      const created = await dispatch(
        createSalaryTemplate({
          name: form.name,

          employee_type: form.employee_type,

          pay_period: form.pay_period,

          salary_amount:
            form.salary_amount !== "" ? Number(form.salary_amount) : null,

          salary_unit: form.salary_unit,

          has_commission: form.has_commission,

          commission_revenue_type:
            form.has_commission && form.commission_revenue_type
              ? form.commission_revenue_type
              : null,

          commission_calculation_type:
            form.has_commission && form.commission_calculation_type
              ? form.commission_calculation_type
              : null,

          commission_value:
            form.has_commission && form.commission_value !== ""
              ? Number(form.commission_value)
              : null,

          commission_unit:
            form.has_commission && form.commission_unit
              ? form.commission_unit
              : null,

          minimum_revenue_target: form.has_commission
            ? Number(form.minimum_revenue_target || 0)
            : null,

          note: form.note,

          is_active: form.is_active,

          allowance_ids: form.allowances.map((a: any) => a.id),

          deduction_ids: form.deductions.map((d: any) => d.id),
        }),
      ).unwrap();

      await dispatch(fetchSalaryTemplates());

      onCreated?.(created);

      if (!embedded) {
        onClose();
      }

      setInternalForm(defaultTemplateForm);

      setToast({
        open: true,
        message: "Tạo biểu mẫu thành công",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.message || "Tạo biểu mẫu thất bại",
        type: "error",
      });
    }
  };

  if (!embedded && !open) return null;

  return (
    <>
      <div
        className={
          embedded
            ? "relative"
            : "fixed inset-0 z-[60] flex items-center justify-center"
        }
      >
        {!embedded && (
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        )}

        <div
          className={`
  ${embedded ? "relative" : "relative z-10 bg-white rounded-2xl shadow-xl"}
  w-full
  max-w-6xl
  max-h-[92vh]
  overflow-hidden
  flex flex-col
`}
        >
          {/* header */}
          {!embedded && (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Tạo biểu mẫu lương
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Thiết lập đầy đủ thông tin mẫu lương
                  </p>
                </div>

                <button onClick={onClose}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="flex flex-col gap-3">
              {/* template name */}
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <label className="text-sm font-medium">Tên biểu mẫu</label>

                <input
                  placeholder="Ví dụ: Lương kỹ thuật viên fulltime"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* salary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 items-center">
                  <label className="text-sm font-medium">Loại nhân viên</label>

                  <select
                    value={form.employee_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        employee_type: e.target.value as any,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="FULLTIME">Fulltime</option>

                    <option value="PARTTIME">Parttime</option>

                    <option value="CONTRACT">Hợp đồng</option>
                  </select>
                </div>

                {/* pay period */}
                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 items-center">
                  <label className="text-sm font-medium">
                    Kỳ hạn trả lương
                  </label>

                  <select
                    value={form.pay_period}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pay_period: e.target.value as
                          | "MONTHLY"
                          | "WEEKLY"
                          | "DAILY",
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="MONTHLY">Theo tháng</option>

                    <option value="WEEKLY">Theo tuần</option>

                    <option value="DAILY">Theo ngày</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 items-center">
                  <label className="text-sm font-medium">Mức lương</label>

                  <input
                    type="number"
                    value={form.salary_amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        salary_amount: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 items-center">
                  <label className="text-sm font-medium">Đơn vị lương</label>

                  <select
                    value={form.salary_unit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        salary_unit: e.target.value as "MONTHLY" | "HOURLY",
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="MONTHLY">Theo tháng</option>

                    <option value="HOURLY">Theo giờ</option>
                  </select>
                </div>
              </div>

              {/* commission */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Hoa hồng</h4>

                  <input
                    type="checkbox"
                    checked={form.has_commission}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        has_commission: e.target.checked,
                      })
                    }
                  />
                </div>

                {form.has_commission && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <select
                      value={form.commission_revenue_type || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          commission_revenue_type: e.target.value,
                        })
                      }
                      className="border rounded px-3 py-2"
                    >
                      <option value="">Chọn loại doanh thu</option>

                      <option value="PERSONAL_REVENUE">
                        Doanh thu cá nhân
                      </option>

                      <option value="BRANCH_REVENUE">
                        Doanh thu chi nhánh
                      </option>

                      <option value="WORK_HOUR">
                        Giờ làm thực tế
                      </option>
                    </select>

                    <select
                      value={form.commission_calculation_type || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          commission_calculation_type: e.target.value,
                        })
                      }
                      className="border rounded px-3 py-2"
                    >
                      <option value="">Chọn cách tính</option>

                      <option value="TOTAL_REVENUE">
                        Tính theo tổng doanh thu
                      </option>

                      <option value="REVENUE_OVER_TARGET">
                        Tính theo mức vượt doanh thu tối thiểu
                      </option>

                      <option value="WORK_HOUR">
                        Tính theo giờ làm thực tế
                      </option>
                    </select>

                    <div className="col-span-2">
                      <div className="text-sm font-medium mb-2">
                        Đơn vị hoa hồng
                      </div>

                      <div className="flex items-center gap-6">
                        <label
                          className={`flex items-center gap-2 ${
                            isWorkHour
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="radio"
                            disabled={isWorkHour}
                            name="commission_unit"
                            checked={form.commission_unit === "PERCENT"}
                            onChange={() =>
                              setForm({
                                ...form,
                                commission_unit: "PERCENT",
                              })
                            }
                          />

                          <span>Theo % doanh thu</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            disabled={isWorkHour}
                            name="commission_unit"
                            checked={form.commission_unit === "FIXED_AMOUNT"}
                            onChange={() =>
                              setForm({
                                ...form,
                                commission_unit: "FIXED_AMOUNT",
                              })
                            }
                          />

                          <span>Tiền cố định (VNĐ)</span>
                        </label>
                      </div>
                    </div>

                    <input
                      placeholder={
                        isWorkHour
                          ? "Nhập tiền / giờ làm thực tế"
                          : form.commission_unit === "PERCENT"
                            ? "Nhập % hoa hồng"
                            : "Nhập tiền hoa hồng cố định"
                      }
                      type="number"
                      value={form.commission_value}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          commission_value: e.target.value,
                        })
                      }
                      className="border rounded px-3 py-2"
                    />

                    {!isWorkHour && (
                      <input
                        placeholder="Target doanh thu"
                        type="number"
                        value={form.minimum_revenue_target}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            minimum_revenue_target: e.target.value,
                          })
                        }
                        className="border rounded px-3 py-2"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* allowances */}
              <div className="border rounded-xl p-2">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="font-semibold">Phụ cấp</h4>

                  {/* search */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm phụ cấp..."
                      value={allowanceKeyword}
                      onChange={(e) => setAllowanceKeyword(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />

                    {allowanceKeyword && allowanceOptions.length > 0 && (
                      <div
                        className="
                        absolute z-20 mt-1 w-full
                        bg-white border rounded-lg
                        shadow-lg overflow-hidden
                      "
                      >
                        {allowanceOptions.map((item: any) => (
                          <button
                            key={item.id}
                            type="button"
                            className="
                              w-full text-left
                              px-4 py-2
                              hover:bg-gray-100
                            "
                            onClick={() => {
                              const exists = form.allowances.some(
                                (a: any) => a.id === item.id,
                              );

                              if (exists) return;

                              setForm({
                                ...form,

                                allowances: [
                                  ...form.allowances,

                                  {
                                    ...item,
                                  },
                                ],
                              });

                              setAllowanceKeyword("");
                            }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="
                    whitespace-nowrap
  bg-amber-500
  hover:bg-amber-600
  text-white
  px-4 py-2
  rounded-lg
  text-sm
  transition
                  "
                    onClick={() => setOpenAllowanceModal(true)}
                  >
                    + Thêm phụ cấp
                  </button>
                </div>

                {/* table */}
                <div className="overflow-auto max-h-[260px] border rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-sm">
                        <th className="border px-2 py-2 text-sm text-left">
                          Tên phụ cấp
                        </th>

                        <th className="border px-2 py-2 text-sm">Số tiền</th>

                        <th className="border px-2 py-2 text-sm">Đơn vị</th>

                        <th className="border px-2 py-2 text-sm">Loại</th>

                        <th className="border px-2 py-2 text-sm">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {form.allowances.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="border px-2 py-2 text-sm">
                            {item.name}
                          </td>

                          <td className="border px-2 py-2 text-sm">
                            <input
                              type="number"
                              value={item.amount_value}
                              onChange={(e) => {
                                const updated = [...form.allowances];

                                updated[index].amount_value = e.target.value;

                                setForm({
                                  ...form,
                                  allowances: updated,
                                });
                              }}
                              className="
                                w-full border rounded
                                px-2 py-1
                              "
                            />
                          </td>

                          <td className="border px-2 py-2 text-sm">
                            <select
                              value={item.amount_type}
                              onChange={(e) => {
                                const updated = [...form.allowances];

                                updated[index].amount_type = e.target.value as
                                  | "FIXED"
                                  | "PERCENT";

                                setForm({
                                  ...form,
                                  allowances: updated,
                                });
                              }}
                              className="
                                w-full border rounded
                                px-2 py-1
                              "
                            >
                              <option value="FIXED">VNĐ</option>

                              <option value="PERCENT">% lương tháng</option>
                            </select>
                          </td>

                          <td className="border px-2 py-2 text-sm">
                            <select
                              value={item.apply_type}
                              onChange={(e) => {
                                const updated = [...form.allowances];

                                updated[index].apply_type = e.target.value as
                                  | "DAILY"
                                  | "MONTHLY";

                                setForm({
                                  ...form,
                                  allowances: updated,
                                });
                              }}
                              className="
                                w-full border rounded
                                px-2 py-1
                              "
                            >
                              <option value="DAILY">Mỗi ngày</option>

                              <option value="MONTHLY">Hàng tháng</option>
                            </select>
                          </td>

                          <td className="border px-2 py-2 text-sm text-center">
                            <button
                              type="button"
                              className="text-red-500"
                              onClick={() => {
                                setForm({
                                  ...form,

                                  allowances: form.allowances.filter(
                                    (_: any, i: number) => i !== index,
                                  ),
                                });
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}

                      {form.allowances.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="
                            border px-3 py-6
                            text-center text-gray-400
                          "
                          >
                            Chưa có phụ cấp
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* deductions */}
              <div className="border rounded-xl p-2">
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="font-semibold">Giảm trừ</h4>

                  {/* search */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm giảm trừ..."
                      value={deductionKeyword}
                      onChange={(e) => setDeductionKeyword(e.target.value)}
                      className="
                    w-full border rounded
                    px-3 py-2
                  "
                    />

                    {deductionKeyword && deductionOptions.length > 0 && (
                      <div
                        className="
                        absolute z-20 mt-1 w-full
                        bg-white border rounded-lg
                        shadow-lg overflow-hidden
                      "
                      >
                        {deductionOptions.map((item: any) => (
                          <button
                            key={item.id}
                            type="button"
                            className="
                              w-full text-left
                              px-4 py-2
                              hover:bg-gray-100
                            "
                            onClick={() => {
                              const exists = form.deductions.some(
                                (d: any) => d.id === item.id,
                              );

                              if (exists) return;

                              setForm({
                                ...form,

                                deductions: [
                                  ...form.deductions,

                                  {
                                    ...item,
                                  },
                                ],
                              });

                              setDeductionKeyword("");
                            }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="
                    whitespace-nowrap
  bg-amber-500
  hover:bg-amber-600
  text-white
  px-4 py-2
  rounded-lg
  text-sm
  transition
                  "
                    onClick={() => setOpenDeductionModal(true)}
                  >
                    + Thêm giảm trừ
                  </button>
                </div>

                {/* table */}
                <div className="overflow-auto max-h-[260px] border rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-sm">
                        <th className="border px-2 py-2 text-sm text-left">
                          Tên giảm trừ
                        </th>

                        <th className="border px-2 py-2 text-sm">Giá trị</th>

                        <th className="border px-2 py-2 text-sm">Đơn vị</th>

                        <th className="border px-2 py-2 text-sm">Áp dụng</th>

                        <th className="border px-2 py-2 text-sm">Điều kiện</th>

                        <th className="border px-2 py-2 text-sm">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {form.deductions.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="border px-2 py-2 text-sm">
                            {item.name}
                          </td>

                          <td className="border px-2 py-2 text-sm">
                            <input
                              type="number"
                              value={item.amount_value}
                              onChange={(e) => {
                                const updated = [...form.deductions];

                                updated[index].amount_value = e.target.value;

                                setForm({
                                  ...form,

                                  deductions: updated,
                                });
                              }}
                              className="
                                w-full border rounded
                                px-2 py-1
                              "
                            />
                          </td>

                          <td className="border px-2 py-2 text-sm">
                            <select
                              value={item.amount_type}
                              onChange={(e) => {
                                const updated = [...form.deductions];

                                updated[index].amount_type = e.target.value as
                                  | "FIXED"
                                  | "PERCENT";

                                setForm({
                                  ...form,

                                  deductions: updated,
                                });
                              }}
                              className="
                                w-full border rounded
                                px-2 py-1
                              "
                            >
                              <option value="FIXED">VNĐ</option>

                              <option value="PERCENT">% lương</option>
                            </select>
                          </td>

                          <td className="border px-2 py-2 text-sm">
                            <select
                              value={item.unit_type}
                              onChange={(e) => {
                                const updated = [...form.deductions];

                                updated[index].unit_type = e.target.value as
                                  | "MONTHLY"
                                  | "DAILY";

                                setForm({
                                  ...form,

                                  deductions: updated,
                                });
                              }}
                              className="
                                w-full border rounded
                                px-2 py-1
                              "
                            >
                              <option value="DAILY">Mỗi ngày</option>

                              <option value="MONTHLY">Hàng tháng</option>
                            </select>
                          </td>

                          <td className="border px-2 py-2 text-sm">
                            <input
                              type="text"
                              value={item.condition_text || ""}
                              onChange={(e) => {
                                const updated = [...form.deductions];

                                updated[index].condition_text = e.target.value;

                                setForm({
                                  ...form,

                                  deductions: updated,
                                });
                              }}
                              placeholder="Ví dụ: Đi muộn"
                              className="
                                w-full border rounded
                                px-2 py-1
                              "
                            />
                          </td>

                          <td className="border px-2 py-2 text-sm text-center">
                            <button
                              type="button"
                              className="text-red-500"
                              onClick={() => {
                                setForm({
                                  ...form,

                                  deductions: form.deductions.filter(
                                    (_: any, i: number) => i !== index,
                                  ),
                                });
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}

                      {form.deductions.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="
                            border px-3 py-6
                            text-center text-gray-400
                          "
                          >
                            Chưa có giảm trừ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* note */}
              <div>
                <label className="text-sm font-medium">Ghi chú</label>

                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      note: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-1 mt-1"
                  rows={3}
                />
              </div>

              {/* actions */}
              {!embedded && (
                <div className="border-t px-6 py-4 flex justify-end gap-3 bg-white">
                  <button
                    onClick={onClose}
                    className=" px-4 py-2
  border border-gray-300
  rounded-lg
  text-sm
  hover:bg-gray-50"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={handleSave}
                    className="
                  bg-amber-500
  hover:bg-amber-600
  text-white
  px-5 py-2
  rounded-lg
  text-sm
  transition
                "
                  >
                    Lưu biểu mẫu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SalaryAllowanceModal
        open={openAllowanceModal}
        onClose={() => setOpenAllowanceModal(false)}
        onSuccess={() => {
          dispatch(fetchSalaryAllowances(""));

          setToast({
            open: true,
            message: "Thêm phụ cấp thành công",
            type: "success",
          });
        }}
      />

      <SalaryDeductionModal
        open={openDeductionModal}
        onClose={() => setOpenDeductionModal(false)}
        onSuccess={() => {
          dispatch(fetchSalaryDeductions(""));

          setToast({
            open: true,
            message: "Thêm giảm trừ thành công",
            type: "success",
          });
        }}
      />

      {toast.open && (
        <div
          className={`
            fixed top-5 right-5 z-[999]
            px-4 py-3 rounded-xl
            text-white shadow-lg
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}
          `}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
