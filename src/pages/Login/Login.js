import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../components/services/api';
import { useAuth } from '../../components/context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { login } = useAuth(); // Using AuthContext login function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {

      // Save tokens and user details
      const result = await login(formData.email, formData.password); // ✅ Wait for login response

      if (result.success) {
        console.log("Login successful! Redirecting... from home");
        navigate("/"); // ✅ Redirect only after successful login
      } else {
        setError(result.message); // ✅ Show error message if login fails
      }

    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="page-styling">
      <div className="container">
        <h1>Login Page</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
