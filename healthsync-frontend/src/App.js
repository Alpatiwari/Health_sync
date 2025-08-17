// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CorrelationInsights from './components/ai-insights/CorrelationInsights';
import PredictiveAnalysis from './components/ai-insights/PredictiveAnalysis';
import MicroMomentTrigger from './components/ai-insights/MicroMomentTrigger';
import { apiService } from './services/apiService';
import { healthDataService } from './services/HealthDataService';
import './App.css';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-blue-600">Health</span>Sync
                </h1>
                <span className="ml-2 text-sm text-gray-500">Predictive Health Intelligence</span>
              </div>
              <nav className="flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2">Dashboard</a>
                <a href="/correlations" className="text-gray-700 hover:text-blue-600 px-3 py-2">Insights</a>
                <a href="/predictions" className="text-gray-700 hover:text-blue-600 px-3 py-2">Predictions</a>
                <a href="/moments" className="text-gray-700 hover:text-blue-600 px-3 py-2">Live Moments</a>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
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
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;