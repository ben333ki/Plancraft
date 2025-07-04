import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import '../styles/DeleteRecipe.css';
import { API_URL } from '../config/constants';

function DeleteRecipe() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        // Filter items that have recipes and map to the format we need
        const recipesWithItems = data.items
          .filter(item => item.recipe) // Only get items that have recipes
          .map(item => ({
            RecipeID: item.recipe.RecipeID,
            recipe_item: item.item,
            recipe_amount: item.recipe.RecipeAmount
          }));
        setRecipes(recipesWithItems);
        setFilteredRecipes(recipesWithItems);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const filtered = recipes.filter(recipe => 
      recipe.recipe_item.ItemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [searchTerm, recipes]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/delete-recipe/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete recipe' }));
        throw new Error(errorData.error || 'Failed to delete recipe');
      }

      // Remove the deleted recipe from the state
      setRecipes(recipes.filter(recipe => recipe.RecipeID !== recipeId));
    } catch (error) {
      console.error('Recipe deletion error:', error);
      setError(error.message);
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
              <div className="delete-recipe-loading">Loading recipes...</div>
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
            <h1>Delete Recipes</h1>
            
            {error && <div className="delete-recipe-error">{error}</div>}

            <div className="delete-recipe-search">
              <input
                type="text"
                placeholder="Search recipes by item name..."
                value={searchTerm}
                onChange={handleSearch}
                className="delete-recipe-search-input"
              />
            </div>

            <div className="delete-recipe-recipes-list">
              {filteredRecipes.length === 0 ? (
                <div className="delete-recipe-no-recipes">
                  {searchTerm ? 'No recipes match your search' : 'No recipes found'}
                </div>
              ) : (
                filteredRecipes.map((recipe) => (
                  <div key={recipe.RecipeID} className="delete-recipe-recipe-item">
                    <div className="delete-recipe-recipe-info">
                      <img 
                        src={recipe.recipe_item.ItemImage} 
                        alt={recipe.recipe_item.ItemName} 
                        className="delete-recipe-recipe-item-image"
                      />
                      <div className="delete-recipe-recipe-details">
                        <h3>{recipe.recipe_item.ItemName}</h3>
                        <p>Amount: {recipe.recipe_amount}</p>
                      </div>
                    </div>
                    <button
                      className="delete-recipe-delete-button"
                      onClick={() => handleDelete(recipe.RecipeID)}
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
                onClick={() => navigate('/craft')}
              >
                Back to Craft
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteRecipe;