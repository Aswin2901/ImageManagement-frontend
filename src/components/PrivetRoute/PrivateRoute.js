import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Correct the import path if necessary

const PrivateRoute = ({ children }) => {
  const { auth } = useAuth(); // Use the auth object from AuthContext

  // Check if the user is authenticated
  const isAuthenticated = auth.is_authenticated;

  console.log('is authenticated from private route' , isAuthenticated)

  return isAuthenticated ? children : <Navigate to="/login" />; // Redirect to /login if not authenticated
};

export default PrivateRoute;
