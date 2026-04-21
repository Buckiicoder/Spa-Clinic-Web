import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBranchesAPI,
  getBranchByIdAPI,
  createBranchAPI,
  updateBranchAPI,
  deleteBranchAPI,
} from "./branchAPI";

export interface Branch {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

interface BranchState {
  branches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
}

const initialState: BranchState = {
  branches: [],
  selectedBranch: null,
  loading: false,
};

// GET ALL
export const fetchBranches = createAsyncThunk(
  "branch/fetch",
  async () => {
    const res = await getBranchesAPI();
    return res.data;
  }
);

// GET BY ID
export const fetchBranchById = createAsyncThunk(
  "branch/fetchById",
  async (id: number) => {
    const res = await getBranchByIdAPI(id);
    return res.data;
  }
);


// CREATE
export const createBranch = createAsyncThunk(
  "branch/create",
  async (data: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
  }) => {
    const res = await createBranchAPI(data);
    return res.data.branch;
  }
);

// UPDATE
export const updateBranch = createAsyncThunk(
  "branch/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: Partial<{
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      radius_meters: number;
    }>;
  }) => {
    const res = await updateBranchAPI(id, data);
    return res.data.branch;
  }
);

// DELETE
export const deleteBranch = createAsyncThunk(
  "branch/delete",
  async (id: number) => {
    await deleteBranchAPI(id);
    return id;
  }
);

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    clearSelectedBranch: (state) => {
      state.selectedBranch = null;
    },
  },
  extraReducers: (builder) => {
    // GET ALL
    builder.addCase(fetchBranches.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchBranches.fulfilled, (state, action) => {
      state.loading = false;
      state.branches = action.payload;
    });

    builder.addCase(fetchBranches.rejected, (state) => {
      state.loading = false;
    });

    // GET BY ID
    builder.addCase(fetchBranchById.fulfilled, (state, action) => {
      state.selectedBranch = action.payload;
    });

    // CREATE
    builder.addCase(createBranch.fulfilled, (state, action) => {
      state.branches.push(action.payload);
    });

    // UPDATE
    builder.addCase(updateBranch.fulfilled, (state, action) => {
      const index = state.branches.findIndex(
        (b) => b.id === action.payload.id
      );

      if (index !== -1) {
        state.branches[index] = action.payload;
      }

      if (
        state.selectedBranch &&
        state.selectedBranch.id === action.payload.id
      ) {
        state.selectedBranch = action.payload;
      }
    });

    // DELETE
    builder.addCase(deleteBranch.fulfilled, (state, action) => {
      state.branches = state.branches.filter(
        (b) => b.id !== action.payload
      );

      if (state.selectedBranch?.id === action.payload) {
        state.selectedBranch = null;
      }
    });
  },
});

export default branchSlice.reducer;

export const { clearSelectedBranch } = branchSlice.actions;

// SELECTORS
export const selectBranches = (state: any) => state.branch.branches;

export const selectSelectedBranch = (state: any) =>
  state.branch.selectedBranch;

export const selectBranchLoading = (state: any) =>
  state.branch.loading;