import React from 'react';

const LevelRequirements = ({ levelItems }) => {
  return (
    <div className="craft-level-requirements">
      <div className="craft-level-box craft-level-3">
        <div className="craft-level-title">LEVEL 3</div>
        <div className="craft-level-items">
          {levelItems.level3.map((item, index) => (
            <div key={index} className="craft-item-requirement">
              <img src={`Image/${item.image}`} alt={item.name} />
              <span>{item.amount}x</span>
            </div>
          ))}
        </div>
      </div>
      <div className="craft-level-box craft-level-2">
        <div className="craft-level-title">LEVEL 2</div>
        <div className="craft-level-items">
          {levelItems.level2.map((item, index) => (
            <div key={index} className="craft-item-requirement">
              <img src={`Image/${item.image}`} alt={item.name} />
              <span>{item.amount}x</span>
            </div>
          ))}
        </div>
      </div>
      <div className="craft-level-box craft-level-1">
        <div className="craft-level-title">LEVEL 1</div>
        <div className="craft-level-items">
          {levelItems.level1.map((item, index) => (
            <div key={index} className="craft-item-requirement">
              <img src={`Image/${item.image}`} alt={item.name} />
              <span>{item.amount}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelRequirements; 