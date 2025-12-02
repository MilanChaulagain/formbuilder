import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📋 FormBuilder
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            🏠 Home
          </Link>
          <Link to="/create" className={`nav-link ${isActive('/create')}`}>
            ➕ Create Form
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
