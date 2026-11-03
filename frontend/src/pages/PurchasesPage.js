import React, { useState, useEffect, useCallback } from 'react';
import ItemService from '../services/item.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';
import ItemList from '../components/Items/ItemList';


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
    <div className="page">
      <header className="page-header">
        <h2>My Purchased Items</h2>
      </header>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}

      {purchasedItems.length > 0 ? (
        <ItemList items={purchasedItems} />
      ) : (
        !error && (
          <div className="empty-state">
            <p>You have not purchased any items yet.</p>
          </div>
        )
      )}
    </div>
  );
};

export default PurchasesPage;