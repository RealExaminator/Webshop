import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button type={type} onClick={onClick} className={`ui-button ${className}`}>
      {children}
    </button>
  );
};
// Add some basic styling in App.css or index.css for .ui-button
export default Button;