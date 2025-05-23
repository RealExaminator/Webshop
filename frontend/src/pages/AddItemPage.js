// frontend/src/pages/AddItemPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemService from '../services/item.service';
import Notification from '../components/UI/Notification';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button'; // Assuming you have a Button component
import Input from '../components/UI/Input';   // Assuming you have an Input component

const AddItemPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      setError("Price must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      await ItemService.createItem({ title, description, price: itemPrice });
      setSuccess('Item added successfully! You can view it in your inventory.');
      setTitle('');
      setDescription('');
      setPrice('');
      // setTimeout(() => navigate('/my-inventory'), 2000); // Optional redirect
    } catch (err) {
      let errorMessage = 'Failed to add item.';
      if (err.response && err.response.data) {
        const backendError = err.response.data;
        if (typeof backendError === 'string') errorMessage = backendError;
        else if (backendError.detail) errorMessage = backendError.detail;
        else if (backendError.title) errorMessage = `Title: ${backendError.title.join(', ')}`;
        else if (backendError.price) errorMessage = `Price: ${backendError.price.join(', ')}`;
        // Add more specific error checks if needed
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2>Add New Item for Sale</h2>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      {success && <Notification message={success} type="success" onClose={() => setSuccess('')} />}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title">Title:</label>
          <Input // Using your UI component
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            className="ui-input" // Assuming ui-input class works for textarea too or create separate styling
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
            disabled={loading}
            style={{width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem'}}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="price">Price ($):</label>
          <Input // Using your UI component
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0.01"
            step="0.01"
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading} className="ui-button" style={{ width: '100%' }}>
          {loading ? <LoadingSpinner /> : 'Add Item'}
        </Button>
      </form>
    </div>
  );
};

export default AddItemPage;