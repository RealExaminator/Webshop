import React from 'react';

const MyItems = ({ items, title }) => {
  return (
    <div>
      <h2>{title}</h2>
      {/* Logic to display user's items (for sale, sold, purchased) */}
      {items && items.length > 0 ? (
        items.map(item => <div key={item.id}>{item.title} - {item.status}</div>)
      ) : (
        <p>No items found.</p>
      )}
    </div>
  );
};

export default MyItems;