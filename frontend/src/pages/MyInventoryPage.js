// frontend/src/pages/MyInventoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import ItemService from '../services/item.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';
// We will display items directly here instead of a generic ItemList for edit functionality
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const MyInventoryPage = () => {
  const [onSaleItems, setOnSaleItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItemId, setEditItemId] = useState(null); // ID of item being edited
  const [newPrice, setNewPrice] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchMyInventory = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      const response = await ItemService.getMyItems();
      setOnSaleItems(response.data.filter(item => item.status === 'on-sale'));
      setSoldItems(response.data.filter(item => item.status === 'sold'));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch your inventory.';
      setError(errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyInventory();
  }, [fetchMyInventory]);

  const handleEditPriceClick = (item) => {
    setEditItemId(item.id);
    setNewPrice(parseFloat(item.price).toFixed(2)); // Pre-fill with current price
    setEditError('');
    setEditSuccess('');
  };

  const handleCancelEdit = () => {
    setEditItemId(null);
    setNewPrice('');
    setEditError('');
  };

  const handleSavePrice = async (itemId) => {
    setEditError('');
    setEditSuccess('');
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setEditError("Price must be a positive number.");
      return;
    }

    try {
      await ItemService.updateItemPrice(itemId, priceValue);
      setEditSuccess("Price updated successfully!");
      setEditItemId(null); // Close edit form
      fetchMyInventory(false); // Re-fetch to show updated data without full load
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.price || err.message || 'Failed to update price.';
      setEditError(errorMessage);
      setTimeout(() => setEditError(''), 5000);
    }
  };

  const renderItemCard = (item) => (
    <div key={item.id} style={{ border: '1px solid #eee', padding: '15px', margin: '10px 0', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h4>{item.title}</h4>
      <p>Current Price: ${parseFloat(item.price).toFixed(2)}</p>
      <p>Status: <span style={{ fontWeight: 'bold', color: item.status === 'on-sale' ? 'green' : 'red' }}>{item.status.replace('-', ' ')}</span></p>
      <p><small>Added: {new Date(item.date_added).toLocaleDateString()}</small></p>
      {item.status === 'sold' && item.buyer_username && (
        <p><small>Sold to: {item.buyer_username}</small></p>
      )}

      {item.status === 'on-sale' && (
        editItemId === item.id ? (
          <div style={{ marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
            <h5>Edit Price</h5>
            {editError && <Notification message={editError} type="error" onClose={() => setEditError('')} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min="0.01"
                step="0.01"
                style={{width: '100px'}}
              />
              <Button onClick={() => handleSavePrice(item.id)} className="ui-button" style={{backgroundColor: '#28a745'}}>Save</Button>
              <Button onClick={handleCancelEdit} className="ui-button" style={{backgroundColor: '#6c757d'}}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => handleEditPriceClick(item)} className="ui-button" style={{ marginTop: '10px' }}>
            Edit Price
          </Button>
        )
      )}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2>My Inventory</h2>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      {editSuccess && <Notification message={editSuccess} type="success" onClose={() => setEditSuccess('')} />}

      <section>
        <h3>Items Currently For Sale</h3>
        {onSaleItems.length > 0 ? (
          onSaleItems.map(item => renderItemCard(item))
        ) : (
          !error && <p>You have no items currently listed for sale.</p>
        )}
      </section>

      <hr style={{ margin: "30px 0" }} />

      <section>
        <h3>Sold Items</h3>
        {soldItems.length > 0 ? (
          soldItems.map(item => renderItemCard(item))
        ) : (
          !error && <p>You have not sold any items yet.</p>
        )}
      </section>
    </div>
  );
};

export default MyInventoryPage;