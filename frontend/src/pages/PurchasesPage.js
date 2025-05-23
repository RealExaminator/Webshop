// frontend/src/pages/PurchasesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import ItemService from '../services/item.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';
import ItemList from '../components/Items/ItemList'; // Re-using ItemList for display
// Or if you have a specific MyItems component for purchases:
// import PurchasedItemsList from '../components/Items/PurchasedItemsList';


const PurchasesPage = () => {
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ItemService.getMyPurchases();
      setPurchasedItems(response.data); // These items will have status 'sold' and current user as buyer
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch your purchased items.';
      setError(errorMessage);
      console.error("Error fetching purchased items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPurchases();
  }, [fetchMyPurchases]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>My Purchased Items</h2>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}

      {purchasedItems.length > 0 ? (
        <ItemList items={purchasedItems} />
        // For purchased items, the ItemCard should ideally show 'Purchased on [date]' and 'From: [seller_username]'
        // You might need to adapt ItemCard or create a new component for this view.
      ) : (
        !error && <p>You have not purchased any items yet.</p>
      )}
    </div>
  );
};

export default PurchasesPage;