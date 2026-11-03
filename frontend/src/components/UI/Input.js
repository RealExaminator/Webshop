import React from 'react';

const Input = ({ className = '', type = 'text', ...rest }) => {
  return (
    <input type={type} className={['ui-input', className].filter(Boolean).join(' ')} {...rest} />
  );
};

export default Input;
