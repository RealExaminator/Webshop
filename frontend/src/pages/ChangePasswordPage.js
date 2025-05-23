import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import useAuth from '../hooks/useAuth';
import Notification from '../components/UI/Notification';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!oldPassword || !newPassword) {
        setError("All password fields are required.");
        return;
    }

    setLoading(true);
    try {
      const response = await AuthService.changePassword(oldPassword, newPassword);
      setSuccess(response.data.detail || 'Password changed successfully! Please log in again.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 3000);
    } catch (err) {
      let errorMessage = 'Failed to change password.';
      if (err.response && err.response.data) {
        const backendError = err.response.data;
        if (backendError.detail) errorMessage = backendError.detail;
        else if (backendError.old_password) errorMessage = `Old Password: ${backendError.old_password.join(', ')}`;
        else if (backendError.new_password) errorMessage = `New Password: ${backendError.new_password.join(', ')}`;
        else {
            const firstKey = Object.keys(backendError)[0];
            if (firstKey && Array.isArray(backendError[firstKey])) {
                errorMessage = `${firstKey.replace("_", " ")}: ${backendError[firstKey].join(', ')}`;
            }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2>Change Password</h2>
      {error && <Notification message={error} type="error" onClose={() => setError('')} />}
      {success && <Notification message={success} type="success" onClose={() => setSuccess('')} />}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="oldPassword">Old Password:</label>
          <Input type="password" id="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required disabled={loading} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="newPassword">New Password:</label>
          <Input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirmNewPassword">Confirm New Password:</label>
          <Input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required disabled={loading} />
        </div>
        <Button type="submit" disabled={loading} className="ui-button" style={{ width: '100%' }}>
          {loading ? <LoadingSpinner /> : 'Change Password'}
        </Button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;