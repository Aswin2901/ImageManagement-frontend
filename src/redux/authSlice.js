import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../components/services/api'; // Import the API instance

// Thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('accounts/login/', { email, password });
      return response.data; // Return the response data containing tokens
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Something went wrong' });
    }
  }
);

// Thunk for refreshing the access token
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('Refresh token not found');
      const response = await api.post('accounts/token/refresh/', { refresh: refreshToken });
      return response.data; // Return the new access token
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to refresh token' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    token: null,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { access, refresh } = action.payload;
        state.isAuthenticated = true;
        state.token = access;
        state.error = null;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const { access } = action.payload;
        state.token = access;
        localStorage.setItem('access_token', access);
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;