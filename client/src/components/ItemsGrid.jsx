import React from 'react';

const itemsByCategory = {
  Tools: [
    { name: 'Iron Axe', image: 'Iron_axe.webp' },
    { name: 'Iron Pickaxe', image: 'Iron_Pickaxe.webp' }
  ],
  Combat: [
    { name: 'Sword Iron', image: 'sword-iron.png' }
  ],
  Ingredients: [
    { name: 'Stick', image: 'Stick.webp' },
    { name: 'Iron', image: 'iron.png' },
    { name: 'Coal', image: 'Coal.webp' }
  ],
  Foods: [
    { name: 'Apple', image: 'Apple.webp' }
  ],
  'Building Blocks': [
    { name: 'Oak Planks', image: 'Oak_Planks.webp' }
  ],
  'Colored Blocks': [
    { name: 'White Wool', image: 'White_Wool.webp' }
  ],
  'Functional Blocks': [
    { name: 'Crafting Table', image: 'Crafting_Table.webp' }
  ],
  'Redstone Blocks': [
    { name: 'Redstone', image: 'Redstone.webp' }
  ],
  'Natural Blocks': [
    { name: 'Dirt', image: 'Dirt.webp' }
  ]
};

const ItemsGrid = ({ activeCategory, onItemSelect }) => {
  return (
    <div className="items-grid">
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div
          key={category}
          className={`category-items ${activeCategory === category ? 'active' : ''}`}
          data-category={category}
        >
          {items.map((item) => (
            <div
              key={item.name}
              className="item-slot"
              onClick={() => onItemSelect(item.name)}
            >
              <img src={`Image/${item.image}`} alt={item.name} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ItemsGrid;