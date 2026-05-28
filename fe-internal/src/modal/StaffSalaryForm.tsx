import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  fetchSalaryTemplates,
  fetchSalaryTemplateDetail,
  selectSalaryTemplates,
} from "../features/salary/salary-template/salary-templateSlice";

import {
  assignStaffSalary,
  fetchStaffSalaryDetail,
} from "../features/salary/staff-salary/staff-salarySlice";

import SalaryTemplateModal from "./SalaryTemplateModal";

import { StaffSalaryFormState } from "../types/salary";

interface Props {
  initialData?: any;
  onClose: () => void;
}

export default function StaffSalaryForm({ initialData, onClose }: Props) {
  const dispatch: any = useDispatch();

  const templates = useSelector(selectSalaryTemplates);

  const [openTemplateModal, setOpenTemplateModal] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const [form, setForm] = useState<StaffSalaryFormState>({
    template_id: "",

    employee_type: "FULLTIME",

    pay_period: "MONTHLY",

    salary_amount: "",

    salary_unit: "MONTHLY",

    has_commission: false,

    commission_revenue_type: null,

    commission_calculation_type: null,

    commission_value: "",

    commission_unit: null,

    minimum_revenue_target: "",

    effective_from: "",

    effective_to: "",

    note: "",

    is_active: true,

    allowances: [],

    deductions: [],
  });

  useEffect(() => {
    dispatch(fetchSalaryTemplates());
  }, [dispatch]);

  useEffect(() => {
  if (!initialData?.id) return;

  const loadStaffSalary = async () => {
    try {
      const detail = await dispatch(
        fetchStaffSalaryDetail(initialData.id),
      ).unwrap();

      if (!detail) return;

      setForm((prev: any) => ({
        ...prev,

        template_id: detail.template_id
          ? String(detail.template_id)
          : "",

        name: detail.template_name || "",

        employee_type:
          detail.employee_type || "FULLTIME",

        pay_period:
          detail.pay_period || "MONTHLY",

        salary_amount:
          detail.salary_amount?.toString() || "",

        salary_unit:
          detail.salary_unit || "MONTHLY",

        has_commission:
          detail.has_commission || false,

        commission_revenue_type:
          detail.commission_revenue_type || null,

        commission_calculation_type:
          detail.commission_calculation_type || null,

        commission_value:
          detail.commission_value?.toString() || "",

        commission_unit:
          detail.commission_unit || "PERCENT",

        minimum_revenue_target:
          detail.minimum_revenue_target?.toString() || "",

        effective_from:
          detail.effective_from
            ? detail.effective_from.split("T")[0]
            : "",

        effective_to:
          detail.effective_to
            ? detail.effective_to.split("T")[0]
            : "",

        note: detail.note || "",

        is_active:
          detail.is_active ?? true,

        allowances: detail.allowances || [],

        deductions: detail.deductions || [],
      }));
    } catch (err) {
      console.error("Load salary detail failed", err);
    }
  };

  loadStaffSalary();
}, [dispatch, initialData]);

  const hasSalaryConfig = !!form.template_id || !!initialData?.salary_config;

  const applyTemplateToForm = (detail: any) => {
    setForm((prev: any) => ({
      ...prev,

      template_id: String(detail.id),

      name: detail.name || "",

      employee_type: detail.employee_type || "FULLTIME",

      pay_period: detail.pay_period || "MONTHLY",

      salary_amount: detail.salary_amount?.toString() || "",

      salary_unit: detail.salary_unit || "MONTHLY",

      has_commission: detail.has_commission || false,

      commission_revenue_type: detail.commission_revenue_type || null,

      commission_calculation_type: detail.commission_calculation_type || null,

      commission_value: detail.commission_value?.toString() || "",

      commission_unit:
        detail.commission_unit || "PERCENT",

      minimum_revenue_target: detail.minimum_revenue_target?.toString() || "",

      note: detail.note || "",

      allowances: detail.allowances || [],

      deductions: detail.deductions || [],
    }));
  };

  useEffect(() => {
    if (!initialData?.salary_config) return;

    const salary = initialData.salary_config;

    setForm({
      template_id: salary.template_id?.toString() || "",

      employee_type: salary.employee_type || "FULLTIME",

      pay_period: salary.pay_period || "MONTHLY",

      salary_amount: salary.salary_amount?.toString() || "",

      salary_unit: salary.salary_unit || "MONTHLY",

      has_commission: salary.has_commission || false,

      commission_revenue_type: salary.commission_revenue_type || null,

      commission_calculation_type: salary.commission_calculation_type || null,

      commission_value: salary.commission_value?.toString() || "",

      commission_unit: salary.commission_unit?.toString() || "",

      minimum_revenue_target: salary.minimum_revenue_target?.toString() || "",

      effective_from: salary.effective_from || "",

      effective_to: salary.effective_to || "",

      note: salary.note || "",

      is_active: salary.is_active ?? true,

      allowances: salary.allowances || [],

      deductions: salary.deductions || [],
    });
  }, [initialData]);

  const handleSave = async () => {
    try {
      await dispatch(
        assignStaffSalary({
          staff_id: initialData.id,

          template_id: form.template_id ? Number(form.template_id) : null,

          employee_type: form.employee_type,

          pay_period: form.pay_period,

          salary_amount:
            form.salary_amount !== "" ? Number(form.salary_amount) : null,

          salary_unit: form.salary_unit,

          has_commission: form.has_commission,

          commission_revenue_type: form.commission_revenue_type || null,

          commission_calculation_type: form.commission_calculation_type || null,

          commission_value:
            form.commission_value !== "" ? Number(form.commission_value) : null,

          commission_unit:
            form.has_commission
              ? form.commission_unit
              : null,

          minimum_revenue_target:
            form.minimum_revenue_target !== ""
              ? Number(form.minimum_revenue_target)
              : null,

          effective_from: form.effective_from,

          effective_to: form.effective_to || null,

          note: form.note,

          is_active: form.is_active,

          allowance_ids: (form.allowances || []).map((a: any) => a.id),
deduction_ids: (form.deductions || []).map((d: any) => d.id),
        }),
      ).unwrap();

      setToast({
        open: true,
        message: "Thiết lập lương thành công",
        type: "success",
      });

      onClose();
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.message || "Thiết lập lương thất bại",

        type: "error",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* template actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOpenTemplateModal(true)}
            className="
              bg-blue-500 text-white
              px-4 py-2 rounded
            "
          >
            + Tạo biểu mẫu
          </button>

          <select
            value={form.template_id}
            onChange={async (e) => {
              const templateId = e.target.value;

              setForm((prev) => ({
                ...prev,
                template_id: templateId,
              }));

              if (!templateId) return;

              try {
                const detail = await dispatch(
                  fetchSalaryTemplateDetail(Number(templateId)),
                ).unwrap();

                applyTemplateToForm(detail);
              } catch (err) {
                console.error(err);
              }
            }}
            className="
              flex-1 border rounded
              px-3 py-2
            "
          >
            <option value="">Chọn biểu mẫu lương</option>

            {templates.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {hasSalaryConfig && (
          <div className="border rounded-2xl p-5 bg-gray-50">
            <SalaryTemplateModal embedded form={form} setForm={setForm} />
          </div>
        )}

        {/* effective */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Hiệu lực từ</label>

            <input
              type="date"
              value={form.effective_from}
              onChange={(e) =>
                setForm({
                  ...form,
                  effective_from: e.target.value,
                })
              }
              className="
                w-full border rounded
                px-3 py-2
              "
            />
          </div>

          <div>
            <label className="text-sm font-medium">Hiệu lực đến</label>

            <input
              type="date"
              value={form.effective_to}
              onChange={(e) =>
                setForm({
                  ...form,
                  effective_to: e.target.value,
                })
              }
              className="
                w-full border rounded
                px-3 py-2
              "
            />
          </div>
        </div>

        {/* actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              border px-4 py-2 rounded
            "
          >
            Hủy
          </button>

          <button
            onClick={handleSave}
            className="
              bg-amber-500 text-white
              px-4 py-2 rounded
            "
          >
            Lưu thiết lập
          </button>
        </div>
      </div>

      {openTemplateModal && (
        <SalaryTemplateModal
          open={openTemplateModal}
          onClose={() => setOpenTemplateModal(false)}
          onCreated={(created) => {
            applyTemplateToForm(created);

            setOpenTemplateModal(false);
          }}
        />
      )}

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
