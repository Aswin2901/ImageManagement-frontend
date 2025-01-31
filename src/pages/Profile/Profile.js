import React, { useState, useEffect } from 'react';
import api from '../../components/services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './Profile.css';

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`accounts/user_details/`);
      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error.response || error.message);
    }
  };

  // Yup validation schema
  const validationSchema = Yup.object({
    old_password: Yup.string().required('Old Password is required'),
    new_password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*]/, 'Password must contain at least one special character')
      .required('New Password is required'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], 'Passwords do not match')
      .required('Confirm Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const response = await api.post(`accounts/change_password/`, {
          old_password: values.old_password,
          new_password: values.new_password,
        });
        setSuccessMessage("Password updated successfully.");
        setErrorMessage('');
        resetForm();
      } catch (error) {
        setErrorMessage(error.response?.data.error || 'Failed to update password. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login'; // Redirect to login page
    }
  };

  return (
    <div className="profile-container">
      <div className="sidebar">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={activeTab === 'changePassword' ? 'active' : ''}
          onClick={() => setActiveTab('changePassword')}
        >
          Change Password
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>

      <div className="content">
        {loading && <div className="loading-overlay">Loading...</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {activeTab === 'profile' && userDetails && (
          <div className="profile-content">
            <h2>Profile Details</h2>
            <div className="user-info">
              <p><strong>Name:</strong> {userDetails.name}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>
            </div>
          </div>
        )}

        {activeTab === 'changePassword' && (
          <div className="change-password-content">
            <h3>Change Password</h3>
            <form onSubmit={formik.handleSubmit} className="password-form">
              <div>
                <label>Old Password</label>
                <input
                  type="password"
                  name="old_password"
                  value={formik.values.old_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.old_password && formik.errors.old_password && (
                  <div className="error-text">{formik.errors.old_password}</div>
                )}
              </div>
              <div>
                <label>New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={formik.values.new_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.new_password && formik.errors.new_password && (
                  <div className="error-text">{formik.errors.new_password}</div>
                )}
              </div>
              <div>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formik.values.confirm_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.confirm_password && formik.errors.confirm_password && (
                  <div className="error-text">{formik.errors.confirm_password}</div>
                )}
              </div>
              <button type="submit" className="submit-btn">Change Password</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
