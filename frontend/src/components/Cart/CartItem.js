// frontend/src/components/Cart/CartItem.js
import React, {useState} from 'react';
import Button from '../UI/Button';

const CartItem = ({ cartItemData, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  if (!cartItemData || !cartItemData.item_details) {
    return <li>Error: Invalid cart item data.</li>;
  }

  const { id: cartItemId, item_details: item } = cartItemData;

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(cartItemId); // onRemove is expected to handle errors and UI updates
    // setIsRemoving(false); // Parent component (CartPage) will re-render, so this might not be needed if component unmounts
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0' }}>
      <div>
        <h4 style={{ margin: '0 0 5px 0' }}>{item.title}</h4>
        <p style={{ margin: '0', fontSize: '0.9em' }}>Price: ${parseFloat(item.price).toFixed(2)}</p>
        {/* <p>Quantity: 1</p> Placeholder for quantity */}
      </div>
      <Button onClick={handleRemove} disabled={isRemoving} className="ui-button" style={{backgroundColor: '#dc3545'}}>
        {isRemoving ? 'Removing...' : 'Remove'}
      </Button>
    </div>
  );
};

export default CartItem;