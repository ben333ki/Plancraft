import React, { useEffect, useState } from 'react';
import '../styles/Farm.css';
import Navbar from './Navbar';

/* ================== ข้อมูล Farm ================== */
const farmData = [
    {
      id: 1,
      name: "Wheat Auto-Farm",
      type: "Crop",
      image: "https://i.ytimg.com/vi/iM1GRMtxit8/maxresdefault.jpg",
      description: "A basic farm for growing wheat. Efficient for bread and animal breeding.",
      tutorial: "1. Place water in the center of a 9x9 grid, till soil around it, and plant seeds.\n2. gggdgdgdgdgdgdgdgd \n3. นกหอ่อหสอหอ",
      product: [{name: "Wheat", image: "../Image/Oak.webp"}, {name: "Seeds", image: "/path/to/iron_ingot.png"}],
      buildingItems: [{name: "Bonemeal", image: "../Image/Oak.webp", quantity: "x64 / 2 set"}, {name: "Water", image: "/path/to/iron_ingot.png", quantity: "x2"}, {name: "Hoe", image: "/path/to/iron_ingot.png", quantity: "x2"}],
      video: "https://www.youtube.com/embed/iM1GRMtxit8"
    },
    {
      id: 2,
      name: "Iron Golem Farm",
      type: "Mineral",
      image: "https://i.ytimg.com/vi/jZgoD93YnCw/maxresdefault.jpg",
      description: "Generates iron through spawning and killing iron golems.",
      tutorial: "Create a villager breeding system with zombie scaring mechanism.",
      product: [{name: "Iron Ingots", image: "/path/to/iron_ingot.png"}, {name: "Poppies", image: "/path/to/poppy.png"}],
      buildingItems: [{name: "Villagers", image: "/path/to/villager.png", quantity: "x2"}, {name: "Oak", image: "../Image/Oak.webp", quantity: "x64 / 3set"}],
      video: "https://www.youtube.com/embed/jZgoD93YnCw"
    },
    {
      id: 3,
      name: "Chicken Farm",
      type: "Animal",
      image: "https://i.ytimg.com/vi/hMAlGOz_D40/maxresdefault.jpg",
      description: "Automatic egg and chicken meat farm using hoppers.",
      tutorial: "Create a collection system with chickens above hoppers and lava cooking system.",
      product: [{name: "Eggs", image: "/path/to/egg.png"}, {name: "Chicken", image: "/path/to/chicken.png"}, {name: "Feathers", image: "/path/to/feather.png"}],
      buildingItems: [{name: "Seeds", image: "/path/to/seeds.png", quantity: "x1"}, {name: "Hoppers", image: "/path/to/hopper.png", quantity: "x5"}, {name: "Lava", image: "/path/to/lava_bucket.png", quantity: "x1"}],
      video: "https://www.youtube.com/embed/hMAlGOz_D40"
    },
    {
      id: 4,
      name: "Sugar Cane Farm",
      type: "Crop",
      image: "https://i.ytimg.com/vi/Anobqi7NaSg/maxresdefault.jpg",
      description: "Automated system for harvesting sugar cane using redstone.",
      tutorial: "Build an observer-piston system to break sugar cane when it grows to third block.",
      product: [{name: "Sugar Cane", image: "/path/to/sugar_cane.png"}],
      buildingItems: [{name: "Pistons", image: "/path/to/piston.png", quantity: "x10"}, {name: "Observers", image: "/path/to/observer.png", quantity: "x10"}, {name: "Water", image: "/path/to/water_bucket.png", quantity: "x1"}],
      video: "https://www.youtube.com/embed/Anobqi7NaSg"
    },
    {
      id: 5,
      name: "Enderman Farm",
      type: "Mob",
      image: "https://i.ytimg.com/vi/GPvyFAYbBZc/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC6hQSfe3r1t7CHW-09KOX0hBZ1Cw",
      description: "XP and ender pearl farm in the End dimension.",
      tutorial: "Create a platform with endermite trap to attract endermen for easy killing.",
      product: [{name: "Ender Pearls", image: "/path/to/ender_pearl.png"}, {name: "XP", image: "/path/to/xp_orb.png"}],
      buildingItems: [{name: "Endermite", image: "/path/to/endermite_spawn_egg.png", quantity: "x1"}, {name: "Minecarts", image: "/path/to/minecart.png", quantity: "x1"}, {name: "Name Tags", image: "/path/to/name_tag.png", quantity: "x1"}],
      video: "https://www.youtube.com/embed/GPvyFAYbBZc"
    }
  ];


const Farm = () => {
    const [farms, setFarms] = useState(farmData);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [showVideo, setShowVideo] = useState(false);


    useEffect(() => {
      let filtered = farmData;
      
      if (searchTerm) {
        filtered = filtered.filter(farm => 
          farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farm.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farm.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (activeFilter !== 'All') {
        filtered = filtered.filter(farm => farm.type === activeFilter);
      }
      
      setFarms(filtered);
    }, [searchTerm, activeFilter]);


    const handleFarmSelect = (farm) => {
      setSelectedFarm(farm);
      setShowVideo(false);
    };


    const renderFilterButtons = () => (
      <div className="farm-filter-container">
        <button 
          className={`farm-filter-button ${activeFilter === 'All' ? 'active' : ''}`}
          onClick={() => setActiveFilter('All')}
        >
          <i className="fas fa-globe"></i> All
        </button>
        <button 
          className={`farm-filter-button ${activeFilter === 'Crop' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Crop')}
        >
          <i className="fas fa-seedling"></i> Crops
        </button>
        <button 
          className={`farm-filter-button ${activeFilter === 'Mineral' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Mineral')}
        >
          <i className="fas fa-gem"></i> Minerals
        </button>
        <button 
          className={`farm-filter-button ${activeFilter === 'Animal' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Animal')}
        >
          <i className="fas fa-paw"></i> Animals
        </button>
        <button 
          className={`farm-filter-button ${activeFilter === 'Mob' ? 'active' : ''}`}
          onClick={() => setActiveFilter('Mob')}
        >
          <i className="fas fa-skull"></i> Mobs
        </button>
      </div>
    );

    
    const renderSearchBar = () => (
      <div className="farm-search-container">
        <input
          type="text"
          className="farm-search-input"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="fas fa-search farm-search-icon"></i>
      </div>
    );


    const renderFarmCard = (farm) => (
      <div 
        key={farm.id} 
        className="farm-card"
        onClick={() => handleFarmSelect(farm)}
      >
        <div className="farm-card-image">
          <img src={farm.image} alt={farm.name} />
          <div className="farm-type-badge">{farm.type}</div>
        </div>
        <div className="farm-card-content">
          <h3 className="farm-card-title">{farm.name}</h3>
          <p className="farm-card-description">{farm.description.substring(0, 60)}...</p>
          <div className="farm-card-click-prompt">
            <i className="fas fa-hand-pointer"></i> {'>>'} Click to view details {'<<'}
          </div>
        </div>
      </div>
    );


    const renderFarmDetail = () => (
      <div className="farm-detail">
        <div className="farm-detail-header">
          <div className="farm-detail-title-box">
            <h2>{selectedFarm.name}</h2>
            <div className="farm-type-badge">{selectedFarm.type}</div>
          </div>
          <button 
            className="farm-detail-back-button"
            onClick={() => setSelectedFarm(null)}
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
                {selectedFarm.video && (
                  <button
                    className={`farm-media-button ${showVideo ? 'active' : ''}`}
                    onClick={() => setShowVideo(true)}
                  >
                    Video
                  </button>
                )}
              </div>

              {!showVideo ? (
                <img src={selectedFarm.image} alt={selectedFarm.name} />
              ) : (
                <iframe
                  src={selectedFarm.video}
                  title={`${selectedFarm.name} Tutorial Video`}
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
                <p>{selectedFarm.description}</p>
              </div>
            </div>
          </div>
          
          {/* Resources Section */}
          <div className="farm-detail-resources">
            <div className="farm-info-section">
              <h3><i className="fas fa-tools"></i> Items for building</h3>
              <ul className="farm-resource-list">
                {selectedFarm.buildingItems.map((resource, index) => (
                  <li key={index} className="farm-resource-item">
                    <div className="farm-resource-info">
                      <img src={resource.image} alt={resource.name} className="farm-resource-image" />
                      <span className="farm-resource-name">{resource.name}</span>
                    </div>
                    <span className="farm-resource-quantity">{resource.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="farm-info-section">
              <h3><i className="fas fa-gem"></i> Items you will receive</h3>
              <ul className="farm-resource-list">
                {selectedFarm.product.map((item, index) => (
                  <li key={index} className="farm-resource-item">
                    <div className="farm-resource-info">
                      <img src={item.image} alt={item.name} className="farm-resource-image" />
                      <span className="farm-resource-name">{item.name}</span>
                    </div>
                    <span className="farm-resource-quantity">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tutorial Section */}
          <div className="farm-detail-tutorial">
            <div className="farm-info-section">
              <h3><i className="fas fa-clipboard-list"></i> ขั้นตอนการสร้าง</h3>
              <div className="farm-tutorial-box">
                <p>{selectedFarm.tutorial}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );


    return (
      <>
        <Navbar />
        <div className="farm-page">
          <div className="farm-page-content">
            <div className="farm-page-header">
              <h1 className="farm-page-title">Minecraft Farms</h1>
            </div>
    
            <div className="farm-page-controls">
              {renderFilterButtons()}
              {renderSearchBar()}
            </div>
    
            {selectedFarm ? (
              renderFarmDetail()
            ) : (
              <div className="farm-grid">
                {farms.length > 0 ? (
                  farms.map(renderFarmCard)
                ) : (
                  <div className="farm-no-results">
                    <i className="fas fa-search fa-3x"></i>
                    <p>No farms match your search criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
};

export default Farm;