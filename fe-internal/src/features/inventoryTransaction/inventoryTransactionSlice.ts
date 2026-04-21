import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { InventoryTransaction } from "../../types/inventoryTransaction";
import {
  createInventoryTransactionAPI,
  deleteInventoryTransactionAPI,
  getInventoryTransactionByIdAPI,
  getInventoryTransactionsAPI,
} from "./inventoryTransactionAPI";

interface InventoryTransactionState {
  transactions: InventoryTransaction[];
  selectedTransaction: InventoryTransaction | null;
  loading: boolean;
}

const initialState: InventoryTransactionState = {
  transactions: [],
  selectedTransaction: null,
  loading: false,
};

// 🔹 GET ALL
export const fetchInventoryTransactions = createAsyncThunk(
  "inventoryTransaction/fetchAll",
  async () => {
    const res = await getInventoryTransactionsAPI();
    return res.data;
  },
);

// 🔹 GET DETAIL
export const fetchInventoryTransactionById = createAsyncThunk(
  "inventoryTransaction/fetchById",
  async (id: number) => {
    const res = await getInventoryTransactionByIdAPI(id);
    return res.data;
  },
);

// 🔹 CREATE
export const createInventoryTransaction = createAsyncThunk(
  "inventoryTransaction/create",
  async (data: {
    code: string;
    type: "IMPORT" | "EXPORT" | "ADJUST";
    note?: string;
    total_extra_cost?: number;
    transaction_date?: string;
    items: {
      product_id: number;
      quantity: number;
      unit_price: number;
      note?: string;
    }[];
  }) => {
    const res = await createInventoryTransactionAPI(data);
    return res.data.transaction;
  },
);

// 🔹 DELETE
export const deleteInventoryTransaction = createAsyncThunk(
  "inventoryTransaction/delete",
  async (id: number) => {
    await deleteInventoryTransactionAPI(id);
    return id;
  },
);

const inventoryTransactionSlice = createSlice({
  name: "inventoryTransaction",
  initialState,
  reducers: {
    clearSelectedInventoryTransaction: (state) => {
      state.selectedTransaction = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH ALL
    builder.addCase(fetchInventoryTransactions.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchInventoryTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.transactions = action.payload;
    });

    builder.addCase(fetchInventoryTransactions.rejected, (state) => {
      state.loading = false;
    });

    // FETCH DETAIL
    builder.addCase(fetchInventoryTransactionById.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      fetchInventoryTransactionById.fulfilled,
      (state, action) => {
        state.loading = false;
        state.selectedTransaction = action.payload;
      },
    );

    builder.addCase(fetchInventoryTransactionById.rejected, (state) => {
      state.loading = false;
    });

    // CREATE
    builder.addCase(createInventoryTransaction.fulfilled, (state, action) => {
      state.transactions.unshift(action.payload);
    });

    // DELETE
    builder.addCase(deleteInventoryTransaction.fulfilled, (state, action) => {
      state.transactions = state.transactions.filter(
        (item) => item.id !== action.payload,
      );

      if (state.selectedTransaction?.id === action.payload) {
        state.selectedTransaction = null;
      }
    });
  },
});

export const { clearSelectedInventoryTransaction } =
  inventoryTransactionSlice.actions;

export default inventoryTransactionSlice.reducer;

// selectors
export const selectInventoryTransactions = (state: any) =>
  state.inventoryTransaction.transactions;

export const selectInventoryTransactionLoading = (state: any) =>
  state.inventoryTransaction.loading;

export const selectSelectedInventoryTransaction = (state: any) =>
  state.inventoryTransaction.selectedTransaction;
