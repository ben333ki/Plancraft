import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Edit-profile.css';
import Navbar from './Navbar';

const EditProfile = () => {
    const [profileImage, setProfileImage] = useState('Image/icon-steve-profile.webp');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const imageInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Prevent body scroll when popup is open
        if (showSuccessPopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showSuccessPopup]);
  
    const handleImageUpload = (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImage(e.target.result);
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };
  
    const togglePasswordFields = () => {
      setShowPasswordFields(prev => !prev);
    };
  
    const handleSavePassword = () => {
      setShowSuccessPopup(true);
    };
  
    const closePopup = () => {
      setShowSuccessPopup(false);
    };

    const handleCancel = () => {
      navigate('/profile');
    };
  
    return (
        <>
            <Navbar />

            <div className="profile-page">
        <div className="profile-container">
          <div className="profile-box">
            <div className="profile-header">
              <h1>EDIT PROFILE</h1>
            </div>
  
            <div className="profile-picture-section">
              <div className="profile-picture">
                <img src={profileImage} alt="Profile" />
                <div className="edit-overlay">
                  <label className="edit-icon" onClick={() => imageInputRef.current.click()}>
                    <img src="Image/icon-edit-profile.png" alt="Edit" />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
  
            <form action="#" method="POST" className="profile-form">
              <div className="form-group">
                <label htmlFor="username">User-name</label>
                <input type="text" id="username" name="username" defaultValue="Steve" required />
              </div>
  
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" defaultValue="steve@minecraft.com" readOnly className="readonly-input" required />
              </div>
  
              <div className="change-password-section">
                <button type="button" className={`change-password-btn ${showPasswordFields ? 'active' : ''}`} onClick={togglePasswordFields}>
                  Change Password
                </button>
  
                {showPasswordFields && (
                  <div className="password-fields">
                    <div className="form-group">
                      <label htmlFor="current-password">Current Password</label>
                      <div className="password-container">
                        <input type="password" id="current-password" name="current-password" placeholder="Enter current password" />
                      </div>
                    </div>
  
                    <div className="form-group">
                      <label htmlFor="new-password">New Password</label>
                      <div className="password-container">
                        <input type="password" id="new-password" name="new-password" placeholder="Enter new password" />
                      </div>
                    </div>
  
                    <div className="form-group">
                      <label htmlFor="confirm-password">Confirm New Password</label>
                      <div className="password-container">
                        <input type="password" id="confirm-password" name="confirm-password" placeholder="Confirm new password" />
                      </div>
                    </div>
  
                    <div className="password-buttons">
                      <button type="button" className="save-password-btn" onClick={handleSavePassword}>
                        Save Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
  
              <div className="profile-buttons">
                <button type="submit" className="save-btn">Save Profile</button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          </div>
  
          {/* Success Popup */}
          {showSuccessPopup && (
            <div className="popup-overlay" onClick={closePopup}>
              <div className="popup-content" onClick={e => e.stopPropagation()}>
                <img src="Image/icon-check.png" alt="Success" />
                <h2>บันทึกรหัสผ่านสำเร็จ</h2>
                <button className="popup-close-btn" onClick={closePopup}>ปิด</button>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
  );
};

export default EditProfile;