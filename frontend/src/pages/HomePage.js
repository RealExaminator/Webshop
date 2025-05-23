import React, { useState, useEffect, useCallback } from 'react';
import ItemList from '../components/Items/ItemList';
import ItemService from '../services/item.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Notification from '../components/UI/Notification';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');

  const fetchItems = useCallback(async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const response = query
        ? await ItemService.searchItems(query)
        : await ItemService.getAllOnSaleItems();
      setItems(response.data);
      setCurrentQuery(query);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch items.';
      setError(errorMessage);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchItems('');
  };

  return (
    <div>
      <h1>Items for Sale</h1>
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
        <Input
          type="text"
          placeholder="Search items by title..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          style={{ flexGrow: 1 }}
        />
        <Button type="submit" className="ui-button">Search</Button>
        {currentQuery && (
          <Button type="button" onClick={handleClearSearch} className="ui-button" style={{backgroundColor: '#6c757d'}}>
            Clear
          </Button>
        )}
      </form>

      {error && <Notification message={error} type="error" onClose={() => setError('')} />}

      {loading ? (
        <LoadingSpinner />
      ) : items.length > 0 ? (
        <>
          {currentQuery && <p>Showing results for: "<strong>{currentQuery}</strong>"</p>}
          <ItemList items={items} />
        </>
      ) : (
        currentQuery ? (
          <p>No items found matching "<strong>{currentQuery}</strong>". <Button type="button" onClick={handleClearSearch} className="ui-button">Show all items</Button></p>
        ) : (
          !error && <p>No items currently for sale.</p>
        )
      )}
    </div>
  );
};

export default HomePage;