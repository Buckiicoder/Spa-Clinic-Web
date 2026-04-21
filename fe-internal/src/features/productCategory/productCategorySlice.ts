import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import {
  createProductCategoryAPI,
  deleteProductCategoryAPI,
  getProductCategoriesAPI,
  updateProductCategoryAPI,
} from "./productCategoryAPI";

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
}

interface ProductCategoryState {
  categories: ProductCategory[];
  loading: boolean;
}

const initialState: ProductCategoryState = {
  categories: [],
  loading: false,
};

// GET
export const fetchProductCategories = createAsyncThunk(
  "productCategory/fetch",
  async () => {
    const res = await getProductCategoriesAPI();
    return res.data;
  },
);

// CREATE
export const createProductCategory = createAsyncThunk(
  "productCategory/create",
  async (data: {
    name: string;
    description?: string;
  }) => {
    const res = await createProductCategoryAPI(data);
    return res.data.category;
  },
);

// UPDATE
export const updateProductCategory = createAsyncThunk(
  "productCategory/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<ProductCategory>;
  }) => {
    const res = await updateProductCategoryAPI(id, data);
    return res.data.category;
  },
);

// DELETE
export const deleteProductCategory = createAsyncThunk(
  "productCategory/delete",
  async (id: number) => {
    await deleteProductCategoryAPI(id);
    return id;
  },
);

const productCategorySlice = createSlice({
  name: "productCategory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProductCategories.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      fetchProductCategories.fulfilled,
      (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      },
    );

    builder.addCase(fetchProductCategories.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(
      createProductCategory.fulfilled,
      (state, action) => {
        state.categories.push(action.payload);
      },
    );

    builder.addCase(
      updateProductCategory.fulfilled,
      (state, action) => {
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id,
        );

        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      },
    );

    builder.addCase(
      deleteProductCategory.fulfilled,
      (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload,
        );
      },
    );
  },
});

export default productCategorySlice.reducer;

export const selectProductCategories = (state: any) =>
  state.productCategory.categories;

export const selectProductCategoryLoading = (state: any) =>
  state.productCategory.loading;
