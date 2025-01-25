import React, { useState, useEffect } from 'react';
import api from '../../components/services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Profile.css';

const Profile = () => {
  const user_id = JSON.parse(localStorage.getItem('user_id'));
  const [userDetails, setUserDetails] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`accounts/user_details/${user_id}/`);
      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error.response || error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(`accounts/change_password/${user_id}/`, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccessMessage("Password updated successfully.");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage(error.response?.data || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login'; // Redirect to login page
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
        <button
          className={activeTab === 'logout' ? 'active' : ''}
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>

      <div className="content">
        {loading && <div className="loading-overlay">Loading...</div>}

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
            <form onSubmit={handlePasswordChange} className="password-form">
              <div>
                <label>Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Change Password</button>
            </form>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
