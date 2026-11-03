import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Notification from '../components/UI/Notification';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loadingAuth } = useAuth();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // Navigation will be handled by the useEffect above after isAuthenticated updates
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth && !isAuthenticated) {
    return (
      <div className="page-loading">
        Checking authentication...
      </div>
    );
  }
  // If already authenticated, useEffect will redirect, so this part might not be seen or briefly.
  // Or, we can add an explicit check: if (isAuthenticated) return null; (or redirect immediately)

  return (
    <div className="form-card">
      <h2>Login</h2>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            className="ui-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            className="ui-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="ui-button ui-button--block" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="form-note">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginPage;