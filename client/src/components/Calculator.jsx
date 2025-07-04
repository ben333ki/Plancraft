import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import '../styles/Calculator.css';
import Select from 'react-select';
import { API_URL } from '../config/constants';

function Calculator() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [craftRequests, setCraftRequests] = useState([{ itemId: "", amount: 1 }]);
  const [itemMaterials, setItemMaterials] = useState([]);
  const [farmMaterials, setFarmMaterials] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farmAmount, setFarmAmount] = useState(1);
  const [farms, setFarms] = useState([]);
  const [farmRequests, setFarmRequests] = useState([{ farmId: "", amount: 1 }]);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [materialsForTodo, setMaterialsForTodo] = useState([]);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [activeForm, setActiveForm] = useState('item'); // 'item' or 'farm'

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch items
        const itemsResponse = await fetch(`${API_URL}/items`);
        if (!itemsResponse.ok) {
          throw new Error('Failed to fetch items');
        }
        const itemsData = await itemsResponse.json();
        const extractedItems = itemsData.items.map(itemData => itemData.item);
        setItems(extractedItems);

        // Fetch farms
        const farmsResponse = await fetch(`${API_URL}/farms`);
        if (!farmsResponse.ok) {
          throw new Error('Failed to fetch farms');
        }
        const farmsData = await farmsResponse.json();
        setFarms(farmsData.farms);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    setCraftRequests([...craftRequests, { itemId: "", amount: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newRequests = craftRequests.filter((_, i) => i !== index);
    setCraftRequests(newRequests);
  };

  const handleItemChange = (index, selectedOption) => {
    const newRequests = [...craftRequests];
    newRequests[index].itemId = selectedOption ? selectedOption.value : "";
    setCraftRequests(newRequests);
  };

  const handleAmountChange = (index, value) => {
    const newRequests = [...craftRequests];
    newRequests[index].amount = parseInt(value) || 1;
    setCraftRequests(newRequests);
  };

  const getSelectedOption = (value) => {
    return itemOptions.find(opt => opt.value === value) || null;
  };

  const calculateMaterials = async () => {
    setError('');
    setIsCalculating(true);

    try {
      // Validate for negative amounts
      const hasNegativeAmount = craftRequests.some(req => parseInt(req.amount) < 0);
      if (hasNegativeAmount) {
        setError('Amount cannot be negative.');
        setIsCalculating(false);
        return;
      }

      const formattedRequests = craftRequests.map(req => ({
        item_id: req.itemId,
        amount: parseInt(req.amount) > 0 ? parseInt(req.amount) : 1
      }));

      const response = await fetch(`${API_URL}/items/calculate-materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedRequests)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate materials');
      }

      setItemMaterials(data.required_materials);
    } catch (error) {
      console.error('Calculation error:', error);
      setError(error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAddFarm = () => {
    setFarmRequests([...farmRequests, { farmId: "", amount: 1 }]);
  };

  const handleRemoveFarm = (index) => {
    const newRequests = farmRequests.filter((_, i) => i !== index);
    setFarmRequests(newRequests);
  };

  const handleFarmChange = (index, selectedOption) => {
    const newRequests = [...farmRequests];
    newRequests[index].farmId = selectedOption ? selectedOption.value : "";
    setFarmRequests(newRequests);
  };

  const handleFarmAmountChange = (index, value) => {
    const newRequests = [...farmRequests];
    newRequests[index].amount = parseInt(value) || 1;
    setFarmRequests(newRequests);
  };

  const calculateFarmMaterials = async () => {
    setError('');
    setIsCalculating(true);

    try {
      // Validate farm selections
      const hasInvalidFarms = farmRequests.some(req => !req.farmId);
      if (hasInvalidFarms) {
        throw new Error('Please select all farms');
      }

      // Validate amounts
      const hasInvalidAmounts = farmRequests.some(req => isNaN(req.amount) || req.amount <= 0);
      if (hasInvalidAmounts) {
        throw new Error('Please enter valid amounts for all farms');
      }

      // Calculate materials for each farm
      const allMaterials = [];
      for (const request of farmRequests) {
        const response = await fetch(`${API_URL}/farms/calculate-materials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            farm_id: request.farmId,
            amount: request.amount
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to calculate farm materials');
        }

        // Add materials to the list
        allMaterials.push(...data.materials);
      }

      // Combine materials with the same item_id
      const combinedMaterials = allMaterials.reduce((acc, material) => {
        const existing = acc.find(m => m.item_id === material.item_id);
        if (existing) {
          existing.amount += material.amount;
        } else {
          acc.push({ ...material });
        }
        return acc;
      }, []);

      setFarmMaterials(combinedMaterials);
    } catch (error) {
      console.error('Calculation error:', error);
      setError(error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const itemOptions = items.map(item => ({
    value: item.ItemID,
    label: item.ItemName,
    image: item.ItemImage
  }));

  const farmOptions = farms.map(farm => {
    const videoId = farm.farm_video_url.split('/').pop();
    return {
      value: farm.farm_id,
      label: farm.farm_name,
      image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    };
  });

  const createTodoFromMaterials = async (materials) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginAlert(true);
      return;
    }
    setShowTodoModal(true);
    setMaterialsForTodo(materials);
  };

  // Helper function to get selected items/farms
  const getSelectedItems = () => {
    if (activeForm === 'farm') {
      return farmRequests
        .filter(req => req.farmId)
        .map(req => {
          const farm = farms.find(f => f.farm_id === req.farmId);
          return farm ? farm.farm_name : null;
        })
        .filter(Boolean);
    }
    return craftRequests
      .filter(req => req.itemId)
      .map(req => {
        const item = items.find(i => i.ItemID === req.itemId);
        return item ? item.ItemName : null;
      })
      .filter(Boolean);
  };

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
        <div className="calc-page">
          <div className="calc-container">
            <div className="calc-loading">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="calc-page">
        <div className="calc-container">
          <div className="calc-header">
            <h1>Material Calculator</h1>
            <div className="calc-type-toggle">
              <button 
                className={`calc-type-btn ${activeForm === 'item' ? 'active' : ''}`}
                onClick={() => setActiveForm('item')}
              >
                Item Calculator
              </button>
              <button 
                className={`calc-type-btn ${activeForm === 'farm' ? 'active' : ''}`}
                onClick={() => setActiveForm('farm')}
              >
                Farm Calculator
              </button>
            </div>
          </div>

          {activeForm === 'farm' && (
            <div className="calc-box">
              <h2>Farm Material Calculator</h2>
              
              {error && <div className="calc-error">{error}</div>}

              <div className="calc-form">
                {farmRequests.map((request, index) => (
                  <div key={index} className="calc-input-row">
                    <Select
                      className="calc-select"
                      value={farmOptions.find(opt => opt.value === request.farmId) || null}
                      onChange={(selectedOption) => handleFarmChange(index, selectedOption)}
                      options={farmOptions}
                      formatOptionLabel={({ label, image }) => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img src={image} alt={label} style={{ width: 30, height: 30, marginRight: 10 }} />
                          {label}
                        </div>
                      )}
                      placeholder="Select a farm..."
                      isSearchable
                    />
                    <input
                      type="number"
                      min="1"
                      value={request.amount}
                      onChange={(e) => handleFarmAmountChange(index, e.target.value)}
                      className="calc-amount-input"
                      placeholder="Number of farms"
                    />
                    {farmRequests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFarm(index)}
                        className="calc-remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <div className="calc-actions">
                  <button
                    type="button"
                    onClick={handleAddFarm}
                    className="calc-add-btn"
                  >
                    + Add Farm
                  </button>
                  <button
                    type="button"
                    onClick={calculateFarmMaterials}
                    className="calc-calculate-btn"
                    disabled={isCalculating}
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate Materials'}
                  </button>
                </div>

                {farmMaterials.length > 0 && (
                  <div className="calc-results">
                    <div className="calc-results-header">
                      <h2>Required Materials:</h2>
                      <span className="calc-stack-note">1 Stack = x64</span>
                    </div>
                    <div className="calc-materials-grid">
                      {farmMaterials.map((material) => {
                        const stacks = calculateStacks(material.amount);
                        return (
                          <div key={material.item_id} className="calc-material-item">
                            <img src={material.item_image} alt={material.item_name} />
                            <span>{material.item_name}</span>
                            <div className="calc-material-amount">
                              {stacks.fullStacks > 0 && <span>{stacks.fullStacks} Stack</span>}
                              {stacks.remainder > 0 && (
                                <span className="calc-remainder">
                                  {stacks.fullStacks > 0 ? ' + ' : ''}x{stacks.remainder}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="calc-todo-btn">
                      <button
                        type="button"
                        onClick={() => createTodoFromMaterials(farmMaterials)}
                        className="calc-todo-create-btn"
                      >
                        Create Todo List
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeForm === 'item' && (
            <div className="calc-box">
              <h2>Item Material Calculator</h2>
              
              {error && <div className="calc-error">{error}</div>}

              <div className="calc-form">
                {craftRequests.map((request, index) => (
                  <div key={index} className="calc-input-row">
                    <Select
                      className="calc-select"
                      value={getSelectedOption(request.itemId)}
                      onChange={(selectedOption) => handleItemChange(index, selectedOption)}
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
                      value={request.amount}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      className="calc-amount-input"
                    />
                    {craftRequests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="calc-remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <div className="calc-actions">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="calc-add-btn"
                  >
                    + Add Item
                  </button>
                  <button
                    type="button"
                    onClick={calculateMaterials}
                    className="calc-calculate-btn"
                    disabled={isCalculating}
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate Materials'}
                  </button>
                </div>

                {itemMaterials.length > 0 && (
                  <div className="calc-results">
                    <div className="calc-results-header">
                      <h2>Required Materials:</h2>
                      <span className="calc-stack-note">1 Stack = x64</span>
                    </div>
                    <div className="calc-materials-grid">
                      {itemMaterials.map((material) => {
                        const stacks = calculateStacks(material.amount);
                        return (
                          <div key={material.item_id} className="calc-material-item">
                            <img src={material.item_image} alt={material.item_name} />
                            <span>{material.item_name}</span>
                            <div className="calc-material-amount">
                              {stacks.fullStacks > 0 && <span>{stacks.fullStacks} Stack</span>}
                              {stacks.remainder > 0 && (
                                <span className="calc-remainder">
                                  {stacks.fullStacks > 0 ? ' + ' : ''}x{stacks.remainder}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="calc-todo-btn">
                      <button
                        type="button"
                        onClick={() => createTodoFromMaterials(itemMaterials)}
                        className="calc-todo-create-btn"
                      >
                        Create Todo List
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Todo Form Modal */}
      {showTodoModal && (
        <TodoFormModal
          materials={materialsForTodo}
          selectedItems={getSelectedItems()}
          isFromFarms={activeForm === 'farm'}
          onClose={() => {
            setShowTodoModal(false);
            setMaterialsForTodo([]);
          }}
          onSave={async (formData) => {
            try {
              const response = await fetch(`${API_URL}/api/todolist/tasks`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  title: formData.title,
                  description: formData.description,
                  category: formData.category,
                  priority: formData.priority,
                  startDate: new Date(formData.startDate),
                  endDate: new Date(formData.endDate),
                  status: "pending",
                  userID: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user_id : null
                })
              });

              if (!response.ok) {
                const data = await response.json();
                if (response.status === 500) {
                  throw new Error('This title name already exists');
                }
                throw new Error(data.error || 'Failed to create todo');
              }

              // Navigate to todo list after successful creation
              navigate('/todolist');
            } catch (error) {
              console.error('Error creating todo:', error);
              setError(error.message);
            }
          }}
          error={error}
        />
      )}

      {/* Login Alert Modal */}
      {showLoginAlert && (
        <div className="todo-modal" onClick={() => setShowLoginAlert(false)}>
          <div className="todo-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="todo-modal-header">
              <h2>Login Required</h2>
              <button className="todo-close-modal" onClick={() => setShowLoginAlert(false)}>&times;</button>
            </div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Please login to use this feature.</p>
              <div className="todo-form-actions" style={{ marginTop: '20px' }}>
                <button 
                  className="todo-cancel-btn" 
                  onClick={() => setShowLoginAlert(false)}
                >
                  Cancel
                </button>
                <button 
                  className="todo-save-btn" 
                  onClick={() => {
                    setShowLoginAlert(false);
                    navigate('/login');
                  }}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Todo Form Modal Component
const TodoFormModal = ({ materials, selectedItems, isFromFarms, onClose, onSave, error }) => {
  // Format materials into description with a header
  const formatAmount = (amount) => {
    if (amount >= 64) {
      const stacks = Math.floor(amount / 64);
      const remainder = amount % 64;
      return remainder > 0 
        ? `${stacks} Stack + x${remainder}`
        : `${stacks} Stack`;
    }
    return `x${amount}`;
  };

  const formattedDescription = `${isFromFarms ? 'Selected Farms:\n' : 'Selected Items:\n'}${selectedItems.map(item => `- ${item}`).join('\n')}\n\nMaterials List:\n${materials.map(material => 
    `- ${material.item_name} ${formatAmount(material.amount)}`
  ).join('\n')}\n\nAdditional Notes:`;

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    description: formattedDescription
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="todo-modal" onClick={onClose}>
      <div className="todo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="todo-modal-header">
          <h2>Create Todo List</h2>
          <button className="todo-close-modal" onClick={onClose}>&times;</button>
        </div>
        {error && (
          <div className="todo-modal-error">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="todo-form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.filter(cat => cat.key !== 'all').map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="todo-form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Materials list and additional notes"
              rows="8"
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="">Select priority</option>
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="todo-form-actions">
            <button type="button" className="todo-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="todo-save-btn">Create Todo List</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add these constants at the top of the file with other imports
const CATEGORIES = [
  { key: 'building', label: 'Building' },
  { key: 'crafting', label: 'Crafting' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'farming', label: 'Farming' }
];

const PRIORITIES = ['low', 'medium', 'high'];

export default Calculator;