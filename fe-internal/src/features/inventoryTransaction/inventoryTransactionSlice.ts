import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  InventoryTransaction,
  InventoryTransactionPayload,
} from "../../types/inventoryTransaction";
import {
  createInventoryTransactionAPI,
  updateInventoryTransactionAPI,
  confirmInventoryTransactionAPI,
  cancelInventoryTransactionAPI,
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

export const updateInventoryTransaction = createAsyncThunk(
  "inventoryTransaction/update",
  async ({ id, data }: { id: number; data: InventoryTransactionPayload }) => {
    const res = await updateInventoryTransactionAPI(id, data);

    return res.data.transaction;
  },
);

export const confirmInventoryTransaction = createAsyncThunk(
  "inventoryTransaction/confirm",
  async (id: number) => {
    const res = await confirmInventoryTransactionAPI(id);

    return res.data.transaction;
  },
);

export const cancelInventoryTransaction = createAsyncThunk(
  "inventoryTransaction/cancel",
  async (id: number) => {
    const res = await cancelInventoryTransactionAPI(id);

    return res.data;
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

    builder.addCase(updateInventoryTransaction.fulfilled, (state, action) => {
      const index = state.transactions.findIndex(
        (x) => x.id === action.payload.id,
      );

      if (index >= 0) {
        state.transactions[index] = action.payload;
      }

      if (state.selectedTransaction?.id === action.payload.id) {
        state.selectedTransaction = action.payload;
      }
    });

    builder.addCase(confirmInventoryTransaction.fulfilled, (state, action) => {
      const updated = action.payload;

      const index = state.transactions.findIndex((x) => x.id === updated.id);

      if (index >= 0) {
        state.transactions[index] = updated;
      }

      if (state.selectedTransaction?.id === updated.id) {
        state.selectedTransaction = updated;
      }
    });

    builder.addCase(cancelInventoryTransaction.fulfilled, (state, action) => {
      const updated = action.payload;

      const index = state.transactions.findIndex((x) => x.id === updated.id);

      if (index >= 0) {
        state.transactions[index] = updated;
      }

      if (state.selectedTransaction?.id === updated.id) {
        state.selectedTransaction = updated;
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
