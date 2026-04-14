import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStaffsAPI,
  getStaffByIdAPI,
  createStaffAPI,
  updateStaffAPI,
  deleteStaffAPI,
} from "./staffAPI";

interface Staff {
  id: number;
  name: string;
  phone: string;
  email: string;
  position_id: number;
  employee_type: string;
}

interface StaffState {
  staffs: Staff[];
  selectedStaff: Staff | null;
  loading: boolean;
}

const initialState: StaffState = {
  staffs: [],
  selectedStaff: null,
  loading: false,
};



// =====================================================
// 🔹 GET ALL
// =====================================================
export const fetchStaffs = createAsyncThunk(
  "staff/fetch",
  async () => {
    const res = await getStaffsAPI();
    return res.data;
  }
);

// 🔹 GET BY ID
export const fetchStaffById = createAsyncThunk(
  "staff/fetchById",
  async (id: number) => {
    const res = await getStaffByIdAPI(id);
    return res.data;
  }
);


// =====================================================
// 🔹 CREATE
// =====================================================
export const createStaff = createAsyncThunk(
  "staff/create",
  async (data: any) => {
    const res = await createStaffAPI(data);
    return res.data.result; // 👈 theo controller
  }
);


// =====================================================
// 🔹 UPDATE
// =====================================================
export const updateStaff = createAsyncThunk(
  "staff/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: any;
  }) => {
    updateStaffAPI(id, data);
    const res = await getStaffByIdAPI(id);

    return res.data;
  }
);

// 🔹 DELETE
export const deleteStaff = createAsyncThunk(
  "staff/delete",
  async (id: number) => {
    await deleteStaffAPI(id);
    return id;
  }
);



// =====================================================
// 🔹 SLICE
// =====================================================
const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearSelectedStaff: (state) => {
      state.selectedStaff = null;
    },
  },
  extraReducers: (builder) => {
    // ================= FETCH =================
    builder.addCase(fetchStaffs.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchStaffs.fulfilled, (state, action) => {
      state.loading = false;
      state.staffs = action.payload;
    });

    builder.addCase(fetchStaffs.rejected, (state) => {
      state.loading = false;
    });


    // ================= FETCH BY ID =================
    builder.addCase(fetchStaffById.fulfilled, (state, action) => {
      state.selectedStaff = action.payload;
    });


    // ================= CREATE =================
    builder.addCase(createStaff.fulfilled, (state, action) => {
      state.staffs.push(action.payload);
    });


    // ================= UPDATE =================
    builder.addCase(updateStaff.fulfilled, (state, action) => {
      if(!action.payload) return;
      
      const index = state.staffs.findIndex(
        (s) => Number(s.id) === Number(action.payload.id)
      );

      if (index !== -1) {
        state.staffs[index] = action.payload;
      }
    });


    // ================= DELETE =================
    builder.addCase(deleteStaff.fulfilled, (state, action) => {
      state.staffs = state.staffs.filter(
        (s) => s.id !== action.payload
      );
    });
  },
});

export default staffSlice.reducer;

export const { clearSelectedStaff } = staffSlice.actions;

export const selectStaffs = (state: any) => state.staff.staffs;
export const selectStaffLoading = (state: any) => state.staff.loading;
export const selectSelectedStaff = (state: any) =>
state.staff.selectedStaff;
