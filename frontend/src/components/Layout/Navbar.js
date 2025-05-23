import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loadingAuth) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-item navbar-logo">WebShop</Link>
            </div>
            <div className="navbar-menu">
                <div className="navbar-end"><span className="navbar-item">Loading...</span></div>
            </div>
        </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item navbar-logo">WebShop</Link>
      </div>
      <div className="navbar-menu">
        <div className="navbar-start">
            <span className="navbar-item">Hello, {currentUser?.username || 'User'}!</span>
            {isAuthenticated && (
            <Link to="/add-item" className="navbar-item">Add Item</Link>
          )}
          <Link to="/" className="navbar-item">Browse</Link>

        </div>
        <div className="navbar-end">
          {isAuthenticated ? (
            <>

              <Link to="/myitems" className="navbar-item">My Items</Link>
              <Link to="/my-purchases" className="navbar-item">My Purchases</Link>
              <Link to="/cart" className="navbar-item">Cart</Link>
              <Link to="/account" className="navbar-item">My Account</Link>
              <button onClick={handleLogout} className="navbar-item button is-light">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/signup" className="navbar-item">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;