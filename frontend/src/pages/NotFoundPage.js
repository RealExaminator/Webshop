import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="empty-state">
      <p className="empty-kicker">404</p>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="ui-button">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;