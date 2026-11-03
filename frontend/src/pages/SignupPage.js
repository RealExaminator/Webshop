import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Notification from '../components/UI/Notification';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth(); // Assuming signup is just for registration, not login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await signup(username, email, password);
      setSuccess('Registration successful! Please log in.');
      setUsername('');
      setEmail('');
      setPassword('');
      setTimeout(() => {
        if (!error) navigate('/login'); // Navigate only if no error during success timeout
      } , 2000);
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (typeof errors === 'string') {
            errorMessage = errors;
        } else if (errors.username) {
            errorMessage = `Username: ${errors.username.join(', ')}`;
        } else if (errors.email) {
            errorMessage = `Email: ${errors.email.join(', ')}`;
        } else if (errors.password) {
            errorMessage = `Password: ${errors.password.join(', ')}`;
        } else if (errors.detail) {
            errorMessage = errors.detail;
        }
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Sign Up</h2>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      {success && <Notification message={success} type="success" onClose={() => setSuccess('')} />}
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
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            className="ui-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p className="form-note">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignupPage;