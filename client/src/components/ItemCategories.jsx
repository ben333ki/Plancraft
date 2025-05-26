import React from 'react';

const categories = [
  'Tools', 'Combat', 'Ingredients', 'Foods', 'Building Blocks',
  'Colored Blocks', 'Functional Blocks', 'Redstone Blocks', 'Natural Blocks'
];

const ItemCategories = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="craft-categories">
      {categories.map((category) => (
        <button
          key={category}
          className={`craft-category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default ItemCategories;