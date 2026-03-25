import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI, meAPI, logoutAPI } from "./authAPI";

interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone: number;
  avatar: string | null;
  role: "CUSTOMER";
  sex: string;
  total_spending: number;
  rank: string;
}

interface AuthState {
  user: CustomerUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const login = createAsyncThunk("auth/login", async (data: any) => {
  await loginAPI(data);
  const res = await meAPI();
  const user = res.data;
  if (user.role !== "CUSTOMER") {
    throw new Error("Unauthorized role");
  }
  return res.data;
  //server set httponlycookie
});

export const register = createAsyncThunk(
  "auth/register",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await registerAPI(data);
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Đăng ký thất bại");
    }
  },
);

export const fetchUser = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const res = await meAPI();
    return res.data;
  } catch (err: any) {
    if(err.response?.status === 401) {
      return rejectWithValue(null);
    }
    return rejectWithValue(err.response?.data);
  }
});

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  await logoutAPI();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /*Login*/
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Login failed";
      state.user = null;
      state.isAuthenticated = false;
    });

    /*Fetch user*/
    builder.addCase(fetchUser.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    builder.addCase(fetchUser.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
    });

    /*Logout*/
    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export default authSlice.reducer;
export const selectUser = (state: any) => state.auth.user;
export const selectAuth = (state: any) => state.auth.isAuthenticated;
export const selectLoading = (state: any) => state.auth.loading;
