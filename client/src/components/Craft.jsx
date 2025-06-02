import React, { useEffect, useState } from 'react';
import Leaves from './Leaves';
import Navbar from './Navbar';
import ItemCategories from './ItemCategories';
import ItemsGrid from './ItemsGrid';
import ItemDetails from './ItemDetails';
import '../styles/Craft.css';
import CraftingRecipeTree from './CraftingRecipeTree';
import { API_URL } from '../config/constants';

const Craft = () => {
    const [activeCategory, setActiveCategory] = useState('Tools');
    const [selectedItem, setSelectedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [recipe, setRecipe] = useState({
        title: 'Select an item',
        gridSlots: Array(9).fill(null),
        resultSlot: null,
    });

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            // Filter items based on search query
            const filtered = items.filter(item => 
                item.item.ItemName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredItems(filtered);

            // If we have matches, set the category to the first matching item's category
            if (filtered.length > 0) {
                setActiveCategory(filtered[0].item.ItemCategory);
            }
        } else {
            // If no search query, show all items from current category
            setFilteredItems(items.filter(item => 
                item.item.ItemCategory === activeCategory
            ));
        }
    }, [searchQuery, items, activeCategory]);

    const fetchItems = async () => {
        try {
            const response = await fetch(`${API_URL}/items`);
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            setItems(data.items);
            setFilteredItems(data.items.filter(item => 
                item.item.ItemCategory === activeCategory
            ));
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

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setSearchQuery('');
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
                            {selectedItem && (
                                <CraftingRecipeTree rootItemID={selectedItem.ItemID} />
                            )}
                            </div>
                        </div>

                        <div className="craft-search-section">
                            <div className="craft-search-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search items"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="craft-search-input"
                                />
                            </div>
                        </div>

                        <div className="craft-items-section">
                            <ItemCategories 
                                activeCategory={activeCategory} 
                                setActiveCategory={handleCategoryChange} 
                            />
                            
                            <div className="craft-items-grid">
                                {searchQuery && filteredItems.length === 0 ? (
                                    <div className="craft-no-results">
                                        ไม่พบไอเทมที่ค้นหา
                                    </div>
                                ) : (
                                    <ItemsGrid 
                                        activeCategory={activeCategory} 
                                        onItemSelect={handleItemSelect}
                                        items={filteredItems}
                                        searchQuery={searchQuery}
                                    />
                                )}
                            </div>

                            <ItemDetails selectedItem={selectedItem} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Craft;