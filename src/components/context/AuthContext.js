import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";
import api from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => ({
    accessToken: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    is_authenticated: !!localStorage.getItem("access_token"),
  }));

  // 🔹 Login Function
  const login = async (email, password) => {
    console.log('email' , email , password )
    try {
      const response = await api.post("accounts/login/", {
        email,
        password,
      });
      console.log('response' , response)

      const { access, refresh, user } = response.data;

      setAuth({ accessToken: access, refreshToken: refresh, user, is_authenticated: true });
      console.log(access , refresh, user )

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.response?.data?.detail || "Login failed" };
    }
  };

  // 🔹 Logout Function
  const logout = () => {
    setAuth({ accessToken: null, refreshToken: null, user: null, is_authenticated: false });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  };

  // 🔹 Refresh Token Function
  const refreshAccessToken = async () => {
    try {
      console.log('called')
      const response = await api.post("accounts/token/refresh/", {
        refresh: auth.refreshToken,
      });

      setAuth((prev) => ({ ...prev, accessToken: response.data.access }));
      localStorage.setItem("access_token", response.data.access);
      console.log('success')
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  };

  // 🔹 Auto-refresh token every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.refreshToken) refreshAccessToken();
    }, 1 * 60 * 1000);

    return () => clearInterval(interval);
  }, [auth.refreshToken]);

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
