import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if the access token exists in localStorage
  const accessToken = localStorage.getItem('access_token');

  // Redirect to the login page if the token is missing
  return accessToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
