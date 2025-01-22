import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';  // Your auth slice

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
