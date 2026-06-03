import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginAPI,
  registerAPI,
  meAPI,
  logoutAPI,
  getPendingRatingsAPI,
  getCustomerRatingsAPI,
  rateSessionAPI,
} from "./authAPI";

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
  loyalty_points: number;
}

interface AuthState {
  user: CustomerUser | null;

  loading: boolean;

  error: string | null;

  isAuthenticated: boolean;

  pendingRatings: PendingRating[];

  ratings: PendingRating[];
}

interface PendingRating {
  id: number;
  session_no: number;

  service_date: string;

  rating: number | null;

  customer_feedback: string | null;

  service_name: string;

  package_name?: string;
}

interface SubmitRatingResponse {
  sessionId: number;
  success: boolean;
  rewardPoints: number;
  message: string;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  pendingRatings: [],
  ratings: [],
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
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Đăng ký thất bại");
    }
  },
);

export const fetchUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await meAPI();
      return res.data;
    } catch (err: any) {
      if (err.response?.status === 401) {
        return rejectWithValue(null);
      }
      return rejectWithValue(err.response?.data);
    }
  },
);

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  await logoutAPI();
});

export const fetchPendingRatings = createAsyncThunk(
  "auth/fetchPendingRatings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getPendingRatingsAPI();

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const fetchRatings = createAsyncThunk(
  "auth/fetchRatings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCustomerRatingsAPI();

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

export const submitRating = createAsyncThunk<
  SubmitRatingResponse,
  {
    sessionId: number;
    rating: number;
    feedback?: string;
  }
>(
  "auth/submitRating",
  async (
    data: {
      sessionId: number;
      rating: number;
      feedback?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await rateSessionAPI(data);

      return {
        sessionId: data.sessionId,
        ...res.data,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data);
    }
  },
);

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

      state.pendingRatings = [];
      state.ratings = [];
    });

    builder.addCase(fetchPendingRatings.fulfilled, (state, action) => {
      state.pendingRatings = action.payload;
    });

    builder.addCase(fetchRatings.fulfilled, (state, action) => {
      state.ratings = action.payload;
    });

    builder.addCase(submitRating.fulfilled, (state, action) => {
      state.pendingRatings = state.pendingRatings.filter(
        (item) => item.id !== action.payload.sessionId,
      );

      if (state.user) {
        state.user.loyalty_points =
          (state.user.loyalty_points || 0) + action.payload.rewardPoints;
      }
    });
  },
});

export default authSlice.reducer;
export const selectUser = (state: any) => state.auth.user;
export const selectAuth = (state: any) => state.auth.isAuthenticated;
export const selectLoading = (state: any) => state.auth.loading;
export const selectPendingRatings = (state: any) => state.auth.pendingRatings;
export const selectRatings = (state: any) => state.auth.ratings;
