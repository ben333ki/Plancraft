import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🆕 Import useNavigate
import '../styles/login.css';
import Leaves from './Leaves';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate(); // 🆕 Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/login', {
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
        alert('Login successful!');
        navigate('/home'); // 🆕 Redirect to /home page
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      alert('Error logging in: ' + error.message);
    }
  };

  return (
    <>
      <Leaves />
      
      <div className="login-page">
        <img src="Image/minecraft-pet-bg2.webp" alt="Background" className="side-image" />
        <div className="login-container">
          <div className="login-box">
            <div className="box-top-right"></div>
            <div className="smallbox-top-right"></div>
            <div className="logo-plancraft">
              <img src="Image/icon-creeper.png" alt="Logo" />
            </div>
            <h1>LOGIN</h1>
            
            <form onSubmit={handleLogin} autoComplete="off">
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
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="remember-me">
                <label className="switch">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="slider round"></span>
                </label>
                <span
                  className="remember-text"
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{ cursor: 'pointer' }}
                >
                  Remember me
                </span>
              </div>

              <button type="submit" className="login-btn">LOGIN</button>
            </form>

            <a href="/create-account" className="create-account">Create account</a>

            <div className="smallbox-bottom-right"></div>
            <div className="box-bottom-right"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
