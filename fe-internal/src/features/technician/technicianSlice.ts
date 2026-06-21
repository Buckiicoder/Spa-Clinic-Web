import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getConsultedTodayAPI,
  getWorkingTechniciansAPI,
  assignTechnicianAPI,
  getMySessionsAPI,
  getSessionDetailAPI,
} from "./technicianAPI";

interface TechnicianState {
  consultedToday: any[];
  technicians: any[];

  mySessions: any[];
  selectedSession: any | null;

  loading: boolean;
}

const initialState: TechnicianState = {
  consultedToday: [],
  technicians: [],

  mySessions: [],
  selectedSession: null,

  loading: false,
};

//
// ================= MANAGER =================
//

// 🔹 khách đã khám xong
export const fetchConsultedToday = createAsyncThunk(
  "technician/consultedToday",
  async () => {
    const res = await getConsultedTodayAPI();
    return res.data;
  },
);

// 🔹 danh sách KTV
export const fetchTechnicians = createAsyncThunk(
  "technician/technicians",
  async () => {
    const res = await getWorkingTechniciansAPI();
    return res.data;
  },
);

// 🔹 assign
export const assignTechnician = createAsyncThunk(
  "technician/assign",
  async (
    data: { session_id: number; technician_id: number; manager_id: number },
    { dispatch },
  ) => {
    const res = await assignTechnicianAPI(data);

    // 🔥 reload list
    dispatch(fetchConsultedToday());

    return res.data;
  },
);

//
// ================= TECHNICIAN =================
//

// 🔹 ca của tôi
export const fetchMySessions = createAsyncThunk(
  "technician/mySessions",
  async () => {
    const res = await getMySessionsAPI();
    return res.data;
  },
);

// 🔹 chi tiết
export const fetchSessionDetail = createAsyncThunk(
  "technician/sessionDetail",
  async (id: number) => {
    const res = await getSessionDetailAPI(id);
    return res.data;
  },
);

const technicianSlice = createSlice({
  name: "technician",
  initialState,
  reducers: {
    clearSelectedSession: (state) => {
      state.selectedSession = null;
    },
  },
  extraReducers: (builder) => {
    //
    // CONSULTED TODAY
    //
    builder.addCase(fetchConsultedToday.fulfilled, (state, action) => {
      state.consultedToday = action.payload;
    });

    //
    // TECHNICIANS
    //
    builder.addCase(fetchTechnicians.fulfilled, (state, action) => {
      state.technicians = action.payload;
    });

    //
    // MY SESSIONS
    //
    builder.addCase(fetchMySessions.fulfilled, (state, action) => {
      state.mySessions = action.payload;
    });

    //
    // SESSION DETAIL
    //
    builder.addCase(fetchSessionDetail.fulfilled, (state, action) => {
      state.selectedSession = action.payload;
    });
  },
});

export const { clearSelectedSession } = technicianSlice.actions;
export default technicianSlice.reducer;

//
// ================= SELECTORS =================
//

export const selectConsultedToday = (state: any) =>
  state.technician?.consultedToday || [];

export const selectTechnicians = (state: any) =>
  state.technician?.technicians || [];

export const selectMySessions = (state: any) =>
  state.technician?.mySessions || [];

export const selectSessionDetail = (state: any) =>
  state.technician?.selectedSession || null;
