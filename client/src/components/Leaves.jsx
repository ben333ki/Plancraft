import React from 'react';
import '../styles/Leaves.css';

const Leaves = () => {
  return (
    <div className="leaves">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="leaf"></div>
      ))}
    </div>
  );
};

export default Leaves;