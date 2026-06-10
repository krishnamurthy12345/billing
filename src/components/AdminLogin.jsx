// src/components/AdminLogin.jsx
import React, { useState } from 'react';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default admin credentials (you can change these)
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('adminAuth', JSON.stringify({
        isAuthenticated: true,
        username: credentials.username,
        loginTime: new Date().toISOString()
      }));
      onLogin(true);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <span className="login-icon">🔐</span>
          <h2>Admin Login</h2>
          <p>Wholesale Billing System</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={credentials.username} 
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={credentials.password} 
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary btn-block">Login</button>
        </form>
        <div className="login-footer">
          <small>Default: admin / admin123</small>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;