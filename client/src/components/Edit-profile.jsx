import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Edit-profile.css';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/constants';

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
    const [showAllPasswords, setShowAllPasswords] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setIsUploading(true);
                setError('');

                const formData = new FormData();
                formData.append('image', e.target.files[0]);

                const response = await fetch(`${API_URL}/api/upload-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                setProfileImage(data.imageUrl);
            } catch (error) {
                setError('Error uploading image: ' + error.message);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const togglePasswordFields = () => {
        setShowPasswordFields(prev => !prev);
    };

    const toggleAllPasswordsVisibility = () => {
        setShowAllPasswords(!showAllPasswords);
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
            const response = await fetch(`${API_URL}/api/update-profile`, {
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

            <div className="edit-profile-page">
                <div className="edit-profile-container">
                    <div className="edit-profile-box">
                        <div className="edit-profile-header">
                            <h1>EDIT PROFILE</h1>
                        </div>

                        {error && <div className="edit-profile-error-message">{error}</div>}

                        <div className="edit-profile-picture-section">
                            <div className="edit-profile-picture">
                                <img src={profileImage} alt="Profile" />
                                <div className="edit-profile-edit-overlay">
                                    <label className="edit-profile-edit-icon" onClick={() => imageInputRef.current.click()}>
                                        <p>Edit</p>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={imageInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </div>
                                {isUploading && (
                                    <div className="edit-profile-uploading">
                                        Uploading...
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="edit-profile-form">
                            <div className="edit-profile-form-group">
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

                            <div className="edit-profile-form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className="edit-profile-readonly-input"
                                    required
                                />
                            </div>

                            <div className="edit-profile-change-password-section">
                                <button
                                    type="button"
                                    className={`edit-profile-change-password-btn ${showPasswordFields ? 'active' : ''}`}
                                    onClick={togglePasswordFields}
                                >
                                    Change Password
                                </button>

                                {showPasswordFields && (
                                    <div className="edit-profile-password-fields">
                                        <div className="edit-profile-form-group">
                                            <label htmlFor="current-password">Current Password</label>
                                            <div className="edit-profile-password-input-wrapper">
                                                <input
                                                    type={showAllPasswords ? 'text' : 'password'}
                                                    id="current-password"
                                                    name="current-password"
                                                    placeholder="Enter current password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                />
                                                <button type="button" className="edit-profile-password-toggle" onClick={toggleAllPasswordsVisibility}>
                                                    <img
                                                        src={showAllPasswords ? 'Image/icon-open eye.png' : 'Image/icon-close eye.png'}
                                                        alt={showAllPasswords ? 'Hide password' : 'Show password'}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="edit-profile-form-group">
                                            <label htmlFor="new-password">New Password</label>
                                            <div className="edit-profile-password-input-wrapper">
                                                <input
                                                    type={showAllPasswords ? 'text' : 'password'}
                                                    id="new-password"
                                                    name="new-password"
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                                <button type="button" className="edit-profile-password-toggle" onClick={toggleAllPasswordsVisibility}>
                                                    <img
                                                        src={showAllPasswords ? 'Image/icon-open eye.png' : 'Image/icon-close eye.png'}
                                                        alt={showAllPasswords ? 'Hide password' : 'Show password'}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="edit-profile-form-group">
                                            <label htmlFor="confirm-password">Confirm New Password</label>
                                            <div className="edit-profile-password-input-wrapper">
                                                <input
                                                    type={showAllPasswords ? 'text' : 'password'}
                                                    id="confirm-password"
                                                    name="confirm-password"
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                                <button type="button" className="edit-profile-password-toggle" onClick={toggleAllPasswordsVisibility}>
                                                    <img
                                                        src={showAllPasswords ? 'Image/icon-open eye.png' : 'Image/icon-close eye.png'}
                                                        alt={showAllPasswords ? 'Hide password' : 'Show password'}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="edit-profile-buttons">
                                <button type="submit" className="edit-profile-save-btn">Save</button>
                                <button type="button" className="edit-profile-cancel-btn" onClick={handleCancel}>Cancel</button>
                            </div>
                        </form>
                    </div>

                    {showSuccessPopup && (
                        <div className="edit-profile-popup-overlay" onClick={() => setShowSuccessPopup(false)}>
                            <div className="edit-profile-popup-content" onClick={e => e.stopPropagation()}>
                                <img src="Image/icon-check.png" alt="Success" />
                                <h2>Profile updated successfully</h2>
                                <button className="edit-profile-popup-close-btn" onClick={() => setShowSuccessPopup(false)}>
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