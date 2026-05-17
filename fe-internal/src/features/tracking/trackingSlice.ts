import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  startTrackingSessionAPI,
  completeStepTrackingAPI,
  pauseTrackingSessionAPI,
  resumeTrackingSessionAPI,
  transferTrackingSessionAPI,
  completeTrackingSessionAPI,
  getRealtimeTrackingDetailAPI,
} from "./trackingAPI";

interface TrackingState {
  realtimeSteps: any[];
  loading: boolean;
}

const initialState: TrackingState = {
  realtimeSteps: [],
  loading: false,
};

/**
 * ============================================
 * 🔹 START SESSION
 * ============================================
 */
export const startTrackingSession =
  createAsyncThunk(
    "tracking/startSession",
    async (id: number) => {
      const res =
        await startTrackingSessionAPI(id);

      return res.data;
    },
  );

/**
 * ============================================
 * 🔹 COMPLETE STEP
 * ============================================
 */
export const completeStepTracking =
  createAsyncThunk(
    "tracking/completeStep",
    async ({
      id,
      current_step_no,
    }: {
      id: number;
      current_step_no: number;
    }) => {
      const res =
        await completeStepTrackingAPI(
          id,
          current_step_no,
        );

      return res.data;
    },
  );

/**
 * ============================================
 * 🔹 PAUSE
 * ============================================
 */
export const pauseTrackingSession =
  createAsyncThunk(
    "tracking/pause",
    async (id: number) => {
      const res =
        await pauseTrackingSessionAPI(id);

      return res.data;
    },
  );

/**
 * ============================================
 * 🔹 RESUME
 * ============================================
 */
export const resumeTrackingSession =
  createAsyncThunk(
    "tracking/resume",
    async (id: number) => {
      const res =
        await resumeTrackingSessionAPI(id);

      return res.data;
    },
  );

/**
 * ============================================
 * 🔹 TRANSFER
 * ============================================
 */
export const transferTrackingSession =
  createAsyncThunk(
    "tracking/transfer",
    async (id: number) => {
      const res =
        await transferTrackingSessionAPI(id);

      return res.data;
    },
  );

/**
 * ============================================
 * 🔹 COMPLETE SESSION
 * ============================================
 */
export const completeTrackingSession =
  createAsyncThunk(
    "tracking/completeSession",
    async ({
      id,
      data,
    }: {
      id: number;
      data: any;
    }) => {
      const res =
        await completeTrackingSessionAPI(
          id,
          data,
        );

      return res.data;
    },
  );

/**
 * ============================================
 * 🔹 REALTIME DETAIL
 * ============================================
 */
export const fetchRealtimeTrackingDetail =
  createAsyncThunk(
    "tracking/realtimeDetail",
    async (id: number) => {
      const res =
        await getRealtimeTrackingDetailAPI(
          id,
        );

      return res.data;
    },
  );

const trackingSlice = createSlice({
  name: "tracking",

  initialState,

  reducers: {
    clearRealtimeTracking: (state) => {
      state.realtimeSteps = [];
    },
  },

  extraReducers: (builder) => {
    /**
     * realtime detail
     */
    builder.addCase(
      fetchRealtimeTrackingDetail.fulfilled,
      (state, action) => {
        state.realtimeSteps =
          action.payload;
      },
    );
  },
});

export const {
  clearRealtimeTracking,
} = trackingSlice.actions;

export default trackingSlice.reducer;

/**
 * ============================================
 * 🔹 SELECTORS
 * ============================================
 */

export const selectRealtimeSteps = (
  state: any,
) =>
  state.tracking?.realtimeSteps || [];