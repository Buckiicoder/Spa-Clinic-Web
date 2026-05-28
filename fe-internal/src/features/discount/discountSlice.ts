import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  fetchDiscountsAPI,
  fetchDiscountDetailAPI,
  createDiscountAPI,
  updateDiscountAPI,
  deleteDiscountAPI,
} from "./discountAPI";

interface DiscountState {
  loading: boolean;

  discounts: any[];

  discount: any | null;

  error: string | null;
}

const initialState: DiscountState = {
  loading: false,

  discounts: [],

  discount: null,

  error: null,
};

export const fetchDiscounts = createAsyncThunk(
  "discounts/fetchAll",

  async (params?: {
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
  }) => {
    const res = await fetchDiscountsAPI(params);

    return res.data;
  }
);

export const fetchDiscountDetail = createAsyncThunk(
  "discounts/fetchDetail",

  async (id: number) => {
    const res = await fetchDiscountDetailAPI(id);

    return res.data;
  }
);

export const createDiscount = createAsyncThunk(
  "discounts/create",

  async (data: {
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
  }) => {
    const res = await createDiscountAPI(data);

    return res.data;
  }
);

export const updateDiscount = createAsyncThunk(
  "discounts/update",

  async ({
    id,
    data,
  }: {
    id: number;

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
    }>;
  }) => {
    const res = await updateDiscountAPI(
      id,
      data
    );

    return res.data;
  }
);

export const deleteDiscount = createAsyncThunk(
  "discounts/delete",

  async (id: number) => {
    const res = await deleteDiscountAPI(id);

    return {
      id,
      ...res.data,
    };
  }
);

const discountSlice = createSlice({
  name: "discounts",

  initialState,

  reducers: {
    clearDiscountError: (state) => {
      state.error = null;
    },

    clearDiscountDetail: (state) => {
      state.discount = null;
    },
  },

  extraReducers: (builder) => {
    // ============================================
    // FETCH ALL
    // ============================================

    builder.addCase(fetchDiscounts.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      fetchDiscounts.fulfilled,
      (state, action) => {
        state.loading = false;

        state.discounts = action.payload;
      }
    );

    builder.addCase(
      fetchDiscounts.rejected,
      (state, action) => {
        state.loading = false;

        state.error =
          action.error.message ||
          "Fetch discounts failed";
      }
    );

    // ============================================
    // FETCH DETAIL
    // ============================================

    builder.addCase(
      fetchDiscountDetail.pending,
      (state) => {
        state.loading = true;
      }
    );

    builder.addCase(
      fetchDiscountDetail.fulfilled,
      (state, action) => {
        state.loading = false;

        state.discount = action.payload;
      }
    );

    builder.addCase(
      fetchDiscountDetail.rejected,
      (state, action) => {
        state.loading = false;

        state.error =
          action.error.message ||
          "Fetch discount detail failed";
      }
    );

    // ============================================
    // CREATE
    // ============================================

    builder.addCase(createDiscount.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(
      createDiscount.fulfilled,
      (state, action) => {
        state.loading = false;

        state.discount = action.payload;

        state.discounts.unshift(action.payload);
      }
    );

    builder.addCase(
      createDiscount.rejected,
      (state, action) => {
        state.loading = false;

        state.error =
          action.error.message ||
          "Create discount failed";
      }
    );

    // ============================================
    // UPDATE
    // ============================================

    builder.addCase(updateDiscount.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(
      updateDiscount.fulfilled,
      (state, action) => {
        state.loading = false;

        state.discount = action.payload;

        state.discounts = state.discounts.map(
          (item) =>
            item.id === action.payload.id
              ? action.payload
              : item
        );
      }
    );

    builder.addCase(
      updateDiscount.rejected,
      (state, action) => {
        state.loading = false;

        state.error =
          action.error.message ||
          "Update discount failed";
      }
    );

    // ============================================
    // DELETE
    // ============================================

    builder.addCase(deleteDiscount.pending, (state) => {
      state.loading = true;

      state.error = null;
    });

    builder.addCase(
      deleteDiscount.fulfilled,
      (state, action) => {
        state.loading = false;

        state.discounts = state.discounts.map(
          (item) =>
            item.id === action.payload.data.id
              ? action.payload.data
              : item
        );
      }
    );

    builder.addCase(
      deleteDiscount.rejected,
      (state, action) => {
        state.loading = false;

        state.error =
          action.error.message ||
          "Delete discount failed";
      }
    );
  },
});

export const {
  clearDiscountError,
  clearDiscountDetail,
} = discountSlice.actions;

export default discountSlice.reducer;


export const selectDiscountLoading = (
  state: any
) => state.discount.loading;

export const selectDiscounts = (state: any) =>
  state.discount.discounts;

export const selectDiscountDetail = (
  state: any
) => state.discount.discount;

export const selectDiscountError = (
  state: any
) => state.discount.error;