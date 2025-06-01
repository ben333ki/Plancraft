import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Farm.css';
import Navbar from './Navbar';

const Farm = () => {
    const navigate = useNavigate();
    const [allFarms, setAllFarms] = useState([]);
    const [filteredFarms, setFilteredFarms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const response = await fetch('http://localhost:3000/farms');
                if (!response.ok) {
                    throw new Error('Failed to fetch farms');
                }
                const data = await response.json();
                setAllFarms(data.farms);
                setFilteredFarms(data.farms);
            } catch (err) {
                console.error('Error fetching farms:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFarms();
    }, []);

    useEffect(() => {
        let filtered = [...allFarms];
        
        if (searchTerm) {
            filtered = filtered.filter(farm => 
                farm.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                farm.farm_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                farm.farm_description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (activeFilter !== 'All') {
            filtered = filtered.filter(farm => farm.farm_category === activeFilter);
        }
        
        setFilteredFarms(filtered);
    }, [searchTerm, activeFilter, allFarms]);

    const handleFarmSelect = (farm) => {
        navigate(`/farm/${farm.farm_id}`);
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
                className={`farm-filter-button ${activeFilter === 'Crop and Food' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Crop and Food')}
            >
                <i className="fas fa-seedling"></i> Crop and Food
            </button>
            <button 
                className={`farm-filter-button ${activeFilter === 'Block' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Block')}
            >
                <i className="fas fa-cube"></i> Block
            </button>
            <button 
                className={`farm-filter-button ${activeFilter === 'Item' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Item')}
            >
                <i className="fas fa-box"></i> Item
            </button>
            <button 
                className={`farm-filter-button ${activeFilter === 'Mob' ? 'active' : ''}`}
                onClick={() => setActiveFilter('Mob')}
            >
                <i className="fas fa-skull"></i> Mob
            </button>
        </div>
    );

    const renderSearchBar = () => (
        <div className="farm-search-container">
            <input
                type="text"
                className="farm-search-input"
                placeholder="Search farms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search farm-search-icon"></i>
        </div>
    );

    const renderFarmCard = (farm) => (
        <div 
            key={farm.farm_id} 
            className="farm-card"
            onClick={() => handleFarmSelect(farm)}
        >
            <div className="farm-card-image">
                <img 
                    src={`https://i.ytimg.com/vi/${farm.farm_video_url.split('/').pop()}/maxresdefault.jpg`} 
                    alt={farm.farm_name} 
                />
                <div className="farm-type-badge">{farm.farm_category}</div>
            </div>
            <div className="farm-card-content">
                <h3 className="farm-card-title">{farm.farm_name}</h3>
                <p className="farm-card-description">{farm.farm_description.substring(0, 60)}...</p>
                <div className="farm-card-click-prompt">
                    <i className="fas fa-hand-pointer"></i> {'>>'} Click to view details {'<<'}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="farm-page">
                    <div className="farm-page-content">
                        <div className="farm-loading">
                            <i className="fas fa-spinner fa-spin fa-3x"></i>
                            <p>Loading farms...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="farm-page">
                    <div className="farm-page-content">
                        <div className="farm-error">
                            <i className="fas fa-exclamation-circle fa-3x"></i>
                            <p>Error: {error}</p>
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
        
                    <div className="farm-page-controls">
                        {renderFilterButtons()}
                        {renderSearchBar()}
                    </div>
        
                    <div className="farm-grid">
                        {filteredFarms.length > 0 ? (
                            filteredFarms.map(renderFarmCard)
                        ) : (
                            <div className="farm-no-results">
                                <i className="fas fa-search fa-3x"></i>
                                <p>No farms match your search criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Farm;