import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="ui-button" style={{marginTop: '20px'}}>
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;