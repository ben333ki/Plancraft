import React from 'react';

const CraftingGrid = ({ title, gridSlots, resultSlot }) => {
  return (
    <div className="craft-crafting-grid">
      <div className="craft-grid-container">
        {gridSlots.map((slot, index) => (
          <div key={index} className="craft-grid-slot">
            {slot && (
              <>
                <img src={slot.image} alt={slot.name} />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="craft-arrow">→</div>
      <div className="craft-result-slot">
        {resultSlot && (
          <div className="result-slot-container">
            <img src={resultSlot.image} alt={resultSlot.name} />
            {resultSlot.amount > 1 && (
              <div className="result-amount">{resultSlot.amount}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftingGrid;