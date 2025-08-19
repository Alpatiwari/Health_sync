// src/components/common/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiActivity,
  FiTrendingUp,
  FiUser,
  FiSettings,
  FiBell,
  FiHeart,
  FiClock
} from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome size={20} /> },
    { name: 'Activity', path: '/activity', icon: <FiActivity size={20} /> },
    { name: 'Trends', path: '/trends', icon: <FiTrendingUp size={20} /> },
    { name: 'Micro Moments', path: '/moments', icon: <FiClock size={20} /> },
    { name: 'Health', path: '/health', icon: <FiHeart size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <FiBell size={20} /> },
    { name: 'Profile', path: '/profile', icon: <FiUser size={20} /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Navigation</h3>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;