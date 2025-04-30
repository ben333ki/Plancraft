import React, { useEffect, useState } from 'react';
import Leaves from './Leaves';
import Navbar from './Navbar';
import CraftingGrid from './CraftingGrid';
import LevelRequirements from './LevelRequirements';
import ItemCategories from './ItemCategories';
import ItemsGrid from './ItemsGrid';
import ItemDetails from './ItemDetails';
import { getRecipeByName } from '../utils/itemsData';
import Tooltip from './Tooltip';
import '../styles/Craft.css';

const Craft = () => {
    const [activeCategory, setActiveCategory] = useState('Tools');
    const [selectedItem, setSelectedItem] = useState(null);
    const [recipe, setRecipe] = useState({
        title: 'Name of the item',
        gridSlots: Array(9).fill(null),
        resultSlot: null,
        levelRequirements: { level3: [], level2: [], level1: [] }
    });

    const handleItemSelect = (itemName) => {
        setSelectedItem(itemName);
        const newRecipe = getRecipeByName(itemName);
        setRecipe({
            title: itemName,
            gridSlots: newRecipe.gridSlots,
            resultSlot: newRecipe.resultSlot,
            levelRequirements: newRecipe.levelRequirements
        });
    };

    return (
        <>
            <Navbar />
            <Leaves />
            <div className="home-bg">
                <div className="content">
                    <div className="content-box">
                        <div className="recipe-display">
                            <h1>Crafting</h1>
                            <div className="crafting-container">
                                <CraftingGrid 
                                    title={recipe.title} 
                                    gridSlots={recipe.gridSlots} 
                                    resultSlot={recipe.resultSlot} 
                                />
                                
                                <LevelRequirements levelItems={recipe.levelRequirements} />
                            </div>
                        </div>

                        <div className="items-section">
                            <ItemCategories 
                                activeCategory={activeCategory} 
                                setActiveCategory={setActiveCategory} 
                            />
                            
                            <ItemsGrid 
                                activeCategory={activeCategory} 
                                onItemSelect={handleItemSelect} 
                            />

                            <ItemDetails />
                        </div>
                    </div>
                </div>
            </div>
            <Tooltip />
        </>
    );
};

export default Craft;
