import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import '../styles/Calculator.css';
import Select from 'react-select';

function Calculator() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [craftRequests, setCraftRequests] = useState([{ itemId: "", amount: 1 }]);
  const [requiredMaterials, setRequiredMaterials] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/items");
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

      const response = await fetch("http://localhost:3000/items/calculate-materials", {
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

      setRequiredMaterials(data.required_materials);
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

  const getSelectedOption = (value) => itemOptions.find(opt => opt.value === value) || null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="calculator-page">
          <div className="calculator-container">
            <div className="calculator-box">
              <div className="calculator-loading">Loading items...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="calculator-page">
        <div className="calculator-container">
          <div className="calculator-box">
            <h1>Material Calculator</h1>
            
            {error && <div className="calculator-error">{error}</div>}

            <div className="calculator-form">
              {craftRequests.map((request, index) => (
                <div key={index} className="calculator-item-row">
                  <Select
                    className="calculator-item-select"
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
                    className="calculator-amount-input"
                  />
                  {craftRequests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="calculator-remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <div className="calculator-actions">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="calculator-add-btn"
                >
                  + Add Item
                </button>
                <button
                  type="button"
                  onClick={calculateMaterials}
                  className="calculator-calculate-btn"
                  disabled={isCalculating}
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Materials'}
                </button>
              </div>

              {requiredMaterials.length > 0 && (
                <div className="calculator-results">
                  <h2>Required Materials:</h2>
                  <div className="calculator-materials-list">
                    {requiredMaterials.map((material) => (
                      <div key={material.item_id} className="calculator-material-item">
                        <img src={material.item_image} alt={material.item_name} />
                        <span>{material.item_name}</span>
                        <span className="calculator-material-amount">x{material.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Calculator;