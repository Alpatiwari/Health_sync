// src/App.js - Fixed version with AuthProvider integration
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ThreeDBackground from './components/common/ThreeDBackground';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LoadingSpinner from './components/common/LoadingSpinner';
import api from './services/api';
import { healthDataService } from './services/HealthDataService';
import './styles/globals.css';
import './styles/components.css';
import './styles/charts.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App Content (inside AuthProvider)
const AppContent = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // App state
  const [healthData, setHealthData] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('healthsync-darkmode');
    return savedMode ? JSON.parse(savedMode) : 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Initialize app data when user is authenticated
  useEffect(() => {
    const initializeAppData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load user's health data
        const [data, predictionData, correlationData] = await Promise.allSettled([
          healthDataService?.getHealthData?.(user.id) || Promise.resolve([]),
          api.getPredictions?.(user.id) || Promise.resolve({}),
          api.getCorrelations?.(user.id) || Promise.resolve([])
        ]);

        // Handle results (even if some fail)
        setHealthData(data.status === 'fulfilled' ? data.value : []);
        setPredictions(predictionData.status === 'fulfilled' ? predictionData.value : {});
        setCorrelations(correlationData.status === 'fulfilled' ? correlationData.value : []);
        
      } catch (error) {
        console.error('Failed to initialize app data:', error);
        // Don't show error to user, just log it
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && !authLoading) {
      initializeAppData();
    }
  }, [isAuthenticated, user, authLoading]);

  // Apply dark mode class to HTML element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('healthsync-darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Create a stable reference for initializeAppData using useCallback
  const refreshAppData = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load user's health data
      const [data, predictionData, correlationData] = await Promise.allSettled([
        healthDataService?.getHealthData?.(user.id) || Promise.resolve([]),
        api.getPredictions?.(user.id) || Promise.resolve({}),
        api.getCorrelations?.(user.id) || Promise.resolve([])
      ]);

      // Handle results (even if some fail)
      setHealthData(data.status === 'fulfilled' ? data.value : []);
      setPredictions(predictionData.status === 'fulfilled' ? predictionData.value : {});
      setCorrelations(correlationData.status === 'fulfilled' ? correlationData.value : []);
      
    } catch (error) {
      console.error('Failed to initialize app data:', error);
      // Don't show error to user, just log it
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Show loading spinner during auth initialization
  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="large" text="Initializing HealthSync..." />
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <ThreeDBackground />
      
      <Routes>
        {/* Public route - Login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login darkMode={darkMode} />
          } 
        />
        
        {/* Protected routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <>
              <Header
                user={user}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
              />
              
              <div className="main-content">
                <Sidebar darkMode={darkMode} />
                
                <main className="content-area">
                  {loading && (
                    <div className="fixed top-20 right-4 z-50">
                      <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg">
                        Loading data...
                      </div>
                    </div>
                  )}
                  
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    <Route path="/dashboard" element={
                      <Dashboard
                        healthData={healthData}
                        predictions={predictions}
                        correlations={correlations}
                        user={user}
                        darkMode={darkMode}
                      />
                    } />
                    
                    <Route path="/analytics" element={
                      <Analytics
                        healthData={healthData}
                        user={user}
                        darkMode={darkMode}
                      />
                    } />
                    
                    <Route path="/insights" element={
                      <Insights
                        correlations={correlations}
                        predictions={predictions}
                        healthData={healthData}
                        user={user}
                        darkMode={darkMode}
                      />
                    } />
                    
                    <Route path="/profile" element={
                      <Profile
                        user={user}
                        darkMode={darkMode}
                        onUserUpdate={refreshAppData}
                      />
                    } />
                    
                    <Route path="/settings" element={
                      <Settings
                        user={user}
                        healthData={healthData}
                        darkMode={darkMode}
                        onToggleDarkMode={toggleDarkMode}
                      />
                    } />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

// Main App Component with AuthProvider wrapper
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;