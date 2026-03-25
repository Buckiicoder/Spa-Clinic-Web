import { createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import { loginAPI, meAPI, logoutAPI } from './authAPI'

interface StaffUser {
  id: number
  name: string
  email: string
  phone: number
  avatar?: string
  role: 'STAFF' | 'MANAGER'
}

interface AuthState {
  user: StaffUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
}

export const login = createAsyncThunk(
  'auth/login',
  async(data: {email: string, password: string}, {rejectWithValue}) => {
    try {
      await loginAPI(data)

      const res = await meAPI()

      const user = res.data

      if(user.role !== 'STAFF' && user.role !== 'MANAGER') {
        throw new Error ('Unauthorized role')
      }

      return user
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async () => {
    await logoutAPI()
  }
)

export const fetchUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue}) => {
    try {
      const res = await meAPI()
      return res.data
    } catch {
        return rejectWithValue(null);     
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await logoutAPI();
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(login.pending, (state) => {
      state.loading = true
      state.error = null
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload
      state.isAuthenticated = true
    })
    .addCase(login.rejected, (state, action: any) => {
      state.loading = false
      state.error = action.payload
      state.user = null
      state.isAuthenticated = false
    })
    .addCase(fetchUser.fulfilled, (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    })
    .addCase(fetchUser.rejected, (state) => {
      state.user = null
      state.isAuthenticated = false
    })
    .addCase(fetchUser.pending, (state) => {
      state.loading = true
    })

    .addCase(logout.fulfilled, (state) => {
      state.user = null
      state.isAuthenticated = false
    })
  }
})

export default authSlice.reducer

export const selectUser = (state: any) => state.auth.user
export const selectAuth = (state: any) => state.auth.isAuthenticated
export const selectLoading = (state: any) => state.auth.loading