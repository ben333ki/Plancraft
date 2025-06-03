import React, { useEffect, useState } from 'react';
import CraftingGrid from './CraftingGrid';
import { API_URL } from '../config/constants';

const findItemByID = (items, id) => {
  return items.find(entry => entry.item.ItemID === id);
};

const findRecipeByItemID = (items, id) => {
  return items.find(entry => entry.recipe?.RecipeItem === id);
};

const buildGridSlots = (recipe, items) => {
  const slots = Array(9).fill(null);
  recipe.CraftingGrid.forEach(({ Position, ItemInGrid }) => {
    if (ItemInGrid && ItemInGrid !== '000000000000000000000000') {
      const matched = findItemByID(items, ItemInGrid);
      if (matched) {
        slots[Position - 1] = {
          image: matched.item.ItemImage,
          name: matched.item.ItemName,
          itemID: matched.item.ItemID,
        };
      }
    }
  });
  return slots;
};

const CraftingRecipeTree = ({ rootItemID }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recipeChain, setRecipeChain] = useState([]);
    const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(null);
  
    useEffect(() => {
      fetch(`${API_URL}/items/${rootItemID}/recipe-tree`)
        .then(res => res.json())
        .then(data => {
          setItems(data.items);
          setLoading(false);
          buildRecipeChain(rootItemID, data.items);
        });
    }, [rootItemID]);
  
    const buildRecipeChain = (currentItemID, allItems) => {
        const chain = [];
        let itemToProcess = findRecipeByItemID(allItems, currentItemID);
        
         if (itemToProcess) {
             chain.push(itemToProcess);
         }

        let ingredientsToProcess = itemToProcess?.recipe?.CraftingGrid
            .filter(slot => slot.ItemInGrid && slot.ItemInGrid !== '000000000000000000000000')
            .map(slot => slot.ItemInGrid) || [];

        const processedItemIDs = new Set([currentItemID]);

        while (ingredientsToProcess.length > 0) {
            const nextIngredientsToProcess = [];
            ingredientsToProcess.forEach(ingredientID => {
                if (!processedItemIDs.has(ingredientID)) {
                    processedItemIDs.add(ingredientID);
                    const ingredientRecipe = findRecipeByItemID(allItems, ingredientID);
                    if (ingredientRecipe) {
                        chain.push(ingredientRecipe);
                        
                        ingredientRecipe.recipe.CraftingGrid
                            .filter(slot => slot.ItemInGrid && slot.ItemInGrid !== '000000000000000000000000')
                            .forEach(slot => nextIngredientsToProcess.push(slot.ItemInGrid));
                    }
                }
            });
            ingredientsToProcess = nextIngredientsToProcess;
        }
        setRecipeChain(chain.reverse());
    };

    const handleGridClick = (index) => {
        if (recipeChain.length > 3) {
            setSelectedRecipeIndex(index);
        }
    };

    const handleCloseFocus = () => {
        setSelectedRecipeIndex(null);
    };
  
    if (loading) return <p>Loading recipe...</p>;
  
    if (recipeChain.length === 0) return <p>No crafting recipe found for this item.</p>;
  
    const containerClassName = `craft-recipe-chain-container ${recipeChain.length > 3 ? 'craft-chain-small craft-chain-clickable' : ''}`;

    if (selectedRecipeIndex !== null) {
        const recipeEntry = recipeChain[selectedRecipeIndex];
        const gridSlots = buildGridSlots(recipeEntry.recipe, items);
        const resultSlot = {
            image: recipeEntry.item.ItemImage,
            name: recipeEntry.item.ItemName,
            amount: recipeEntry.recipe.RecipeAmount,
        };
        return (
            <div className="craft-focused-grid-container" onClick={handleCloseFocus}>
                 <div className="craft-focused-grid-wrapper" onClick={e => e.stopPropagation()}>
                    <CraftingGrid
                        title={recipeEntry.item.ItemName}
                        gridSlots={gridSlots}
                        resultSlot={resultSlot}
                        isFocused={true}
                        onClose={handleCloseFocus}
                    />
                 </div>
            </div>
        );
    }

    return (
        <div className={containerClassName}>
            {recipeChain.map((recipeEntry, index) => {
                const gridSlots = buildGridSlots(recipeEntry.recipe, items);
                const resultSlot = {
                    image: recipeEntry.item.ItemImage,
                    name: recipeEntry.item.ItemName,
                    amount: recipeEntry.recipe.RecipeAmount,
                };
                return (
                    <CraftingGrid
                        key={index}
                        title={recipeEntry.item.ItemName}
                        gridSlots={gridSlots}
                        resultSlot={resultSlot}
                        onClick={() => handleGridClick(index)}
                        isFocused={false}
                    />
                );
            })}
        </div>
      );
  };
  

export default CraftingRecipeTree;