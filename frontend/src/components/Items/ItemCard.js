// frontend/src/components/Items/ItemCard.js
import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import CartService from '../../services/cart.service';
import Button from '../UI/Button';
import Notification from '../UI/Notification';

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

  const cardStyle = {
    border: '1px solid #A9A9A9',
    padding: '20px',
    borderRadius: '8px',
    width: '265px',
    backgroundColor: '#DDDDDD',
    boxShadow: '0 2px 5px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    opacity: item && item.status === 'sold' ? 0.75 : 1, // Slightly dim sold items
  };

  return (
    <div style={cardStyle}>
      <div> {/* Content wrapper */}
        <h3 style={{ marginTop: '0', marginBottom: '10px', fontSize: '1.25rem', color: '#2D2D2D' }}>
          {item?.title || 'No Title'}
          {item && item.status === 'sold' && (
            <span style={{ fontSize: '0.8rem', color: 'red', marginLeft: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>(Sold)</span>
          )}
        </h3>
        <p style={{ fontSize: '0.9em', color: '#555555', minHeight: '60px', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {item?.description || 'No Description'}
        </p>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: (item && item.status === 'sold' ? '#777777' : '#FF6600'), marginBottom: '5px' }}> {/* Muted price if sold */}
          Price: ${item?.price ? parseFloat(item.price).toFixed(2) : 'N/A'}
        </p>
        <p style={{ fontSize: '0.8em', color: '#777777', marginBottom: '15px' }}>
          <small>Seller: {item?.seller_username || 'Unknown'}</small><br/>
          <small>Added: {item?.date_added ? new Date(item.date_added).toLocaleDateString() : 'N/A'}</small>
          {item && item.status === 'sold' && item.buyer_username && (
            <><br/><small>Purchased by: {item.buyer_username}</small></>
          )}
        </p>
      </div>

      <div style={{ marginTop: 'auto' }}> {/* Button and message container */}
        {message.text && (
            <Notification
                message={message.text}
                type={message.type}
                onClose={() => setMessage({text: '', type: ''})}
                style={{marginBottom: '10px', fontSize: '0.85em', padding: '8px', textAlign: 'center', borderRadius: '4px'}}
            />
        )}

        {item && item.status === 'on-sale' ? (
            isAuthenticated ? (
                showAddToCartButton ? (
                    <Button onClick={handleAddToCart} disabled={isAdding} className="ui-button" style={{ width: '100%'}}>
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                    </Button>
                ) : (
                    item.seller === currentUser.id && <p style={{fontSize: '0.8em', color: 'grey', textAlign: 'center', padding: '10px 0'}}>This is your item.</p>
                )
            ) : (
                <p style={{fontSize: '0.8em', color: 'grey', textAlign: 'center', padding: '10px 0'}}>Login to add to cart.</p>
            )
        ) : item && item.status === 'sold' ? (
            <p style={{fontSize: '0.9em', color: '#B22222', fontWeight: 'bold', textAlign: 'center', padding: '10px 0', border: '1px dashed #B22222', borderRadius: '4px', backgroundColor: '#ffe0e0'}}>ITEM PURCHASED</p>
        ) : (
            item && <p style={{fontSize: '0.8em', color: 'grey', textAlign: 'center', padding: '10px 0'}}>Item status unknown.</p>
        ) }
      </div>
    </div>
  );
};

export default ItemCard;