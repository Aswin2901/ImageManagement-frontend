import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../components/services/api';
import { useAuth } from '../../components/context/AuthContext';
import './Login.css';


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('accounts/login/', formData);

      login(response.data)
  
      console.log('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError('Invalid credentials. Please try again.');
    }
  };
  

  return (
 <body className='page-styling'>
       <div className="container">
      <h1>Login Page</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={formData.email}
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
      
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
 </body>
  );
};

export default Login;
