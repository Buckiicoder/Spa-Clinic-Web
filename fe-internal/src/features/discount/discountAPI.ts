import { api } from "../../services/api";

// GET ALL DISCOUNTS
export const fetchDiscountsAPI = (params?: {
  keyword?: string;

  is_active?: boolean;

  discount_type?: "PERCENT" | "FIXED";

  minimum_customer_rank?:
    | "BRONZE"
    | "SILVER"
    | "GOLD"
    | "DIAMOND"
    | "VIP"
    | "SUPER_VIP";
}) =>
  api.get("/discount", {
    params,
  });

// GET DETAIL DISCOUNT
export const fetchDiscountDetailAPI = (id: number) =>
  api.get(`/discount/${id}`);

// CREATE DISCOUNT
export const createDiscountAPI = (data: {
  code: string;

  name: string;

  description?: string | null;

  discount_type: "PERCENT" | "FIXED";

  discount_value: number;

  max_discount_amount?: number | null;

  min_order_amount?: number;

  usage_limit?: number | null;

  usage_limit_per_customer?: number;

  minimum_customer_rank?:
    | "BRONZE"
    | "SILVER"
    | "GOLD"
    | "DIAMOND"
    | "VIP"
    | "SUPER_VIP"
    | null;

  first_visit_only?: boolean;

  start_date: string;

  end_date: string;

  is_active?: boolean;

  service_ids?: number[];

  service_package_ids?: number[];
}) => api.post("/discount", data);

// UPDATE DISCOUNT
export const updateDiscountAPI = (
  id: number,
  data: Partial<{
    code: string;

    name: string;

    description?: string | null;

    discount_type: "PERCENT" | "FIXED";

    discount_value: number;

    max_discount_amount?: number | null;

    min_order_amount?: number;

    usage_limit?: number | null;

    usage_limit_per_customer?: number;

    minimum_customer_rank?:
      | "BRONZE"
      | "SILVER"
      | "GOLD"
      | "DIAMOND"
      | "VIP"
      | "SUPER_VIP"
      | null;

    first_visit_only?: boolean;

    start_date: string;

    end_date: string;

    is_active?: boolean;

    service_ids?: number[];

    service_package_ids?: number[];
  }>
) => api.put(`/discount/${id}`, data);

// DELETE DISCOUNT
export const deleteDiscountAPI = (id: number) =>
  api.delete(`/discount/${id}`);