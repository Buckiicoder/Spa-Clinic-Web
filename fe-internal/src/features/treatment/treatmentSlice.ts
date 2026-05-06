import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTreatmentPackagesAPI,
  getTreatmentDetailAPI,
  saveTreatmentPlanAPI,
  searchSessionsAPI,
  searchStepsAPI,
} from "./treatmentAPI";

interface TreatmentState {
  packages: any[];
  currentPlan: any | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: TreatmentState = {
  packages: [],
  currentPlan: null,
  loading: false,
  saving: false,
  error: null,
};


// ================= FETCH PACKAGES =================
export const fetchTreatmentPackages = createAsyncThunk(
  "treatment/fetchPackages",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getTreatmentPackagesAPI();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Lấy danh sách liệu trình thất bại"
      );
    }
  }
);

// ================= FETCH DETAIL =================
export const fetchTreatmentDetail = createAsyncThunk(
  "treatment/fetchDetail",
  async (packageId: number, { rejectWithValue }) => {
    try {
      const res = await getTreatmentDetailAPI(packageId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Lấy chi tiết liệu trình thất bại"
      );
    }
  }
);

// ================= SAVE =================
export const saveTreatmentPlan = createAsyncThunk(
  "treatment/save",
  async (
    { packageId, data }: { packageId: number; data: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await saveTreatmentPlanAPI(packageId, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Save thất bại"
      );
    }
  }
);

// ================= SEARCH STEPS =================
export const searchSteps = createAsyncThunk(
  "treatment/searchSteps",
  async (keyword: string, { rejectWithValue }) => {
    try {
      const res = await searchStepsAPI(keyword);
      return res.data;
    } catch (err: any) {
      return rejectWithValue("Lỗi search step");
    }
  }
);

// ================= SEARCH SESSIONS =================
export const searchSessions = createAsyncThunk(
  "treatment/searchSessions",
  async (keyword: string, { rejectWithValue }) => {
    try {
      const res = await searchSessionsAPI(keyword);
      return res.data;
    } catch (err: any) {
      return rejectWithValue("Lỗi search session");
    }
  }
);

const treatmentSlice = createSlice({
  name: "treatment",
  initialState,
  reducers: {
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ===== FETCH PACKAGES =====
      .addCase(fetchTreatmentPackages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTreatmentPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload || [];
      })
      .addCase(fetchTreatmentPackages.rejected, (state) => {
        state.loading = false;
      })

      // ===== FETCH DETAIL =====
      .addCase(fetchTreatmentDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTreatmentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload || null;
      })
      .addCase(fetchTreatmentDetail.rejected, (state) => {
        state.loading = false;
      })

      // ===== SAVE =====
      .addCase(saveTreatmentPlan.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveTreatmentPlan.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveTreatmentPlan.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPlan, clearCurrentPlan } =
  treatmentSlice.actions;

export default treatmentSlice.reducer;


// ================= SELECTORS =================
export const selectTreatmentPackages = (state: any) =>
  state.treatment.packages;

export const selectCurrentPlan = (state: any) =>
  state.treatment.currentPlan;

export const selectTreatmentLoading = (state: any) =>
  state.treatment.loading;

export const selectSaving = (state: any) =>
  state.treatment.saving;

export const selectTreatmentError = (state: any) =>
  state.treatment.error;
