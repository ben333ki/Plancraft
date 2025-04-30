import React from 'react';

const LevelRequirements = ({ levelItems }) => {
  return (
    <div className="level-requirements">
      <div className="level-box level-3">
        <div className="level-title">LEVEL 3</div>
        <div className="level-items">
          {levelItems.level3.map((item, index) => (
            <div key={index} className="item-requirement">
              <img src={`Image/${item.image}`} alt={item.name} />
              <span>{item.amount}x</span>
            </div>
          ))}
        </div>
      </div>
      <div className="level-box level-2">
        <div className="level-title">LEVEL 2</div>
        <div className="level-items">
          {levelItems.level2.map((item, index) => (
            <div key={index} className="item-requirement">
              <img src={`Image/${item.image}`} alt={item.name} />
              <span>{item.amount}x</span>
            </div>
          ))}
        </div>
      </div>
      <div className="level-box level-1">
        <div className="level-title">LEVEL 1</div>
        <div className="level-items">
          {levelItems.level1.map((item, index) => (
            <div key={index} className="item-requirement">
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