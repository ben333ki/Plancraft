import React from 'react';

const CraftingGrid = ({ title, gridSlots, resultSlot }) => {
  return (
    <div className="crafting-grid">
      <div className="grid-title">{title}</div>
      <div className="grid-container">
        {gridSlots.map((slot, index) => (
          <div key={index} className="grid-slot">
            {slot && (
              <>
                <img src={slot.image} alt={slot.name} />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="arrow">→</div>
      <div className="result-slot">
        {resultSlot && (
          <>
            <img src={resultSlot.image} alt={resultSlot.name} />
          </>
        )}
      </div>
    </div>
  );
};

export default CraftingGrid;