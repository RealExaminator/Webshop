// frontend/src/services/item.service.js
import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL_ITEMS = '/api/items/';

const getAllOnSaleItems = () => {
  return axios.get(API_URL_ITEMS);
};

const getItemById = (id) => {
  return axios.get(API_URL_ITEMS + id + '/');
};

const createItem = (itemData) => {
  return axios.post(API_URL_ITEMS, itemData, { headers: authHeader() });
};

const getMyItems = () => {
  return axios.get(API_URL_ITEMS + 'my_items/', { headers: authHeader() });
};

const getMyPurchases = () => {
  return axios.get(API_URL_ITEMS + 'my_purchases/', { headers: authHeader() });
};

const searchItems = (query) => {
  return axios.get(API_URL_ITEMS + `?search=${encodeURIComponent(query)}`);
};

// New function to update item price (or any part of the item if backend allows)
const updateItem = (itemId, itemData) => {
  // Using PATCH to send only changed fields. Backend must support PATCH.
  // If backend only supports PUT, you'd need to send the full item object.
  return axios.patch(API_URL_ITEMS + itemId + '/', itemData, { headers: authHeader() });
};

// Specific function for just price, calls the more general updateItem
const updateItemPrice = (itemId, newPrice) => {
    return updateItem(itemId, { price: newPrice });
};


const ItemService = {
  getAllOnSaleItems,
  getItemById,
  createItem,
  getMyItems,
  getMyPurchases,
  searchItems,
  updateItem, // Expose the general update if needed elsewhere
  updateItemPrice, // Expose specific price update
};
export default ItemService;