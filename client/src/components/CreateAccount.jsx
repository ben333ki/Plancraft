import React, { useState } from 'react';
import Leaves from './Leaves';
import '../styles/createAccount.css';
import { useNavigate } from 'react-router-dom'; // <-- เพิ่มตรงนี้


const CreateAccount = () => {
  const navigate = useNavigate(); // <-- เพิ่มตรงนี้

  // --- Create State for input fields ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Handle Form Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
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
        alert('Account created successfully!');
        navigate('/home'); // 🆕 Redirect to /home page
      } else {
        alert('Failed to create account: ' + data.error);
      }
    } catch (error) {
      alert('Error creating account: ' + error.message);
    }
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
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
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
