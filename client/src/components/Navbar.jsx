import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    }


    return (
        <div className="header-container">
            <div className="logo-container">
                <img src="Image/icon-creeper.png" alt="Creeper" className="creeper-icon" />
                <span className="brand">Plancraft</span>
            </div>
            <nav className="navbar">
                <div className="nav-left">
                    <Link to="/home" className="nav-item">
                        <img src="Image/icon-home.png" alt="Home" />
                    </Link>
                    <Link to="/craft" className="nav-item">
                        <img src="Image/icon-craft.png" alt="Craft" />
                        <span>Craft</span>
                    </Link>
                    <Link to="/" className="nav-item">
                        <img src="Image/Wheat.webp" alt="Farm" />
                        <span>Farm</span>
                    </Link>
                    <Link to="/" className="nav-item">
                        <img src="Image/icon-to do list.png" alt="To do list" />
                        <span>To do list</span>
                    </Link>
                    <Link to="/" className="nav-item">
                        <img src="Image/icon-calculator.png" alt="Calculator" />
                        <span>Calculator</span>
                    </Link>
                </div>
                <div className="nav-right">
                    <div className="profile-container">
                        <img src="Image/icon-steve-profile.webp" alt="Profile" />
                        <button className="navbar-login-btn" onClick={handleLogin}>LOGIN</button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;