import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import '../styles/DeleteRecipe.css';

function DeleteFarm() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/farms");
        if (!response.ok) {
          throw new Error('Failed to fetch farms');
        }
        const data = await response.json();
        setFarms(data.farms);
        setFilteredFarms(data.farms);
      } catch (error) {
        console.error('Error fetching farms:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarms();
  }, []);

  useEffect(() => {
    const filtered = farms.filter(farm => 
      farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farm.farm_category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFarms(filtered);
  }, [searchTerm, farms]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/delete-farm/${farmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete farm');
      }

      // Remove the deleted farm from the state
      setFarms(farms.filter(farm => farm.farm_id !== farmId));
    } catch (error) {
      console.error('Farm deletion error:', error);
      setError(error.message || 'Failed to delete farm. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="delete-recipe-page">
          <div className="delete-recipe-container">
            <div className="delete-recipe-box">
              <div className="delete-recipe-loading">Loading farms...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="delete-recipe-page">
        <div className="delete-recipe-container">
          <div className="delete-recipe-box">
            <h1>Delete Farms</h1>
            
            {error && <div className="delete-recipe-error">{error}</div>}

            <div className="delete-recipe-search">
              <input
                type="text"
                placeholder="Search farms by name or category..."
                value={searchTerm}
                onChange={handleSearch}
                className="delete-recipe-search-input"
              />
            </div>

            <div className="delete-recipe-recipes-list">
              {filteredFarms.length === 0 ? (
                <div className="delete-recipe-no-recipes">
                  {searchTerm ? 'No farms match your search' : 'No farms found'}
                </div>
              ) : (
                filteredFarms.map((farm) => (
                  <div key={farm.farm_id} className="delete-recipe-recipe-item">
                    <div className="delete-recipe-recipe-info">
                      <img 
                        src={`https://i.ytimg.com/vi/${farm.farm_video_url.split('/').pop()}/maxresdefault.jpg`}
                        alt={farm.farm_name} 
                        className="delete-recipe-recipe-item-image"
                      />
                      <div className="delete-recipe-recipe-details">
                        <h3>{farm.farm_name}</h3>
                        <p>Category: {farm.farm_category}</p>
                        <p>Area: {farm.farm_area}</p>
                      </div>
                    </div>
                    <button
                      className="delete-recipe-delete-button"
                      onClick={() => handleDelete(farm.farm_id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="delete-recipe-actions">
              <button 
                className="delete-recipe-cancel-button"
                onClick={() => navigate('/farm')}
              >
                Back to Farms
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteFarm; 