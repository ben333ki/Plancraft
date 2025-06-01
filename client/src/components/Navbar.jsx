import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleLogin = () => {
        navigate('/login');
    }

    const handleProfile = () => {
        navigate('/profile');
    }

    return (
        <div className="navbar-container">
            <div className="navbar-logo">
                <img src="/Image/icon-creeper.png" alt="Creeper" className="navbar-logo-icon" />
                <span className="navbar-brand">Plancraft</span>
            </div>
            <nav className="navbar-menu">
                <div className="navbar-menu-left">
                    <Link to="/home" className="navbar-menu-item">
                        <img src="/Image/icon-home.png" alt="Home" />
                    </Link>
                    <Link to="/craft" className="navbar-menu-item">
                        <img src="/Image/icon-craft.png" alt="Craft" />
                        <span>Craft</span>
                    </Link>
                    <Link to="/farm" className="navbar-menu-item">
                        <img src="/Image/Wheat.webp" alt="Farm" />
                        <span>Farm</span>
                    </Link>
                    <Link to="/todolist" className="navbar-menu-item">
                        <img src="/Image/icon-to do list.png" alt="To do list" />
                        <span>To do list</span>
                    </Link>
                    <Link to="/calculator" className="navbar-menu-item">
                        <img src="/Image/icon-calculator.png" alt="Calculator" />
                        <span>Calculator</span>
                    </Link>
                    <Link to="/createitem" className="navbar-menu-item">
                        <img src="https://res.cloudinary.com/disbsxrab/image/upload/v1748358217/Plancraft/kr6ev5bchympt17abuhm.png" alt="Calculator" />
                        <span>Add Item</span>
                    </Link>
                    <Link to="/createrecipe" className="navbar-menu-item">
                        <img src="/image/Iron_Pickaxe.webp" alt="Calculator" />
                        <span>Add Recipe</span>
                    </Link>
                    <Link to="/deleterecipe" className="navbar-menu-item">
                        <img src="/image/Stick.webp" alt="Calculator" />
                        <span>Delete Recipe</span>
                    </Link>
                    <Link to="/createfarm" className="navbar-menu-item">
                        <img src="/image/Stick.webp" alt="Calculator" />
                        <span>Add Farm</span>
                    </Link>
                    <Link to="/deletefarm" className="navbar-menu-item">
                        <img src="/image/Stick.webp" alt="Calculator" />
                        <span>Delete Farm</span>
                    </Link>
                </div>
                <div className="navbar-menu-right">
                    <div className="nav-profile-container">
                        {user ? (
                            <div className="navbar-profile navbar-profile-logged-in" onClick={handleProfile}>
                                <img 
                                    src={user.profile_picture || "/Image/icon-steve-profile.webp"} 
                                    alt="Profile" 
                                    className="profile-image"
                                />
                                <span className="username">{user.username}</span>
                            </div>
                        ) : (
                            <div className="navbar-profile">
                                <img src="/Image/icon-steve-profile.webp" alt="Profile" />
                                <button className="navbar-login-btn" onClick={handleLogin}>LOGIN</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;