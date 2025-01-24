import React, { useState } from 'react';
import api from '../../components/services/api';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ email: '', full_name: '', phone_number: '', password: '', confirm_password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setError({ non_field_errors: 'Passwords do not match' });
            return;
        }
        try {
            const response = await api.post('accounts/register/', formData);
            alert(`Registration successful. Your token is: ${response.data.token}`);
            navigate('/login')

        } catch (error) {
            setError(error.response?.data || 'An error occurred during registration.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <body className='page-styling'>

        
            <div className="container">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    />
                    <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    />
                    <input
                    type="text"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    />
                    <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    />
                    <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    />
                    <button type="submit">Register</button>

                </form>
                {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
                    <p>
                    Already have an account? <Link to="/login">Login Here</Link>
                    </p>
                </div>
            </body>
    );
};

export default Register;
