import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Farm.css';
import { API_URL } from '../config/constants';

const FarmDetail = () => {
  const navigate = useNavigate();
  const { farmId } = useParams();
  const [showVideo, setShowVideo] = useState(false);
  const [items, setItems] = useState({ required: [], produced: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farm, setFarm] = useState(null);

  useEffect(() => {
    const fetchFarmAndItems = async () => {
      try {
        // Fetch all farms
        const response = await fetch(`${API_URL}/farms`);
        if (!response.ok) throw new Error('Failed to fetch farms');
        const data = await response.json();
        
        // Find the specific farm
        const selectedFarm = data.farms.find(f => f.farm_id === farmId);
        if (!selectedFarm) {
          throw new Error('Farm not found');
        }
        setFarm(selectedFarm);

        // Fetch all items
        const itemsResponse = await fetch(`${API_URL}/items`);
        if (!itemsResponse.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsResponse.json();
        
        // Create a map of items by ID for easy lookup
        const itemsMap = new Map();
        itemsData.items.forEach(itemData => {
          itemsMap.set(itemData.item.ItemID, itemData.item);
        });

        // Map required items
        const requiredItems = selectedFarm.items_required.map(item => ({
          ...itemsMap.get(item.item_id),
          amount: item.amount
        })).filter(item => item !== undefined);

        // Map produced items
        const producedItems = selectedFarm.items_produced.map(item => ({
          ...itemsMap.get(item.item_id),
          amount: item.amount
        })).filter(item => item !== undefined);

        setItems({
          required: requiredItems,
          produced: producedItems
        });
      } catch (err) {
        console.error('Error fetching farm details:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (farmId) {
      fetchFarmAndItems();
    }
  }, [farmId]);

  // Helper function to calculate stacks
  const calculateStacks = (amount) => {
    const fullStacks = Math.floor(amount / 64);
    const remainder = amount % 64;
    const totalStacks = fullStacks + (remainder > 0 ? 1 : 0);
    return {
      fullStacks,
      remainder,
      totalStacks
    };
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="farm-page">
          <div className="farm-page-content">
            <div className="farm-loading">
              <i className="fas fa-spinner fa-spin fa-3x"></i>
              <p>Loading farm details...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !farm) {
    return (
      <>
        <Navbar />
        <div className="farm-page">
          <div className="farm-page-content">
            <div className="farm-error">
              <i className="fas fa-exclamation-circle fa-3x"></i>
              <p>Error: {error || 'Farm not found'}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="farm-page">
        <div className="farm-page-content">
          <div className="farm-page-header">
            <h1 className="farm-page-title">Minecraft Farms</h1>
          </div>
          <div className="farm-detail">
            <div className="farm-detail-header">
              <div className="farm-detail-title-box">
                <h2>{farm.farm_name}</h2>
                <div className="farm-type-badge">{farm.farm_category}</div>
              </div>
              <button 
                className="farm-detail-back-button"
                onClick={() => navigate('/farm')}
              >
                <i className="fas fa-arrow-left"></i> Back to Farms
              </button>
            </div>
            
            <div className="farm-detail-content">
              {/* Media Section */}
              <div className="farm-detail-media">
                <div className="farm-detail-image">
                  <div className="farm-media-toggle">
                    <button
                      className={`farm-media-button ${!showVideo ? 'active' : ''}`}
                      onClick={() => setShowVideo(false)}
                    >
                      Image
                    </button>
                    <button
                      className={`farm-media-button ${showVideo ? 'active' : ''}`}
                      onClick={() => setShowVideo(true)}
                    >
                      Video
                    </button>
                  </div>

                  {!showVideo ? (
                    <img 
                      src={`https://i.ytimg.com/vi/${farm.farm_video_url.split('/').pop()}/maxresdefault.jpg`} 
                      alt={farm.farm_name} 
                      className="farm-detail-image"
                    />
                  ) : (
                    <iframe
                      src={`https://www.youtube.com/embed/${farm.farm_video_url.split('/').pop()}`}
                      title={`${farm.farm_name} Tutorial Video`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="farm-tutorial-video"
                    ></iframe>
                  )}
                </div>
                <div className="farm-detail-description">
                  <div className="farm-info-section">
                    <h3><i className="fas fa-info-circle"></i> Description</h3>
                    <p>{farm.farm_description}</p>
                  </div>
                  <div className="farm-info-section">
                    <h3><i className="fas fa-ruler-combined"></i> Farm Area</h3>
                    <div className="farm-tutorial-box">
                      <p>{farm.farm_area}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Resources Section */}
              <div className="farm-detail-resources">
                <div className="farm-info-section">
                  <h3><i className="fas fa-tools"></i> Items Required</h3>
                  <ul className="farm-resource-list">
                    {items.required.map((item, index) => {
                      const stacks = calculateStacks(item.amount);
                      return (
                        <li key={index} className="farm-resource-item">
                          <div className="farm-resource-info">
                            <img src={item.ItemImage} alt={item.ItemName} className="farm-resource-image" />
                            <span className="farm-resource-name">{item.ItemName}</span>
                          </div>
                          <div className="farm-resource-quantity">
                            {stacks.fullStacks > 0 && <span>{stacks.fullStacks} Stack</span>}
                            {stacks.remainder > 0 && (
                              <span className="farm-remainder">
                                {stacks.fullStacks > 0 ? ' + ' : ''}x{stacks.remainder}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                <div className="farm-info-section">
                  <h3><i className="fas fa-gem"></i> Items Produced</h3>
                  <ul className="farm-resource-list">
                    {items.produced.map((item, index) => {
                      const stacks = calculateStacks(item.amount);
                      return (
                        <li key={index} className="farm-resource-item">
                          <div className="farm-resource-info">
                            <img src={item.ItemImage} alt={item.ItemName} className="farm-resource-image" />
                            <span className="farm-resource-name">{item.ItemName}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmDetail;