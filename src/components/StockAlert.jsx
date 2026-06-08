// src/components/StockAlert.jsx
import React from 'react';

const StockAlert = ({ products }) => {
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  if (lowStockProducts.length === 0) return null;
  
  return (
    <div className="stock-alert">
      <div className="alert-header">
        <span className="alert-icon">⚠️</span>
        <h3>Low Stock Alert</h3>
        <span className="alert-count">{lowStockProducts.length} products need attention</span>
      </div>
      <div className="alert-list">
        {lowStockProducts.map(product => (
          <div key={product.id} className="alert-item">
            <span>{product.name}</span>
            <span>Stock: {product.stock} {product.unit}</span>
            <span className="alert-min">Min: {product.minStock}</span>
            <button className="btn-small">Restock</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockAlert;