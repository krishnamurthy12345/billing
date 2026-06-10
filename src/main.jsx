// src/main.jsx - Update to include admin route
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminApp from './AdminApp.jsx';
import './index.css';

// Simple routing based on URL path
const path = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (path === '/admin' || path === '/admin.html') {
  root.render(<AdminApp />);
} else {
  root.render(<App />);
}