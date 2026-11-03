import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>© {new Date().getFullYear()} WebShop</p>
      </div>
    </footer>
  );
};

export default Footer;
