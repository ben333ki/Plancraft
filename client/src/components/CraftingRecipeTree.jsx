import React, { useEffect, useState } from 'react';
import CraftingGrid from './CraftingGrid';

const findItemByID = (items, id) => {
  return items.find(entry => entry.item.ItemID === id);
};

const findRecipeByItemID = (items, id) => {
  return items.find(entry => entry.recipe?.RecipeItem === id);
};

const buildGridSlots = (recipe, items) => {
  const slots = Array(9).fill(null);
  recipe.CraftingGrid.forEach(({ Position, ItemInGrid }) => {
    if (ItemInGrid !== '000000000000000000000000') {
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
    const rendered = new Set(); // ✅ Track already-rendered itemIDs
  
    useEffect(() => {
      fetch(`http://localhost:3000/items/${rootItemID}/recipe-tree`)
        .then(res => res.json())
        .then(data => {
          setItems(data.items);
          setLoading(false);
        });
    }, [rootItemID]);
  
    if (loading) return <p>Loading recipe...</p>;
  
    const renderTree = (itemID) => {
      if (rendered.has(itemID)) return null; // ✅ Skip duplicate render
      rendered.add(itemID);
  
      const recipeEntry = findRecipeByItemID(items, itemID);
      if (!recipeEntry) return null;
  
      const gridSlots = buildGridSlots(recipeEntry.recipe, items);
      const resultSlot = {
        image: recipeEntry.item.ItemImage,
        name: recipeEntry.item.ItemName,
        amount: recipeEntry.recipe.RecipeAmount,
      };
  
      return (
        <div className="mb-6">
          <CraftingGrid title={resultSlot.name} gridSlots={gridSlots} resultSlot={resultSlot} />
          <div className="ml-8">
            {gridSlots.map((slot, idx) => {
              if (!slot) return null;
              const hasSubRecipe = findRecipeByItemID(items, slot.itemID);
              return hasSubRecipe ? (
                <div key={idx}>{renderTree(slot.itemID)}</div>
              ) : null;
            })}
          </div>
        </div>
      );
    };
  
    return <div>{renderTree(rootItemID)}</div>;
  };
  

export default CraftingRecipeTree;
