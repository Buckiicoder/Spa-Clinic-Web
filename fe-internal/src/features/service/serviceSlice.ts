import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getServicesAPI,
  createServiceAPI,
  updateServiceAPI,
  deleteServiceAPI,
  getServiceDetailAPI,
  getMiddleServiceAPI
} from "./serviceAPI";

import { Service } from "../../types/service";

interface ServiceState {
  services: Service[];
  middleServices: Service[];
  loading: boolean;
  selectedService: Service | null;
}

const initialState: ServiceState = {
  services: [],
  middleServices: [],
  loading: false,
  selectedService: null,
};

// ================= FETCH =================
export const fetchServices = createAsyncThunk("service/fetch", async () => {
  const res = await getServicesAPI();
  return res.data;
});

export const fetchMiddleServices = createAsyncThunk("service/middle", async () => {
  const res = await getMiddleServiceAPI();
  return res.data;
});

export const fetchServiceDetail = createAsyncThunk(
  "service/fetchDetail",
  async (id: number) => {
    const res = await getServiceDetailAPI(id);
    return res.data;
  },
);

// ================= CREATE =================
export const createService = createAsyncThunk(
  "service/create",
  async (data: any) => {
    const res = await createServiceAPI(data);
    return res.data;
  },
);

// ================= UPDATE =================
export const updateService = createAsyncThunk(
  "service/update",
  async ({ id, data }: { id: number; data: any }) => {
    const res = await updateServiceAPI(id, data);
    return res.data;
  },
);

// ================= DELETE =================
export const deleteService = createAsyncThunk(
  "service/delete",
  async (id: number) => {
    await deleteServiceAPI(id);
    return id;
  },
);

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchServices.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchServices.fulfilled, (state, action) => {
      state.loading = false;
      state.services = action.payload;
    });

    builder.addCase(fetchServices.rejected, (state) => {
      state.loading = false;
    });

    // FETCH MIDDLE
    builder.addCase(fetchMiddleServices.pending, (state) => {
  state.loading = true;
});

builder.addCase(fetchMiddleServices.fulfilled, (state, action) => {
  state.loading = false;
  state.middleServices = action.payload; // 🔥 QUAN TRỌNG
});

builder.addCase(fetchMiddleServices.rejected, (state) => {
  state.loading = false;
});

    // CREATE
    builder.addCase(createService.fulfilled, (state, action) => {
      state.services.unshift(action.payload);
    });

    // UPDATE
    builder.addCase(updateService.fulfilled, (state, action) => {
      const index = state.services.findIndex(
        (s) => s.id === action.payload.id,
      );

      if (index !== -1) {
        state.services[index] = action.payload;
      } else {
        state.services.unshift(action.payload);
      }
    });

    // DELETE
    builder.addCase(deleteService.fulfilled, (state, action) => {
      state.services = state.services.filter(
        (s) => s.id !== action.payload,
      );
    });

    // DETAIL
    builder.addCase(fetchServiceDetail.fulfilled, (state, action) => {
      state.selectedService = action.payload;
    });
  },
});

export const { setSelectedService, clearSelectedService } =
  serviceSlice.actions;

export default serviceSlice.reducer;

// SELECTORS
export const selectServices = (state: any) => state.service.services;
export const selectMiddleServices = (state: any) => state.service.middleServices;
export const selectLoading = (state: any) => state.service.loading;
export const selectSelectedService = (state: any) =>
  state.service.selectedService;
