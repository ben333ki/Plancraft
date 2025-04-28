import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🆕 Import useNavigate
import '../styles/Profile.css';
import Navbar from './Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState('/Image/icon-steve-profile.webp');
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
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
          <img src={profileImage} id="profileImage" alt="Profile" />
        </div>
      </div>

      <form className="profile-form">
        <div className="form-group">
          <label htmlFor="username">User-name</label>
          <input type="text" id="username" name="username" value="Steve" readOnly />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value="steve@minecraft.com"
            readOnly
            className="readonly-input"
            required
          />
        </div>

        <div className="profile-buttons">
          <button type="button" className="save-btn" onClick={goToEditProfile}>
            Edit Profile
          </button>
        </div>
      </form>
    </div>
  </div>

  {/* Success Popup */}
  {isPopupVisible && (
    <div className="popup-overlay" id="successPopup">
      <div className="popup-content">
        <img src="/Image/icon-check.png" alt="Success" />
        <h2>บันทึกรหัสผ่านสำเร็จ</h2>
        <button className="popup-close-btn" onClick={closePopup}>
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