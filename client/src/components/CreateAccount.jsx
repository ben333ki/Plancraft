import React, { useState, useContext } from 'react';
import Leaves from './Leaves';
import '../styles/createAccount.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // --- Create State for input fields ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- Handle Form Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login the user with the received token and user data
        login(data.user, data.token);
        navigate('/profile');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('Error creating account: ' + error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Leaves />

      <div className="create-account-page">
        <img src="Image/minecraft-pet-bg2.webp" alt="Background" />

        <div className="create-account-container">
          <div className="create-account-box">
            <div className="box-top-right"></div>
            <div className="smallbox-top-right"></div>
            <div className="smallbox-bottom-right"></div>
            <div className="box-bottom-right"></div>
            <div className="create-account-logo">
              <img src="Image/icon-creeper.png" alt="Creeper Icon" />
            </div>
            <h1>CREATE ACCOUNT</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="form-group">
                <label htmlFor="username">User-name</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group create-account-password-group">
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="create-account-password-toggle" onClick={togglePasswordVisibility}>
                  <img 
                      src={showPassword ? 'Image/icon-open eye.png' : 'Image/icon-close eye.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'}
                  />
                </button>
              </div>
              <div className="form-group create-account-password-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm-password"
                  name="confirm-password"
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" className="create-account-password-toggle" onClick={togglePasswordVisibility}>
                  <img 
                      src={showPassword ? 'Image/icon-open eye.png' : 'Image/icon-close eye.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'}
                  />
                </button>
              </div>
              <button type="submit" className="create-account-btn">
                Create Account
              </button>
            </form>

            <a href="/login" className="login-link">
              Already have an account?
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAccount;