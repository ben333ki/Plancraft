import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openPopup = () => {
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const goToEditProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-box">
            <div className="profile-header">
              <h1>PROFILE</h1>
            </div>

            <div className="profile-picture-section">
              <div className="profile-picture">
                <img src={user?.profile_picture || '/Image/icon-steve-profile.webp'} id="profileImage" alt="Profile" />
              </div>
            </div>

            <form className="profile-form">
              <div className="profile-form-group">
                <label htmlFor="username">User-name</label>
                <input type="text" id="username" name="username" value={user?.username || ''} readOnly />
              </div>

              <div className="profile-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user?.email || ''}
                  readOnly
                  className="profile-readonly-input"
                  required
                />
              </div>

              <div className="profile-buttons">
                <button type="button" className="profile-edit-btn" onClick={goToEditProfile}>
                  Edit Profile
                </button>
                <button type="button" className="profile-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Success Popup */}
        {isPopupVisible && (
          <div className="profile-popup-overlay" id="successPopup">
            <div className="profile-popup-content">
              <img src="/Image/icon-check.png" alt="Success" />
              <h2>บันทึกรหัสผ่านสำเร็จ</h2>
              <button className="profile-popup-close-btn" onClick={closePopup}>
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;