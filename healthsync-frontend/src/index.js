// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { HealthDataProvider } from './context/HealthDataContext';
import { NotificationProvider } from './context/NotificationContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <HealthDataProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </HealthDataProvider>
    </AuthProvider>
  </React.StrictMode>
);