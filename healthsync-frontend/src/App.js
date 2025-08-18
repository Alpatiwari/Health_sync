// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page imports
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Component imports
import CorrelationInsights from './components/ai-insights/CorrelationInsights';
import PredictiveAnalysis from './components/ai-insights/PredictiveAnalysis';
import MicroMomentTrigger from './components/ai-insights/MicroMomentTrigger';

// Service imports
import apiService from './services/apiService';
import { healthDataService } from './services/HealthDataService';

// CSS imports in correct order
import './App.css';                    // Your existing App styles
import './styles/components.css';      // ADD THIS - Main component styles I created
import './styles/charts.css';  
import './styles/globals.css';        // Chart-specific styles
   // Integration-specific styles

const App = () => {
  const [user, setUser] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      // Initialize user session
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      if (userData) {
        // Load health data
        const data = await healthDataService.getHealthData(userData.id);
        setHealthData(data);

        // Load predictions
        const predictionData = await apiService.getPredictions(userData.id);
        setPredictions(predictionData);

        // Load correlations
        const correlationData = await apiService.getCorrelations(userData.id);
        setCorrelations(correlationData);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App bg-gray-50 min-h-screen">
        {/* Updated header using component CSS classes */}
        <header className="header">
          <div className="header-content">
            <div className="header-logo">
              <span className="header-logo-icon">🏥</span>
              HealthSync
              <span className="ml-2 text-sm text-gray-500">Predictive Health Intelligence</span>
            </div>
            <nav className="header-nav">
              <a href="/" className="header-nav-item">Dashboard</a>
              <a href="/analytics" className="header-nav-item">Analytics</a>
              <a href="/insights" className="header-nav-item">Insights</a>
              <a href="/correlations" className="header-nav-item">Correlations</a>
              <a href="/predictions" className="header-nav-item">Predictions</a>
              <a href="/moments" className="header-nav-item">Live Moments</a>
              <a href="/profile" className="header-nav-item">Profile</a>
              <a href="/settings" className="header-nav-item">Settings</a>
            </nav>
            <div className="header-actions">
              <div className="header-profile">
                <div className="header-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Main Dashboard Route */}
            <Route
              path="/"
              element={
                <Dashboard
                  healthData={healthData}
                  predictions={predictions}
                  correlations={correlations}
                  user={user}
                />
              }
            />
            
            {/* Analytics Page */}
            <Route
              path="/analytics"
              element={
                <Analytics
                  healthData={healthData}
                  user={user}
                />
              }
            />
            
            {/* AI Insights Routes */}
            <Route
              path="/insights"
              element={
                <Insights
                  correlations={correlations}
                  predictions={predictions}
                  healthData={healthData}
                  user={user}
                />
              }
            />
            
            <Route
              path="/correlations"
              element={
                <CorrelationInsights
                  correlations={correlations}
                  healthData={healthData}
                />
              }
            />
            
            <Route
              path="/predictions"
              element={
                <PredictiveAnalysis
                  predictions={predictions}
                  healthData={healthData}
                  user={user}
                />
              }
            />
            
            <Route
              path="/moments"
              element={
                <MicroMomentTrigger
                  user={user}
                  healthData={healthData}
                />
              }
            />
            
            {/* Profile and Settings */}
            <Route
              path="/profile"
              element={
                <Profile
                  user={user}
                  setUser={setUser}
                />
              }
            />
            
            <Route
              path="/settings"
              element={
                <Settings
                  user={user}
                  healthData={healthData}
                  onUpdateSettings={(newSettings) => {
                    // Handle settings update
                    console.log('Settings updated:', newSettings);
                  }}
                />
              }
            />
            
            {/* Login Route */}
            <Route
              path="/login"
              element={
                <Login
                  onLogin={(userData) => {
                    setUser(userData);
                    // Reinitialize app with new user data
                    initializeApp();
                  }}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;