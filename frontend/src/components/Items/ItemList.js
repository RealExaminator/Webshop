import React from 'react';
import ItemCard from './ItemCard';
import './ItemList.css'; // Import the CSS file

const ItemList = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="item-list-container"> {/* Use the class name */}
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ItemList;