// src/AdminApp.jsx - Separate admin app
import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { loadData } from './data/db';
import './Admin.css';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Check if already logged in
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      const auth = JSON.parse(adminAuth);
      // Check if login is less than 24 hours old
      const loginTime = new Date(auth.loginTime);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminAuth');
      }
    }
    
    // Load data
    const loadedData = loadData();
    setData(loadedData);
  }, []);

  const handleLogin = (authStatus) => {
    setIsAuthenticated(authStatus);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard data={data} onLogout={handleLogout} />;
};

export default AdminApp;