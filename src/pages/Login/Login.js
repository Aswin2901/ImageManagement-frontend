import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Login</button>
      </form>
      {isAuthenticated && <p>Logged in successfully!</p>}
      {error && <p style={{ color: 'red' }}>{error.error}</p>}
    </div>
  );
};

export default Login;
