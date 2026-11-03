import React from 'react';

const Notification = ({ message, type = 'info', onClose, className = '', style }) => {
  if (!message) return null;
  return (
    <div className={['notification', type, className].filter(Boolean).join(' ')} style={style}>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="notification-close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
};

export default Notification;
