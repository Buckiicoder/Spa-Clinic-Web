import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getWaitingConsultationsAPI,
  getConsultationDetailAPI,
  startConsultationAPI,
  completeConsultationAPI,
  updateConsultationAPI,
  updateProfileAPI,
  deleteProfileAPI,
  createSessionAPI,
  updateSessionAPI,
  deleteSessionAPI,
  createProfileFromConsultationAPI,
} from "./doctorAPI";

interface ConsultationState {
  waitingList: any[];
  selectedBooking: any | null;
  loading: boolean;

  profiles: any[];
  sessions: any[];
}

const initialState: ConsultationState = {
  waitingList: [],
  selectedBooking: null,
  loading: false,

  profiles: [],
  sessions: [],
};

//
// ================= FETCH WAITING =================
//
export const fetchWaitingConsultations = createAsyncThunk(
  "consultation/waiting",
  async () => {
    const res = await getWaitingConsultationsAPI();
    return res.data;
  },
);

//
// ================= DETAIL =================
//
export const fetchConsultationDetail = createAsyncThunk(
  "consultation/detail",
  async (id: number) => {
    const res = await getConsultationDetailAPI(id);
    return res.data;
  },
);

//
// ================= START =================
//
export const startConsultation = createAsyncThunk(
  "consultation/start",
  async (id: number) => {
    const res = await startConsultationAPI(id);
    return res.data;
  },
);

//
// ================= COMPLETE =================
//
export const completeConsultation = createAsyncThunk(
  "consultation/complete",
  async (id: number) => {
    const res = await completeConsultationAPI(id);
    return res.data;
  },
);

//
// ================= UPDATE =================
//
export const updateConsultation = createAsyncThunk(
  "consultation/update",
  async ({ id, data }: { id: number; data: any }) => {
    const res = await updateConsultationAPI(id, data);
    return res.data;
  },
);

export const createProfileFromConsultation = createAsyncThunk(
  "doctor/createProfile",
  async (
    { bookingId, data }: { bookingId: number; data: any },
    { dispatch },
  ) => {
    const res = await createProfileFromConsultationAPI(bookingId, data);

    dispatch(fetchConsultationDetail(bookingId));

    return res.data;
  },
);

export const updateProfile = createAsyncThunk(
  "doctor/updateProfile",
  async ({ id, data }: { id: number; data: any }) => {
    const res = await updateProfileAPI(id, data);
    return res.data;
  },
);

export const deleteProfile = createAsyncThunk(
  "doctor/deleteProfile",
  async (id: number) => {
    await deleteProfileAPI(id);
    return id;
  },
);

export const createSession = createAsyncThunk(
  "doctor/createSession",
  async (
    data: {
      profile_id: number;
      session_no: number;
      service_date: string;
      service_time: string;
      technician_id?: number;
    }
  ) => {
    const res = await createSessionAPI(data);
    return res.data;
  }
);

export const updateSession = createAsyncThunk(
  "doctor/updateSession",
  async ({ id, data }: { id: number; data: any }) => {
    const res = await updateSessionAPI(id, data);
    return res.data;
  },
);

export const deleteSession = createAsyncThunk(
  "doctor/deleteSession",
  async (id: number) => {
    await deleteSessionAPI(id);
    return id;
  },
);

const consultationSlice = createSlice({
  name: "consultation",
  initialState,
  reducers: {
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
  },
  extraReducers: (builder) => {
    //
    // FETCH WAITING
    //
    builder.addCase(fetchWaitingConsultations.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchWaitingConsultations.fulfilled, (state, action) => {
      state.loading = false;
      state.waitingList = action.payload;
    });

    builder.addCase(fetchWaitingConsultations.rejected, (state) => {
      state.loading = false;
    });

    //
    // DETAIL
    //
    builder.addCase(fetchConsultationDetail.fulfilled, (state, action) => {
      state.selectedBooking = action.payload;
    });

    //
    // START CONSULTATION
    //
    builder.addCase(startConsultation.fulfilled, (state, action) => {
      const updated = action.payload;

      // 🔥 remove khỏi waiting list
      state.waitingList = state.waitingList.filter((b) => b.id !== updated.id);

      // 🔥 set vào detail
      state.selectedBooking = updated;
    });

    //
    // COMPLETE CONSULTATION
    //
    builder.addCase(completeConsultation.fulfilled, (state, action) => {
      const updated = action.payload;

      state.selectedBooking = updated;
    });

    //
    // UPDATE CONSULTATION
    //
    builder.addCase(updateConsultation.fulfilled, (state, action) => {
      state.selectedBooking = action.payload;
    });

    // ================= PROFILE =================

    // create
    builder.addCase(createProfileFromConsultation.fulfilled, (state, action) => {
      state.profiles.unshift(action.payload);

      // 🔥 gắn vào booking hiện tại
      if (state.selectedBooking) {
        state.selectedBooking.profile_id = action.payload.id;
      }
    });

    // update
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      const index = state.profiles.findIndex((p) => p.id === action.payload.id);

      if (index !== -1) {
        state.profiles[index] = action.payload;
      }
    });

    // delete
    builder.addCase(deleteProfile.fulfilled, (state, action) => {
      state.profiles = state.profiles.filter((p) => p.id !== action.payload);
    });

    // ================= SESSION =================

    // create
    builder.addCase(createSession.fulfilled, (state, action) => {
      state.sessions.push(action.payload);
    });

    // update
    builder.addCase(updateSession.fulfilled, (state, action) => {
      const index = state.sessions.findIndex((s) => s.id === action.payload.id);

      if (index !== -1) {
        state.sessions[index] = action.payload;
      }
    });

    // delete
    builder.addCase(deleteSession.fulfilled, (state, action) => {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
    });
  },
});

export const { clearSelectedBooking } = consultationSlice.actions;

export default consultationSlice.reducer;

//
// ================= SELECTORS =================
//
export const selectWaitingConsultations = (state: any) =>
  state.doctor?.waitingList || [];

export const selectConsultationDetail = (state: any) =>
  state.doctor?.selectedBooking || null;

export const selectConsultationLoading = (state: any) =>
  state.doctor?.loading || false;

export const selectProfiles = (state: any) =>
  state.doctor?.profiles || [];

export const selectSessions = (state: any) =>
  state.doctor?.sessions || [];