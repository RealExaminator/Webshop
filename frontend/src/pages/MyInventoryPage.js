import React, { useState, useEffect, useCallback } from 'react';
import ItemService from '../services/item.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import ProductImage from '../components/Items/ProductImage';

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
    <article key={item.id} className="inventory-card">
      <div className="inventory-card-top">
        <ProductImage item={item} thumb />
        <div>
          <h4>{item.title}</h4>
          <p>Current Price: ${parseFloat(item.price).toFixed(2)}</p>
          <p>Status: <span className={`status-pill ${item.status === 'on-sale' ? 'status-pill--sale' : 'status-pill--sold'}`}>{item.status.replace('-', ' ')}</span></p>
          <p><small>Added: {new Date(item.date_added).toLocaleDateString()}</small></p>
        </div>
      </div>
      {item.status === 'sold' && item.buyer_username && (
        <p><small>Sold to: {item.buyer_username}</small></p>
      )}

      {item.status === 'on-sale' && (
        editItemId === item.id ? (
          <div className="price-editor">
            <h5>Edit Price</h5>
            {editError && <Notification message={editError} type="error" onClose={() => setEditError('')} />}
            <div className="price-editor-row">
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min="0.01"
                step="0.01"
                aria-label="New price"
              />
              <Button onClick={() => handleSavePrice(item.id)} className="ui-button--good">Save</Button>
              <Button onClick={handleCancelEdit} className="ui-button--muted">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => handleEditPriceClick(item)} className="ui-button--outline">
            Edit Price
          </Button>
        )
      )}
    </article>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <header className="page-header">
        <h2>My Inventory</h2>
      </header>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      {editSuccess && <Notification message={editSuccess} type="success" onClose={() => setEditSuccess('')} />}

      <section className="inventory-section">
        <h3>Items Currently For Sale</h3>
        {onSaleItems.length > 0 ? (
          <div className="inventory-list">
            {onSaleItems.map(item => renderItemCard(item))}
          </div>
        ) : (
          !error && (
            <div className="empty-state">
              <p>You have no items currently listed for sale.</p>
            </div>
          )
        )}
      </section>

      <hr className="section-rule" />

      <section className="inventory-section">
        <h3>Sold Items</h3>
        {soldItems.length > 0 ? (
          <div className="inventory-list">
            {soldItems.map(item => renderItemCard(item))}
          </div>
        ) : (
          !error && (
            <div className="empty-state">
              <p>You have not sold any items yet.</p>
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default MyInventoryPage;