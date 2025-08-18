// src/components/common/Header.js
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, markAsRead } = useContext(NotificationContext);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">HealthSync</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5L15 11V9a6 6 0 10-12 0v2L1.5 13.5 5 17h5m5 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.avatar || 'https://via.placeholder.com/32'}
                  alt="Profile"
                />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;