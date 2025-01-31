import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../components/services/api';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const schema = yup.object().shape({
    full_name: yup.string().required('Full Name is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    phone_number: yup.string()
        .matches(/^\d{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
    password: yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirm_password: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required')
});

const Register = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        try {
            const response = await api.post('accounts/register/', data);
            setSuccessMessage('Registration successful. You can now log in.');
            setServerError(null);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setServerError(error.response?.data || 'An error occurred during registration.');
            setSuccessMessage(null);
        }
    };

    return (
        <div className='page-styling'>
            <div className="container">
                <h1>Register</h1>
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                {serverError && <p style={{ color: 'red' }}>{JSON.stringify(serverError)}</p>}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" placeholder="Full Name" {...register('full_name')} />
                    <p className="error-text">{errors.full_name?.message}</p>
                    
                    <input type="email" placeholder="Email" {...register('email')} />
                    <p className="error-text">{errors.email?.message}</p>
                    
                    <input type="text" placeholder="Phone Number" {...register('phone_number')} />
                    <p className="error-text">{errors.phone_number?.message}</p>
                    
                    <input type="password" placeholder="Password" {...register('password')} />
                    <p className="error-text">{errors.password?.message}</p>
                    
                    <input type="password" placeholder="Confirm Password" {...register('confirm_password')} />
                    <p className="error-text">{errors.confirm_password?.message}</p>
                    
                    <button type="submit">Register</button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login Here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
