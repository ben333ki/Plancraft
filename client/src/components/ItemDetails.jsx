import React from 'react';

const ItemDetails = ({ selectedItem }) => {
  return (
    <div className="craft-item-details">
      <div className="craft-details-title">Details</div>
      <div className={`craft-details-content ${selectedItem ? 'active' : ''}`}>
        {selectedItem ? (
          <>
            <div className="craft-item-header">
              <img src={selectedItem.ItemImage} alt={selectedItem.ItemName} />
              <h3>{selectedItem.ItemName}</h3>
            </div>
            <div className="craft-item-info">
              <p><strong>Category:</strong> {selectedItem.ItemCategory}</p>
              <p><strong>Description:</strong> {selectedItem.ItemDesc}</p>
            </div>
          </>
        ) : (
          <p>Select an item to see its details</p>
        )}
      </div>
    </div>
  );
};

export default ItemDetails;