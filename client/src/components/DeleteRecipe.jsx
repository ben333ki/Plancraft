import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import '../styles/DeleteRecipe.css';

function DeleteRecipe() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/items");
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
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/delete-recipe/${recipeId}`, {
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

            <div className="recipes-list">
              {recipes.length === 0 ? (
                <div className="no-recipes">No recipes found</div>
              ) : (
                recipes.map((recipe) => (
                  <div key={recipe.RecipeID} className="recipe-item">
                    <div className="recipe-info">
                      <img 
                        src={recipe.recipe_item.ItemImage} 
                        alt={recipe.recipe_item.ItemName} 
                        className="recipe-item-image"
                      />
                      <div className="recipe-details">
                        <h3>{recipe.recipe_item.ItemName}</h3>
                        <p>Amount: {recipe.recipe_amount}</p>
                      </div>
                    </div>
                    <button
                      className="delete-button"
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
                className="cancel-button"
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
