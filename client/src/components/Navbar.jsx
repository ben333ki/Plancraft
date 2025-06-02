import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_TODO_TASKS_URL = 'http://localhost:3000/api/todolist/tasks';

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [pendingTaskCount, setPendingTaskCount] = useState(0);

    const handleLogin = () => {
        navigate('/login');
    }

    const handleProfile = () => {
        navigate('/profile');
    }

    useEffect(() => {
        const fetchPendingTasksCount = async () => {
            if (!user) {
                setPendingTaskCount(0);
                return;
            }
            try {
                const response = await axios.get(`${API_TODO_TASKS_URL}?status=pending`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPendingTaskCount(response.data.tasks.length);
            } catch (error) {
                console.error('Error fetching pending tasks count:', error);
                setPendingTaskCount(0);
            }
        };

        fetchPendingTasksCount();
        // Fetch again if user changes
    }, [user]);

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
                        {pendingTaskCount > 0 && (
                            <span className="pending-task-dot"></span>
                        )}
                    </Link>
                    <Link to="/calculator" className="navbar-menu-item">
                        <img src="/Image/icon-calculator.png" alt="Calculator" />
                        <span>Calculator</span>
                    </Link>
                    
                    {user && user.role === 'admin' && (
                        <div className="navbar-admin-dropdown">
                            <div className="navbar-menu-item admin-dropdown-button">
                                <img src="/Image/setting.png" alt="Admin" />
                                <span>Admin</span>
                            </div>
                            
                            <div className="admin-dropdown-content">
                                <Link to="/createitem" className="admin-dropdown-item">
                                    <img src="/image/Iron_Pickaxe.webp" alt="Add Item" />
                                    <span>Add Item</span>
                                </Link>
                                <Link to="/createrecipe" className="admin-dropdown-item">
                                    <img src="/image/icon-craft.png" alt="Add Recipe" />
                                    <span>Add Recipe</span>
                                </Link>
                                <Link to="/createfarm" className="admin-dropdown-item">
                                    <img src="/image/Wheat.webp" alt="Add Farm" />
                                    <span>Add Farm</span>
                                </Link>
                                <Link to="/deleterecipe" className="admin-dropdown-item">
                                    <img src="/image/Barrier.webp" alt="Delete Recipe" />
                                    <span>Delete Recipe</span>
                                </Link>
                                <Link to="/deletefarm" className="admin-dropdown-item">
                                    <img src="/image/Barrier.webp" alt="Delete Farm" />
                                    <span>Delete Farm</span>
                                </Link>
                            </div>
                        </div>
                    )}
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