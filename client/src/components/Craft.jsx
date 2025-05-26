import React, { useEffect, useState } from 'react';
import Leaves from './Leaves';
import Navbar from './Navbar';
import CraftingGrid from './CraftingGrid';
import ItemCategories from './ItemCategories';
import ItemsGrid from './ItemsGrid';
import ItemDetails from './ItemDetails';
import Tooltip from './Tooltip';
import '../styles/Craft.css';

const Craft = () => {
    const [activeCategory, setActiveCategory] = useState('Tools');
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recipe, setRecipe] = useState({
        title: 'Select an item',
        gridSlots: Array(9).fill(null),
        resultSlot: null,
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch('http://localhost:3000/items');
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            setItems(data.items);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleItemSelect = (itemName) => {
        const selectedItemData = items.find(item => item.item.ItemName === itemName);
        if (!selectedItemData) return;
        setSelectedItem(selectedItemData.item);

        if (selectedItemData.recipe) {
            const gridSlots = Array(9).fill(null);
            selectedItemData.recipe.CraftingGrid.forEach(cell => {
                if (cell.ItemInGrid && cell.ItemInGrid !== "000000000000000000000000") {
                    const itemInSlot = items.find(i => i.item.ItemID === cell.ItemInGrid);
                    if (itemInSlot) {
                        gridSlots[cell.Position - 1] = {
                            image: itemInSlot.item.ItemImage,
                            name: itemInSlot.item.ItemName
                        };
                    }
                }
            });
            setRecipe({
                title: selectedItemData.item.ItemName,
                gridSlots: gridSlots,
                resultSlot: {
                    image: selectedItemData.item.ItemImage,
                    name: selectedItemData.item.ItemName,
                    amount: selectedItemData.recipe.RecipeAmount
                }
            });
        } else {
            setRecipe({
                title: selectedItemData.item.ItemName,
                gridSlots: Array(9).fill(null),
                resultSlot: {
                    image: selectedItemData.item.ItemImage,
                    name: selectedItemData.item.ItemName,
                    amount: 1
                }
            });
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="craft-loading">Loading items...</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="craft-error">Error: {error}</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <Leaves />
            <div className="craft-page">
                <div className="craft-content">
                    <div className="craft-content-box">
                        <div className="craft-recipe-display">
                            <h1>Crafting</h1>
                            <div className="craft-crafting-container">
                                <CraftingGrid 
                                    title={recipe.title} 
                                    gridSlots={recipe.gridSlots} 
                                    resultSlot={recipe.resultSlot} 
                                />
                            </div>
                        </div>

                        <div className="craft-items-section">
                            <ItemCategories 
                                activeCategory={activeCategory} 
                                setActiveCategory={setActiveCategory} 
                            />
                            
                            <ItemsGrid 
                                activeCategory={activeCategory} 
                                onItemSelect={handleItemSelect}
                                items={items}
                            />

                            <ItemDetails selectedItem={selectedItem} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Craft;