import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/cart/';

const getCartItems = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const addItemToCart = (itemId) => {
  return axios.post(API_URL, { item: itemId }, { headers: authHeader() });
};

const removeItemFromCart = (cartItemId) => {
  return axios.delete(API_URL + cartItemId + '/', { headers: authHeader() });
};

const checkoutCart = () => {
  // This POST request doesn't need a body if the backend processes all cart items for the user
  return axios.post(API_URL + 'checkout/', {}, { headers: authHeader() });
};

const CartService = {
  getCartItems,
  addItemToCart,
  removeItemFromCart,
  checkoutCart, // Add new method
};
export default CartService;