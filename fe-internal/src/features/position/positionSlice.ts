import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPositionsAPI,
  getPositionByIdAPI,
  createPositionAPI,
  updatePositionAPI,
  deletePositionAPI,
} from "./positionAPI";

interface Position {
  id: number;
  name: string;
  description?: string;
}

interface PositionState {
  positions: Position[];
  selectedPosition: Position | null;
  loading: boolean;
}

const initialState: PositionState = {
  positions: [],
  selectedPosition: null,
  loading: false,
};

// GET ALL
export const fetchPositions = createAsyncThunk(
  "position/fetch",
  async () => {
    const res = await getPositionsAPI();
    return res.data;
  }
);

// GET BY ID
export const fetchPositionById = createAsyncThunk(
  "position/fetchById",
  async (id: number) => {
    const res = await getPositionByIdAPI(id);
    return res.data;
  }
);

// CREATE
export const createPosition = createAsyncThunk(
  "position/create",
  async (data: any) => {
    const res = await createPositionAPI(data);
    return res.data.position;
  }
);

// UPDATE
export const updatePosition = createAsyncThunk(
  "position/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: any;
  }) => {
    const res = await updatePositionAPI(id, data);
    return res.data.position;
  }
);

// DELETE
export const deletePosition = createAsyncThunk(
  "position/delete",
  async (id: number) => {
    await deletePositionAPI(id);
    return id;
  }
);

const positionSlice = createSlice({
  name: "position",
  initialState,
  reducers: {
    clearSelectedPosition: (state) => {
      state.selectedPosition = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPositions.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchPositions.fulfilled, (state, action) => {
      state.loading = false;
      state.positions = action.payload;
    });

    builder.addCase(fetchPositions.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(fetchPositionById.fulfilled, (state, action) => {
      state.selectedPosition = action.payload;
    });

    builder.addCase(createPosition.fulfilled, (state, action) => {
      state.positions.push(action.payload);
    });

    builder.addCase(updatePosition.fulfilled, (state, action) => {
      const index = state.positions.findIndex(
        (p) => p.id === action.payload.id
      );

      if (index !== -1) {
        state.positions[index] = action.payload;
      }
    });

    builder.addCase(deletePosition.fulfilled, (state, action) => {
      state.positions = state.positions.filter(
        (p) => p.id !== action.payload
      );
    });
  },
});

export default positionSlice.reducer;

export const { clearSelectedPosition } = positionSlice.actions;

export const selectPositions = (state: any) =>
  state.position.positions;

export const selectPositionLoading = (state: any) =>
  state.position.loading;

export const selectSelectedPosition = (state: any) =>
  state.position.selectedPosition;
