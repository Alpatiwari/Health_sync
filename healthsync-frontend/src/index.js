// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import './styles/globals.css';      // Global styles first
import './styles/components.css';   // Component styles
import './styles/charts.css';
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