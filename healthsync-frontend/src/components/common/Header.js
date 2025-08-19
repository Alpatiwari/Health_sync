// src/components/common/Header.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ user }) => {
  const { logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">⚕️</span>
          <span className="logo-text">HealthSync</span>
          <span className="logo-tagline">AI Health Intelligence</span>
        </Link>
        
        <nav className="header-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
          <Link to="/insights" className="nav-link">Insights</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </nav>
        
        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={logout} className="logout-button">
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;