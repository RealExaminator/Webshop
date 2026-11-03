import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartService from '../services/cart.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';
import CartItem from '../components/Cart/CartItem';
import Button from '../components/UI/Button';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [payFeedback, setPayFeedback] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      setError('');
      setPayFeedback({ message: '', type: '' });

      const response = await CartService.getCartItems();
      const itemsWithDisplayInfo = response.data.map(ci => {
        const itemPrice = ci.item_details && ci.item_details.price !== null && ci.item_details.price !== undefined
                           ? parseFloat(ci.item_details.price).toFixed(2)
                           : '0.00';
        return {
          ...ci,
          originalFetchedPrice: itemPrice,
          displayPrice: itemPrice,
          hasIssue: false,
          issueMessage: ''
        };
      });
      setCartItems(itemsWithDisplayInfo);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch cart items.';
      setError(errorMessage);
      setCartItems([]);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleRemoveItem = async (cartItemId) => {
    setError('');
    setPayFeedback({ message: '', type: '' });
    try {
      await CartService.removeItemFromCart(cartItemId);
      setCartItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== cartItemId);
        // If removing an item that had an issue, and it's the only one with an issue,
        // clear the general payFeedback error that might have been set.
        const remainingIssues = newItems.some(item => item.hasIssue);
        if (!remainingIssues && payFeedback.type === 'error' && payFeedback.message.includes("review item issues")) {
            setPayFeedback({ message: '', type: '' });
        }
        return newItems;
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to remove item from cart.');
    }
  };

  const handlePay = async () => {
    setPaying(true);
    setPayFeedback({ message: '', type: '' });
    setError('');

    // Before calling backend, clear previous issue flags on cart items in frontend state
    setCartItems(prevItems => prevItems.map(item => ({ ...item, hasIssue: false, issueMessage: '' })));

    try {
      const response = await CartService.checkoutCart();
      setPayFeedback({ message: response.data.detail, type: 'success' });
      setCartItems([]);
      setTimeout(() => navigate('/my-purchases'), 3000);
    } catch (err) {
      const errData = err.response?.data;
      if (errData && errData.issues && Array.isArray(errData.issues)) {
        setPayFeedback({
            message: errData.detail || "Please review item issues before proceeding.",
            type: 'error'
        });

        const issuesMap = new Map();
        errData.issues.forEach(iss => {
            // Use cart_item_id if available, otherwise item_id as a fallback key
            const key = iss.cart_item_id || (iss.item_id ? `item-${iss.item_id}` : null);
            if (key) issuesMap.set(key, iss);
        });

        const updatedCartItems = cartItems.map(ci => {
          const issueDetail = issuesMap.get(ci.id) || issuesMap.get(`item-${ci.item_details?.id}`);

          if (issueDetail) {
            const newDisplayPrice = issueDetail.issue === 'price_changed' && issueDetail.current_price
                                     ? parseFloat(issueDetail.current_price).toFixed(2)
                                     : ci.displayPrice; // Keep current display price if not a price change issue
            return {
              ...ci,
              hasIssue: true,
              issueMessage: issueDetail.message,
              displayPrice: newDisplayPrice,
              item_details: {
                ...ci.item_details,
                price: newDisplayPrice, // Update underlying item_details.price as well
                status: issueDetail.issue === 'not_available' ? 'sold' : ci.item_details.status
              }
            };
          }
          return ci; // No issue for this item, return as is
        });
        setCartItems(updatedCartItems);

      } else {
        setPayFeedback({ message: errData?.detail || err.message || 'Payment failed. Please try again.', type: 'error' });
      }
    } finally {
      setPaying(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, cartItem) => {
        const priceToUse = cartItem.displayPrice ? parseFloat(cartItem.displayPrice) : (cartItem.item_details && cartItem.item_details.price ? parseFloat(cartItem.item_details.price) : 0);
        return total + priceToUse;
    }, 0).toFixed(2);
  };

  if (loading && !paying) return <LoadingSpinner />;

  return (
    <div className="page">
      <header className="page-header">
        <h2>Your Shopping Cart</h2>
      </header>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      {payFeedback.message && <Notification message={payFeedback.message} type={payFeedback.type} onClose={() => setPayFeedback({ message: '', type: '' })} />}

      {cartItems.length === 0 && !paying ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="ui-button">Browse</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {cartItems.map(cartItem => (
              <CartItem
                key={cartItem.id}
                cartItemData={cartItem}
                onRemove={() => handleRemoveItem(cartItem.id)}
              />
            ))}
          </div>
          <aside className="cart-summary">
            <h3>Total: ${calculateTotal()}</h3>
            <Button onClick={handlePay} className="ui-button--block" disabled={cartItems.length === 0 || paying}>
              {paying ? <LoadingSpinner inline /> : 'Pay Now'}
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;