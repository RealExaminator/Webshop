import React from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
  if (!message) return null;
  // Add styling for .notification .info .success .error in App.css or index.css
  return (
    <div className={`notification ${type}`}>
      {message}
      {onClose && <button onClick={onClose} style={{marginLeft: '10px', border: 'none', background: 'transparent', cursor: 'pointer'}}>X</button>}
    </div>
  );
};

export default Notification;