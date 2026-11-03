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
    <div className="page">
      <header className="page-header">
        <h1>Items for Sale</h1>
      </header>
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <Input
          type="text"
          placeholder="Search items by title..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          aria-label="Search items by title"
        />
        <Button type="submit">Search</Button>
        {currentQuery && (
          <Button type="button" onClick={handleClearSearch} className="ui-button--muted">
            Clear
          </Button>
        )}
      </form>

      {error && <Notification message={error} type="error" onClose={() => setError('')} />}

      {loading ? (
        <LoadingSpinner />
      ) : items.length > 0 ? (
        <>
          {currentQuery && <p className="search-summary">Showing results for: "<strong>{currentQuery}</strong>"</p>}
          <ItemList items={items} />
        </>
      ) : (
        currentQuery ? (
          <div className="empty-state">
            <p>No items found matching "<strong>{currentQuery}</strong>".</p>
            <Button type="button" onClick={handleClearSearch}>Show all items</Button>
          </div>
        ) : (
          !error && (
            <div className="empty-state">
              <p>No items currently for sale.</p>
            </div>
          )
        )
      )}
    </div>
  );
};

export default HomePage;