import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getServicesAPI } from "./serviceAPI";

interface Service {
  id: number;
  name: string;
}

interface ServiceState {
  services: Service[];
  loading: boolean;
}

const initialState: ServiceState = {
  services: [],
  loading: false,
};

export const fetchServices = createAsyncThunk(
  "service/fetch",
  async () => {
    const res = await getServicesAPI();
    return res.data;
  }
);

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
  },
});

export default serviceSlice.reducer;

export const selectServices = (state: any) => state.service.services;
