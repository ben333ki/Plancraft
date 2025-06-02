import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import '../styles/CreateRecipe.css';
import Select from 'react-select';
import { API_URL } from '../config/constants';

function CreateFarm() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [farmData, setFarmData] = useState({
    farm_name: '',
    farm_description: '',
    farm_area: '',
    farm_category: '',
    farm_video_url: '',
    items_required: [],
    items_produced: []
  });

  const categoryOptions = [
    { value: 'Crop and Food', label: 'Crop and Food' },
    { value: 'Block', label: 'Block' },
    { value: 'Item', label: 'Item' },
    { value: 'Mob', label: 'Mob' }
  ];

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const data = await response.json();
        const extractedItems = data.items.map(itemData => itemData.item);
        setItems(extractedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFarmData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (selectedOption) => {
    setFarmData(prev => ({
      ...prev,
      farm_category: selectedOption.value
    }));
  };

  const handleAddItem = (type) => {
    setFarmData(prev => ({
      ...prev,
      [type]: [...prev[type], { item_id: '', amount: 1 }]
    }));
  };

  const handleRemoveItem = (type, index) => {
    setFarmData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (type, index, selectedOption) => {
    if (!selectedOption) return; // Don't update if no option is selected

    setFarmData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { 
          ...item, 
          item_id: selectedOption.value, // This will be the ObjectID from the server
          amount: item.amount || 1 // Ensure amount is set
        } : item
      )
    }));
  };

  const handleAmountChange = (type, index, value) => {
    const amount = parseInt(value) || 1;
    setFarmData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, amount } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Filter out any items that don't have both item_id and amount
      const validRequiredItems = farmData.items_required
        .filter(item => item.item_id && item.amount > 0)
        .map(item => ({
          item_id: item.item_id,
          amount: item.amount
        }));

      const validProducedItems = farmData.items_produced
        .filter(item => item.item_id && item.amount > 0)
        .map(item => ({
          item_id: item.item_id,
          amount: item.amount
        }));

      // Prepare the data for submission
      const submitData = {
        farm_name: farmData.farm_name,
        farm_description: farmData.farm_description,
        farm_area: farmData.farm_area,
        farm_category: farmData.farm_category,
        farm_video_url: farmData.farm_video_url,
        items_required: validRequiredItems.length > 0 ? validRequiredItems : null,
        items_produced: validProducedItems.length > 0 ? validProducedItems : null
      };

      console.log('Submitting data:', submitData); // Debug log

      const response = await fetch(`${API_URL}/api/create-farm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create farm');
      }

      // Redirect to the farms page after successful creation
      navigate('/farm');
    } catch (error) {
      console.error('Creation error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemOptions = items.map(item => ({
    value: item.ItemID,
    label: item.ItemName,
    image: item.ItemImage
  }));

  const getSelectedOption = (value) => itemOptions.find(opt => opt.value === value) || null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="create-recipe-page">
          <div className="create-recipe-container">
            <div className="create-recipe-box">
              <div className="create-recipe-loading">Loading items...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="create-recipe-page">
        <div className="create-recipe-container">
          <div className="create-recipe-box">
            <h1>Create New Farm</h1>
            
            {error && <div className="create-recipe-error">{error}</div>}

            <form onSubmit={handleSubmit} className="calculator-form">
              <div className="form-group">
                <label>Farm Name</label>
                <input
                  type="text"
                  name="farm_name"
                  value={farmData.farm_name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="farm_description"
                  value={farmData.farm_description}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Area (e.g., 9x9)</label>
                <input
                  type="text"
                  name="farm_area"
                  value={farmData.farm_area}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <Select
                  value={categoryOptions.find(opt => opt.value === farmData.farm_category)}
                  onChange={handleCategoryChange}
                  options={categoryOptions}
                  className="form-select"
                  placeholder="Select category..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Video URL</label>
                <input
                  type="url"
                  name="farm_video_url"
                  value={farmData.farm_video_url}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Required Items (Optional)</label>
                {farmData.items_required.map((item, index) => (
                  <div key={index} className="calculator-item-row">
                    <Select
                      className="calculator-item-select"
                      value={getSelectedOption(item.item_id)}
                      onChange={(selectedOption) => handleItemChange('items_required', index, selectedOption)}
                      options={itemOptions}
                      formatOptionLabel={({ label, image }) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img src={image} alt={label} style={{ width: 30, height: 30, marginRight: 10 }} />
                          {label}
                        </div>
                      )}
                      placeholder="Select an item..."
                      isSearchable
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.amount}
                      onChange={(e) => handleAmountChange('items_required', index, e.target.value)}
                      className="calculator-amount-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('items_required', index)}
                      className="calculator-remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddItem('items_required')}
                  className="calculator-add-btn"
                >
                  Add Required Item
                </button>
              </div>

              <div className="form-group">
                <label>Produced Items (Optional)</label>
                {farmData.items_produced.map((item, index) => (
                  <div key={index} className="calculator-item-row">
                    <Select
                      className="calculator-item-select"
                      value={getSelectedOption(item.item_id)}
                      onChange={(selectedOption) => handleItemChange('items_produced', index, selectedOption)}
                      options={itemOptions}
                      formatOptionLabel={({ label, image }) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img src={image} alt={label} style={{ width: 30, height: 30, marginRight: 10 }} />
                          {label}
                        </div>
                      )}
                      placeholder="Select an item..."
                      isSearchable
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.amount}
                      onChange={(e) => handleAmountChange('items_produced', index, e.target.value)}
                      className="calculator-amount-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('items_produced', index)}
                      className="calculator-remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddItem('items_produced')}
                  className="calculator-add-btn"
                >
                  Add Produced Item
                </button>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="calculator-calculate-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Farm...' : 'Create Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateFarm;
