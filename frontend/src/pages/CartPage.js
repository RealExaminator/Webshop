import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirecting after successful purchase
import CartService from '../services/cart.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';
import CartItem from '../components/Cart/CartItem';
import Button from '../components/UI/Button';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false); // Specific loading state for payment
  const [error, setError] = useState('');
  const [payFeedback, setPayFeedback] = useState({ message: '', type: '' }); // For payment specific messages
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      const response = await CartService.getCartItems();
      // Attach originalPrice for frontend display if price changes (Req 12a)
      // This is illustrative, as backend checkout handles final checks.
      const itemsWithDisplayPrice = response.data.map(ci => ({
        ...ci,
        displayPrice: parseFloat(ci.item_details.price).toFixed(2), // Store current price for UI
        hasIssue: false, // For highlighting items with issues
        issueMessage: ''
      }));
      setCartItems(itemsWithDisplayPrice);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch cart items.';
      setError(errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleRemoveItem = async (cartItemId) => {
    try {
      setPayFeedback({ message: '', type: '' }); // Clear pay feedback
      await CartService.removeItemFromCart(cartItemId);
      // Re-fetch cart items to update list and total, without full page loading spinner
      fetchCartItems(false);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to remove item.');
    }
  };

  const handlePay = async () => {
    setPaying(true);
    setPayFeedback({ message: '', type: '' });
    setError(''); // Clear general errors

    try {
      const response = await CartService.checkoutCart();
      setPayFeedback({ message: response.data.detail, type: 'success' });
      // Cart is now empty on backend, fetch to reflect this
      // setCartItems([]); // Optimistic update
      fetchCartItems(false);
      setTimeout(() => navigate('/my-purchases'), 3000); // Redirect to purchases
    } catch (err) {
      const errData = err.response?.data;
      if (errData && errData.issues) {
        // Req 12a, 12b: Issues found, transaction halted
        setPayFeedback({ message: errData.detail || "Please resolve item issues.", type: 'error' });
        // Update cartItems to show notifications next to problematic items
        const updatedCartItems = cartItems.map(ci => {
          const issue = errData.issues.find(iss => iss.cart_item_id === ci.id || iss.item_id === ci.item_details.id);
          if (issue) {
            return { ...ci, hasIssue: true, issueMessage: issue.message,
                     // If price changed, backend should send new price to update `displayPrice`
                     // displayPrice: issue.new_price ? parseFloat(issue.new_price).toFixed(2) : ci.displayPrice
                   };
          }
          return { ...ci, hasIssue: false, issueMessage: '' }; // Clear previous issues
        });
        setCartItems(updatedCartItems);
      } else {
        setPayFeedback({ message: errData?.detail || err.message || 'Payment failed.', type: 'error' });
      }
    } finally {
      setPaying(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, cartItem) => total + parseFloat(cartItem.displayPrice || cartItem.item_details.price), 0).toFixed(2);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>Your Shopping Cart</h2>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      {payFeedback.message && <Notification message={payFeedback.message} type={payFeedback.type} onClose={() => setPayFeedback({ message: '', type: '' })} />}

      {cartItems.length === 0 && !paying ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map(cartItem => (
            <div key={cartItem.id}>
              <CartItem
                cartItemData={cartItem}
                onRemove={() => handleRemoveItem(cartItem.id)}
              />
              {cartItem.hasIssue && (
                <Notification message={cartItem.issueMessage} type="warning" style={{fontSize: '0.8em', padding: '5px'}} />
              )}
            </div>
          ))}
          <hr />
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <h3>Total: ${calculateTotal()}</h3>
            <Button onClick={handlePay} className="ui-button" disabled={cartItems.length === 0 || paying}>
              {paying ? <LoadingSpinner /> : 'Pay Now'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;