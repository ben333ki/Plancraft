import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Edit-profile.css';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(user?.profile_picture || 'Image/icon-steve-profile.webp');
    const [username, setUsername] = useState(user?.username || '');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [error, setError] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const imageInputRef = useRef(null);

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

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setError('');

        // Validate password if changing
        if (showPasswordFields) {
            if (newPassword !== confirmPassword) {
                setError("New passwords do not match");
                return;
            }
            if (!currentPassword) {
                setError("Current password is required");
                return;
            }
        }

        try {
            const response = await fetch('http://localhost:3000/api/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    username: username,
                    profile_picture: profileImage,
                    current_password: showPasswordFields ? currentPassword : '',
                    new_password: showPasswordFields ? newPassword : ''
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update auth context with new user data and token
                login(data.user, data.token);
                setShowSuccessPopup(true);
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            } else {
                setError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            setError('Error updating profile: ' + error.message);
        }
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

                        {error && <div className="error-message">{error}</div>}

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

                        <form onSubmit={handleSaveProfile} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="username">User-name</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className="readonly-input"
                                    required
                                />
                            </div>

                            <div className="change-password-section">
                                <button
                                    type="button"
                                    className={`change-password-btn ${showPasswordFields ? 'active' : ''}`}
                                    onClick={togglePasswordFields}
                                >
                                    Change Password
                                </button>

                                {showPasswordFields && (
                                    <div className="password-fields">
                                        <div className="form-group">
                                            <label htmlFor="current-password">Current Password</label>
                                            <div className="password-container">
                                                <input
                                                    type="password"
                                                    id="current-password"
                                                    name="current-password"
                                                    placeholder="Enter current password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="new-password">New Password</label>
                                            <div className="password-container">
                                                <input
                                                    type="password"
                                                    id="new-password"
                                                    name="new-password"
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="confirm-password">Confirm New Password</label>
                                            <div className="password-container">
                                                <input
                                                    type="password"
                                                    id="confirm-password"
                                                    name="confirm-password"
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </div>
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
                        <div className="popup-overlay" onClick={() => setShowSuccessPopup(false)}>
                            <div className="popup-content" onClick={e => e.stopPropagation()}>
                                <img src="Image/icon-check.png" alt="Success" />
                                <h2>Profile updated successfully</h2>
                                <button className="popup-close-btn" onClick={() => setShowSuccessPopup(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditProfile;