import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  getProductsAPI,
  getProductByIdAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
} from "./productAPI";
import { uploadProductImageAPI } from "./productAPI";

export interface Product {
  id: number;
  code: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  unit: string;
  sale_price: number;
  current_price: number;
  stock_quantity: number;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
};

// 🔹 GET ALL
export const fetchProducts = createAsyncThunk(
  "product/fetch",
  async () => {
    const res = await getProductsAPI();
    return res.data;
  }
);

// 🔹 GET BY ID
export const fetchProductById = createAsyncThunk(
  "product/fetchById",
  async (id: number) => {
    const res = await getProductByIdAPI(id);
    return res.data;
  }
);

// 🔹 CREATE
export const createProduct = createAsyncThunk(
  "product/create",
  async (data: {
    code: string;
    barcode?: string;
    name: string;
    description?: string;
    category_id?: number;
    unit?: string;
    sale_price: number;
    current_price: number;
    stock_quantity?: number;
    image_url?: string;
    is_active?: boolean;
  }) => {
    const res = await createProductAPI(data);
    return res.data.product;
  }
);

export const uploadProductImage = createAsyncThunk(
  "product/uploadImage",
  async (file: File) => {
    const res = await uploadProductImageAPI(file);
    return res.data.image_url;
  }
);

// 🔹 UPDATE
export const updateProduct = createAsyncThunk(
  "product/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<Product>;
  }) => {
    const res = await updateProductAPI(id, data);
    return res.data.product;
  }
);

// 🔹 DELETE
export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id: number) => {
    await deleteProductAPI(id);
    return id;
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    // ================= FETCH ALL =================
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });

    builder.addCase(fetchProducts.rejected, (state) => {
      state.loading = false;
    });

    // ================= FETCH BY ID =================
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
    });

    builder.addCase(fetchProductById.rejected, (state) => {
      state.loading = false;
    });

    // ================= CREATE =================
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.products.unshift(action.payload);
    });

    // ================= UPDATE =================
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      const index = state.products.findIndex(
        (p) => p.id === action.payload.id
      );

      if (index !== -1) {
        state.products[index] = action.payload;
      }

      if (
        state.selectedProduct &&
        state.selectedProduct.id === action.payload.id
      ) {
        state.selectedProduct = action.payload;
      }
    });

    // ================= DELETE =================
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.products = state.products.filter(
        (p) => p.id !== action.payload
      );

      if (
        state.selectedProduct &&
        state.selectedProduct.id === action.payload
      ) {
        state.selectedProduct = null;
      }
    });
  },
});

export const { clearSelectedProduct } =
  productSlice.actions;

export default productSlice.reducer;

// selectors
export const selectProducts = (state: any) =>
  state.product.products;

export const selectProductLoading = (state: any) =>
  state.product.loading;

export const selectSelectedProduct = (state: any) =>
  state.product.selectedProduct;
