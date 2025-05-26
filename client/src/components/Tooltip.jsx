import React, { useState, useEffect } from 'react';

const Tooltip = () => {
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const target = e.target.closest('.craft-item-slot');
      if (target && target.querySelector('img')) {
        setTooltip({
          show: true,
          text: target.querySelector('img').alt,
          x: e.pageX + 10,
          y: e.pageY + 10
        });
      } else {
        setTooltip({ ...tooltip, show: false });
      }
    };

    const handleMouseLeave = () => {
      setTooltip({ ...tooltip, show: false });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [tooltip]);

  return (
    <div
      className="craft-item-tooltip"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        opacity: tooltip.show ? 1 : 0
      }}
    >
      {tooltip.text}
    </div>
  );
};

export default Tooltip;