import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice'; // Import your login action

const Login = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const handleLogin = () => {
    dispatch(login({ username: 'testUser', password: 'password123' }));  // Example login action
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Login</button>
      {/* Display login state */}
      <p>{authState.isAuthenticated ? 'Logged in' : 'Not logged in'}</p>
    </div>
  );
};

export default Login;
