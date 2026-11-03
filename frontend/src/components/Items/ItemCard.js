import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import CartService from '../../services/cart.service';
import Button from '../UI/Button';
import Notification from '../UI/Notification';
import ProductImage from './ProductImage';

const ItemCard = ({ item }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleAddToCart = async () => {
    if (!isAuthenticated || !item || !item.id || item.status !== 'on-sale') return;

    setIsAdding(true);
    setMessage({ text: '', type: '' });

    try {
      await CartService.addItemToCart(item.id);
      setMessage({ text: `${item.title} added to cart!`, type: 'success' });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Could not add item to cart.';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsAdding(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const showAddToCartButton =
    isAuthenticated &&
    item &&
    item.status === 'on-sale' &&
    currentUser &&
    item.seller !== currentUser.id;

  const title = item?.title || 'No Title';
  const sold = item && item.status === 'sold';

  return (
    <article className={`item-card${sold ? ' item-card--sold' : ''}`}>
      <ProductImage item={item} sold={sold} />

      <div className="item-card-body">
        <h3>{title}</h3>
        <p className="item-card-description">{item?.description || 'No Description'}</p>
        <p className="item-card-price">
          Price: ${item?.price ? parseFloat(item.price).toFixed(2) : 'N/A'}
        </p>
        <p className="item-card-meta">
          Seller: {item?.seller_username || 'Unknown'}
          <br />
          Added: {item?.date_added ? new Date(item.date_added).toLocaleDateString() : 'N/A'}
          {sold && item.buyer_username && (
            <>
              <br />
              Purchased by: {item.buyer_username}
            </>
          )}
        </p>

        <div className="item-card-actions">
          {message.text && (
            <Notification
              message={message.text}
              type={message.type}
              onClose={() => setMessage({ text: '', type: '' })}
              className="notification--compact"
            />
          )}

          {item && item.status === 'on-sale' ? (
            isAuthenticated ? (
              showAddToCartButton ? (
                <Button onClick={handleAddToCart} disabled={isAdding} className="ui-button--block">
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </Button>
              ) : (
                item.seller === currentUser.id && <p className="item-card-note">This is your item.</p>
              )
            ) : (
              <p className="item-card-note">Login to add to cart.</p>
            )
          ) : sold ? (
            <p className="item-card-sold-banner">ITEM PURCHASED</p>
          ) : (
            item && <p className="item-card-note">Item status unknown.</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
