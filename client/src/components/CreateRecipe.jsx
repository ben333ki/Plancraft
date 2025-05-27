import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import '../styles/CreateRecipe.css';
import Select from 'react-select';


function CreateRecipe() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    recipe_item: "",
    recipe_amount: 1,
    crafting_grid: Array(9).fill("")
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/items");
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const data = await response.json();
        console.log('Fetched items:', data);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGridChange = (index, value) => {
    const newGrid = [...formData.crafting_grid];
    newGrid[index] = value;
    setFormData(prev => ({
      ...prev,
      crafting_grid: newGrid
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Format the crafting grid according to the server's expected structure
      const craftingGrid = formData.crafting_grid.map((itemId, index) => ({
        position: index + 1,
        item_in_grid: itemId || ""
      }));

      console.log('Submitting recipe:', {
        recipe_item: formData.recipe_item,
        recipe_amount: parseInt(formData.recipe_amount),
        crafting_grid: craftingGrid
      });

      const response = await fetch("http://localhost:3000/api/create-recipe", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipe_item: formData.recipe_item,
          recipe_amount: parseInt(formData.recipe_amount),
          crafting_grid: craftingGrid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create recipe');
      }

      navigate('/craft');
    } catch (error) {
      console.error('Recipe creation error:', error);
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
            <h1>Create New Recipe</h1>
            
            {error && <div className="create-recipe-error">{error}</div>}

            <form onSubmit={handleSubmit} className="create-recipe-form">
              <div className="create-recipe-form-group">
                <label htmlFor="recipe_item">Recipe Result</label>
                <Select
                    id="recipe_item"
                    name="recipe_item"
                    value={getSelectedOption(formData.recipe_item)}
                    onChange={(selectedOption) => {
                        setFormData(prev => ({
                        ...prev,
                        recipe_item: selectedOption ? selectedOption.value : ""
                        }));
                    }}
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

              </div>

              <div className="create-recipe-form-group">
                <label htmlFor="recipe_amount">Recipe Amount</label>
                <input
                  type="number"
                  id="recipe_amount"
                  name="recipe_amount"
                  min="1"
                  value={formData.recipe_amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="create-recipe-form-group">
                <label>Crafting Grid</label>
                <div className="create-recipe-grid">
                    {formData.crafting_grid.map((value, index) => (
                        <Select
                            key={index}
                            className="create-recipe-grid-cell"
                            value={getSelectedOption(value)}
                            onChange={(selectedOption) => handleGridChange(index, selectedOption ? selectedOption.value : "")}
                            options={itemOptions}
                            formatOptionLabel={({ label, image }) => (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={image} alt={label} style={{ width: 25, height: 25, marginRight: 8 }} />
                                {label}
                            </div>
                            )}
                            placeholder="--"
                        />
                    ))}
                </div>
              </div>

              <div className="create-recipe-form-actions">
                <button 
                  type="submit" 
                  className="create-recipe-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Recipe'}
                </button>
                <button 
                  type="button" 
                  className="create-recipe-cancel-btn"
                  onClick={() => navigate('/craft')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateRecipe;
