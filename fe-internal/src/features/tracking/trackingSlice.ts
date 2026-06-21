import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  startTrackingSessionAPI,
  completeStepTrackingAPI,
  pauseTrackingSessionAPI,
  resumeTrackingSessionAPI,
  transferTrackingSessionAPI,
  completeTrackingSessionAPI,
  getRealtimeTrackingDetailAPI,
  checkPauseTimeoutAPI,
  stopAfterPauseTimeoutAPI,
  uploadTrackingImageAPI,
} from "./trackingAPI";

interface TrackingState {
  realtimeSteps: any[];
  loading: boolean;
  pauseExpired: boolean;

  pauseExpiredAt: string | null;
}

const initialState: TrackingState = {
  realtimeSteps: [],
  loading: false,
  pauseExpired: false,
  pauseExpiredAt: null,
};

/**
 * ============================================
 * 🔹 START SESSION
 * ============================================
 */
export const startTrackingSession = createAsyncThunk(
  "tracking/startSession",
  async ({
    id,
    before_image_url,
  }: {
    id: number;
    before_image_url?: string;
  }) => {
    const res = await startTrackingSessionAPI(id, before_image_url);

    return res.data;
  },
);

/**
 * ============================================
 * 🔹 COMPLETE STEP
 * ============================================
 */
export const completeStepTracking = createAsyncThunk(
  "tracking/completeStep",
  async ({ id, current_step_no }: { id: number; current_step_no: number }) => {
    const res = await completeStepTrackingAPI(id, current_step_no);

    return res.data;
  },
);

/**
 * ============================================
 * 🔹 PAUSE
 * ============================================
 */
export const pauseTrackingSession = createAsyncThunk(
  "tracking/pause",
  async (id: number) => {
    const res = await pauseTrackingSessionAPI(id);

    return res.data;
  },
);

export const checkPauseTimeout = createAsyncThunk(
  "tracking/checkPauseTimeout",
  async (id: number) => {
    const res = await checkPauseTimeoutAPI(id);

    return res.data;
  },
);

export const stopAfterPauseTimeout = createAsyncThunk(
  "tracking/stopAfterPauseTimeout",
  async (id: number) => {
    const res = await stopAfterPauseTimeoutAPI(id);

    return res.data;
  },
);

/**
 * ============================================
 * 🔹 RESUME
 * ============================================
 */
export const resumeTrackingSession = createAsyncThunk(
  "tracking/resume",
  async (id: number) => {
    const res = await resumeTrackingSessionAPI(id);

    return res.data;
  },
);

/**
 * ============================================
 * 🔹 TRANSFER
 * ============================================
 */
export const transferTrackingSession = createAsyncThunk(
  "tracking/transfer",
  async (id: number) => {
    const res = await transferTrackingSessionAPI(id);

    return res.data;
  },
);

/**
 * ============================================
 * 🔹 COMPLETE SESSION
 * ============================================
 */
export const completeTrackingSession = createAsyncThunk(
  "tracking/completeSession",
  async ({ id, data }: { id: number; data: any }) => {
    const res = await completeTrackingSessionAPI(id, data);

    return res.data;
  },
);

/**
 * ============================================
 * 🔹 REALTIME DETAIL
 * ============================================
 */
export const fetchRealtimeTrackingDetail = createAsyncThunk(
  "tracking/realtimeDetail",
  async (id: number) => {
    const res = await getRealtimeTrackingDetailAPI(id);

    return res.data;
  },
);

export const uploadTrackingImage = createAsyncThunk(
  "tracking/uploadImage",

  async (file: File) => {
    const res = await uploadTrackingImageAPI(file);

    return res.data.image_url;
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
    builder
      .addCase(fetchRealtimeTrackingDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRealtimeTrackingDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.realtimeSteps = action.payload;
      })
      .addCase(fetchRealtimeTrackingDetail.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(checkPauseTimeout.fulfilled, (state, action) => {
      state.pauseExpired = action.payload.expired;

      state.pauseExpiredAt = action.payload.pause_expired_at;
    });
  },
});

export const { clearRealtimeTracking } = trackingSlice.actions;

export default trackingSlice.reducer;

/**
 * ============================================
 * 🔹 SELECTORS
 * ============================================
 */

export const selectRealtimeSteps = (state: any) =>
  state.tracking?.realtimeSteps || [];

export const selectPauseExpired = (state: any) => state.tracking.pauseExpired;

export const selectPauseExpiredAt = (state: any) =>
  state.tracking.pauseExpiredAt;
