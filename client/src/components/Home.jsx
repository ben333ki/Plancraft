import React, { useEffect, useState } from 'react';
import Leaves from './Leaves';
import '../styles/createAccount.css';

const Home = () => {
  // State to store the logged-in username
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Check if the token exists in cookies
    const token = document.cookie.split("; ").find(row => row.startsWith("token="));

    if (token) {
      // Fetch user profile from the backend to get the username
      fetch("http://localhost:3000/profile", {
        method: "GET",
        // No need for Authorization header if the token is in the cookie
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.username) {
            setUsername(data.username); // Update the username state
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, []); // This runs once when the component mounts

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

            {/* Display username if available */}
            {username ? (
              <h2>Welcome, {username}!</h2>
            ) : (
              <h2>Please log in</h2>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
