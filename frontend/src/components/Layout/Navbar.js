import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Navbar.css';

const navClass = ({ isActive }) => `navbar-item${isActive ? ' is-active' : ''}`;

const Navbar = () => {
  const { currentUser, logout, isAuthenticated, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-mark" aria-hidden="true">W</span>
          <span>WebShop</span>
        </Link>
        {loadingAuth ? (
          <span className="navbar-item navbar-muted">Loading...</span>
        ) : (
          <nav className="navbar-links" aria-label="Shop">
            <NavLink to="/" end className={navClass}>Browse</NavLink>
            {isAuthenticated && (
              <NavLink to="/add-item" className={navClass}>Add Item</NavLink>
            )}
            <div className="navbar-account">
              {isAuthenticated ? (
                <>
                  <span className="navbar-greeting">Hello, {currentUser?.username || 'User'}!</span>
                  <NavLink to="/myitems" className={navClass}>My Items</NavLink>
                  <NavLink to="/my-purchases" className={navClass}>My Purchases</NavLink>
                  <NavLink to="/cart" className={navClass}>Cart</NavLink>
                  <NavLink to="/account" className={navClass}>My Account</NavLink>
                  <button type="button" onClick={handleLogout} className="navbar-logout">Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navClass}>Login</NavLink>
                  <NavLink to="/signup" className={({ isActive }) => `navbar-item navbar-signup${isActive ? ' is-active' : ''}`}>Sign Up</NavLink>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
