import React from 'react';

const ItemsGrid = ({ activeCategory, onItemSelect, items }) => {
    // Filter items by category (using correct field name)
    const filteredItems = items.filter(item => 
        item.item.ItemCategory === activeCategory
    );

    return (
        <div className="craft-items-grid">
            {filteredItems.map((itemData, index) => (
                <div 
                    key={index} 
                    className="craft-item-slot"
                    onClick={() => onItemSelect(itemData.item.ItemName)}
                >
                    <img 
                        src={itemData.item.ItemImage} 
                        alt={itemData.item.ItemName}
                        title={itemData.item.ItemName}
                    />
                </div>
            ))}
        </div>
    );
};

export default ItemsGrid;