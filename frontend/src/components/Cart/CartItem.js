import React, { useState } from 'react';
import Button from '../UI/Button';
import Notification from '../UI/Notification';
import ProductImage from '../Items/ProductImage';

const CartItem = ({ cartItemData, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  if (!cartItemData || !cartItemData.item_details) {
    return (
      <div className="cart-line-error">
        Error: Invalid cart item data.
      </div>
    );
  }

  const {
    id: cartItemId,
    item_details: item,
    displayPrice,
    originalFetchedPrice,
    hasIssue,
    issueMessage
  } = cartItemData;

  const currentItemPrice = displayPrice || (item && item.price ? parseFloat(item.price).toFixed(2) : '0.00');
  const priceHasChanged = originalFetchedPrice && currentItemPrice !== originalFetchedPrice && hasIssue && issueMessage?.toLowerCase().includes('price');

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(cartItemId);
  };

  const lineClass = [
    'cart-line',
    hasIssue ? 'cart-line--issue' : '',
    hasIssue && item.status !== 'on-sale' ? 'cart-line--muted' : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={lineClass}>
      <ProductImage item={item} thumb />
      <div>
        <h4>{item.title}</h4>
        <p className="cart-line-price">
          Price: ${currentItemPrice}
          {priceHasChanged && originalFetchedPrice && (
            <span className="price-was">(was ${originalFetchedPrice})</span>
          )}
        </p>
        <p className="cart-line-meta">
          Seller: {item.seller_username}
        </p>
        {hasIssue && issueMessage && (
          <Notification
            message={issueMessage}
            type={issueMessage.toLowerCase().includes('available') || issueMessage.toLowerCase().includes('exists') ? 'error' : 'warning'}
            className="notification--compact"
          />
        )}
      </div>
      <Button
        onClick={handleRemove}
        disabled={isRemoving}
        className="ui-button--danger"
      >
        {isRemoving ? '...' : 'Remove'}
      </Button>
    </article>
  );
};

export default CartItem;
