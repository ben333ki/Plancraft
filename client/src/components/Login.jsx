import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import Leaves from './Leaves';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/constants';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Error logging in: ' + error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Leaves />
      
      <div className='login-page'>
      <div className="login-content">
        <img src="Image/minecraft-pet-bg2.webp" alt="Background" className="login-side-image" />
        <div className="login-form-container">
          <div className="login-form-box">
            <div className="login-decor-box-top"></div>
            <div className="login-decor-small-top"></div>
            <div className="login-logo">
              <img src="Image/icon-creeper.png" alt="Logo" />
            </div>
            <h1>LOGIN</h1>
            
            {error && <div className="login-error">{error}</div>}
            
            <form onSubmit={handleLogin} autoComplete="off">
              <div className="login-input-group">
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
              <div className="login-input-group login-password-input-group">
                <label htmlFor="password">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="login-password-toggle" onClick={togglePasswordVisibility}>
                  <img 
                      src={showPassword ? 'Image/icon-open eye.png' : 'Image/icon-close eye.png'}
                      alt={showPassword ? 'Hide password' : 'Show password'}
                  />
                </button>
              </div>

              <div className="login-remember">
                <label className="login-switch">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="login-slider round"></span>
                </label>
                <span
                  className="login-remember-text"
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{ cursor: 'pointer' }}
                >
                  Remember me
                </span>
              </div>

              <button type="submit" className="login-submit-btn">LOGIN</button>
            </form>

            <Link to="/create-account" className="login-create-account">Create account</Link>
            <Link to="/home" className="login-guest-link">Go to Home</Link>

            <div className="login-decor-small-bottom"></div>
            <div className="login-decor-box-bottom"></div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;