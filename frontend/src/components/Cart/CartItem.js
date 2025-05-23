// frontend/src/components/Cart/CartItem.js
import React, { useState } from 'react';
import Button from '../UI/Button';
import Notification from '../UI/Notification';

const CartItem = ({ cartItemData, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  if (!cartItemData || !cartItemData.item_details) {
    return (
      <div style={{ borderBottom: '1px solid #eee', padding: '15px 0', color: 'red' }}>
        Error: Invalid cart item data.
      </div>
    );
  }

  const {
    id: cartItemId,
    item_details: item,
    displayPrice,
    originalFetchedPrice, // Price when cart was last loaded/fetched
    hasIssue,
    issueMessage
  } = cartItemData;

  const currentItemPrice = displayPrice || (item && item.price ? parseFloat(item.price).toFixed(2) : '0.00');
  const priceHasChanged = originalFetchedPrice && currentItemPrice !== originalFetchedPrice && hasIssue && issueMessage?.toLowerCase().includes('price');


  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(cartItemId);
  };

  return (
    <div style={{ borderBottom: '1px solid #eee', padding: '15px 0', backgroundColor: hasIssue ? '#fff3cd' : 'transparent', opacity: hasIssue && item.status !== 'on-sale' ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{flexGrow: 1}}>
          <h4 style={{ margin: '0 0 5px 0' }}>{item.title}</h4>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
            Price: ${currentItemPrice}
            {priceHasChanged && originalFetchedPrice && (
              <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#777' }}>
                (was ${originalFetchedPrice})
              </span>
            )}
          </p>
          <p style={{ margin: '0', fontSize: '0.8em', color: '#777' }}>
            Seller: {item.seller_username}
          </p>
        </div>
        <Button
          onClick={handleRemove}
          disabled={isRemoving}
          className="ui-button"
          style={{backgroundColor: '#dc3545', padding: '8px 12px', fontSize: '0.9em', flexShrink: 0}}
        >
          {isRemoving ? '...' : 'Remove'}
        </Button>
      </div>
      {hasIssue && issueMessage && (
        <Notification
            message={issueMessage}
            type={issueMessage.toLowerCase().includes('available') || issueMessage.toLowerCase().includes('exists') ? "error" : "warning"}
            style={{fontSize: '0.85em', padding: '8px', marginTop: '10px', borderRadius: '4px'}}
        />
      )}
    </div>
  );
};

export default CartItem;