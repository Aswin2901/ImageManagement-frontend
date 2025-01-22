import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../components/services/api'; // Import the api instance

// Thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('accounts/login/', {
        username,
        password,
      });
      return response.data.token; // Return the token from the response
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Something went wrong' });
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
