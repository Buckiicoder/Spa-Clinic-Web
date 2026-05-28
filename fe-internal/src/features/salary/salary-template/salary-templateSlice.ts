import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getSalaryTemplatesAPI,
  getSalaryTemplateDetailAPI,
  createSalaryTemplateAPI,
  updateSalaryTemplateAPI,
} from "./salary-templateAPI";

interface SalaryTemplateState {
  templates: any[];
  loading: boolean;
  selectedTemplate: any | null;
}

const initialState: SalaryTemplateState = {
  templates: [],
  loading: false,
  selectedTemplate: null,
};

// ================= FETCH ALL =================

export const fetchSalaryTemplates = createAsyncThunk(
  "salaryTemplate/fetchAll",
  async () => {
    const res = await getSalaryTemplatesAPI();
    return res.data;
  },
);

// ================= FETCH DETAIL =================

export const fetchSalaryTemplateDetail = createAsyncThunk(
  "salaryTemplate/fetchDetail",
  async (id: number) => {
    const res = await getSalaryTemplateDetailAPI(id);
    return res.data;
  },
);

// ================= CREATE =================

export const createSalaryTemplate = createAsyncThunk(
  "salaryTemplate/create",
  async (data: any) => {
    const res = await createSalaryTemplateAPI(data);
    return res.data;
  },
);

// ================= UPDATE =================

export const updateSalaryTemplate = createAsyncThunk(
  "salaryTemplate/update",
  async ({
    id,
    data,
  }: {
    id: number;
    data: any;
  }) => {
    const res = await updateSalaryTemplateAPI(id, data);
    return res.data;
  },
);

const salaryTemplateSlice = createSlice({
  name: "salaryTemplate",
  initialState,
  reducers: {
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
  },

  extraReducers: (builder) => {
    // FETCH
    builder.addCase(fetchSalaryTemplates.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(
      fetchSalaryTemplates.fulfilled,
      (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      },
    );

    builder.addCase(fetchSalaryTemplates.rejected, (state) => {
      state.loading = false;
    });

    // DETAIL
    builder.addCase(
      fetchSalaryTemplateDetail.fulfilled,
      (state, action) => {
        state.selectedTemplate = action.payload;
      },
    );

    // CREATE
    builder.addCase(
      createSalaryTemplate.fulfilled,
      (state, action) => {
        state.templates.unshift(action.payload);
      },
    );

    // UPDATE
    builder.addCase(
      updateSalaryTemplate.fulfilled,
      (state, action) => {
        const index = state.templates.findIndex(
          (t) => t.id === action.payload.id,
        );

        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      },
    );
  },
});

export const { clearSelectedTemplate } =
  salaryTemplateSlice.actions;

export default salaryTemplateSlice.reducer;

// ================= SELECTORS =================

export const selectSalaryTemplates = (state: any) =>
  state.salaryTemplates.templates;

export const selectSalaryTemplateLoading = (state: any) =>
  state.salaryTemplate.loading;

export const selectSelectedSalaryTemplate = (state: any) =>
  state.salaryTemplate.selectedTemplate;