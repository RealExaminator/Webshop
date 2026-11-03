import React from 'react';

const Button = ({ children, className = '', type = 'button', ...rest }) => {
  return (
    <button type={type} className={['ui-button', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  );
};

export default Button;
