import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, name, className = '' }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      className={`ui-input ${className}`}
    />
  );
};
// Add some basic styling in App.css or index.css for .ui-input
export default Input;