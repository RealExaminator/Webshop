import React from 'react';

const LoadingSpinner = ({ inline = false }) => {
  return (
    <div
      className={inline ? 'spinner spinner--inline' : 'spinner'}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
