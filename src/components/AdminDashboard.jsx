// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = ({ data, onLogout }) => {
  const [dateRange, setDateRange] = useState('month');
  const [selectedView, setSelectedView] = useState('overview');

  // Calculate statistics
  const calculateStats = () => {
    const totalRevenue = data.invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalInvoices = data.invoices.length;
    const totalProducts = data.products.length;
    const totalCustomers = data.clients.length;
    const pendingAmount = data.invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const lowStockProducts = data.products.filter(p => p.stock <= p.minStock).length;
    
    // Category wise sales
    const categorySales = {};
    data.invoices.forEach(inv => {
      inv.items.forEach(item => {
        const product = data.products.find(p => p.id === item.productId);
        if (product) {
          if (!categorySales[product.category]) {
            categorySales[product.category] = 0;
          }
          categorySales[product.category] += item.total;
        }
      });
    });

    // Monthly sales data
    const monthlySales = {};
    data.invoices.forEach(inv => {
      const month = inv.date.substring(0, 7);
      if (!monthlySales[month]) {
        monthlySales[month] = 0;
      }
      monthlySales[month] += inv.total;
    });

    // Payment mode distribution
    const paymentModes = {};
    data.invoices.forEach(inv => {
      const mode = inv.paymentMode || 'cash';
      if (!paymentModes[mode]) {
        paymentModes[mode] = 0;
      }
      paymentModes[mode] += inv.total;
    });

    // Top products
    const productSales = {};
    data.invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = 0;
        }
        productSales[item.productName] += item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Top customers
    const customerSales = {};
    data.invoices.forEach(inv => {
      if (!customerSales[inv.clientName]) {
        customerSales[inv.clientName] = 0;
      }
      customerSales[inv.clientName] += inv.total;
    });

    const topCustomers = Object.entries(customerSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalRevenue,
      totalInvoices,
      totalProducts,
      totalCustomers,
      pendingAmount,
      lowStockProducts,
      categorySales,
      monthlySales,
      paymentModes,
      topProducts,
      topCustomers
    };
  };

  const stats = calculateStats();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const OverviewDashboard = () => (
    <div>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <div className="stat-value">₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>Total Invoices</h3>
            <div className="stat-value">{stats.totalInvoices}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Products</h3>
            <div className="stat-value">{stats.totalProducts}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Customers</h3>
            <div className="stat-value">{stats.totalCustomers}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pending Amount</h3>
            <div className="stat-value">₹{stats.pendingAmount.toFixed(2)}</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock Items</h3>
            <div className="stat-value">{stats.lowStockProducts}</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={Object.entries(stats.monthlySales).map(([month, sales]) => ({ month, sales }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Category-wise Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats.categorySales).map(([category, amount]) => ({ name: category, value: amount }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(stats.categorySales).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Payment Mode Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.paymentModes).map(([mode, amount]) => ({ mode, amount }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mode" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const ProductsReport = () => (
    <div>
      <h3>Product Inventory Report</h3>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Wholesale Price</th>
              <th>Retail Price</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td className={product.stock <= product.minStock ? 'low-stock' : ''}>
                  {product.stock} {product.unit}
                </td>
                <td>{product.minStock}</td>
                <td>
                  <span className={`status-badge ${product.stock <= product.minStock ? 'status-low' : 'status-paid'}`}>
                    {product.stock <= product.minStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td>₹{product.wholesalePrice}</td>
                <td>₹{product.retailPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SalesReport = () => (
    <div>
      <h3>Sales Report</h3>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment Mode</th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.clientName}</td>
                <td>{invoice.date}</td>
                <td>{invoice.items.length}</td>
                <td>₹{invoice.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${invoice.status}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>{invoice.paymentMode || 'cash'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CustomerReport = () => (
    <div>
      <h3>Customer Report</h3>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Business Name</th>
              <th>Contact</th>
              <th>Total Purchases</th>
              <th>Invoice Count</th>
              <th>Last Purchase</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map(client => {
              const clientInvoices = data.invoices.filter(inv => inv.clientName === client.name);
              const totalPurchases = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
              const lastPurchase = clientInvoices.length > 0 
                ? clientInvoices.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date 
                : 'No purchases';
              
              return (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.businessName}</td>
                  <td>{client.phone}</td>
                  <td>₹{totalPurchases.toFixed(2)}</td>
                  <td>{clientInvoices.length}</td>
                  <td>{lastPurchase}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TopProducts = () => (
    <div className="top-items-list">
      <h3>Top Selling Products</h3>
      {stats.topProducts.map(([product, quantity], index) => (
        <div key={index} className="top-item">
          <span className="rank">{index + 1}</span>
          <span className="name">{product}</span>
          <span className="quantity">{quantity} units sold</span>
        </div>
      ))}
    </div>
  );

  const TopCustomers = () => (
    <div className="top-items-list">
      <h3>Top Customers</h3>
      {stats.topCustomers.map(([customer, amount], index) => (
        <div key={index} className="top-item">
          <span className="rank">{index + 1}</span>
          <span className="name">{customer}</span>
          <span className="amount">₹{amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </div>

      <div className="admin-nav">
        <button 
          className={`admin-nav-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </button>
        <button 
          className={`admin-nav-btn ${selectedView === 'products' ? 'active' : ''}`}
          onClick={() => setSelectedView('products')}
        >
          Products Report
        </button>
        <button 
          className={`admin-nav-btn ${selectedView === 'sales' ? 'active' : ''}`}
          onClick={() => setSelectedView('sales')}
        >
          Sales Report
        </button>
        <button 
          className={`admin-nav-btn ${selectedView === 'customers' ? 'active' : ''}`}
          onClick={() => setSelectedView('customers')}
        >
          Customers Report
        </button>
      </div>

      <div className="admin-content">
        {selectedView === 'overview' && (
          <div className="admin-grid-2col">
            <OverviewDashboard />
            <div>
              <TopProducts />
              <TopCustomers />
            </div>
          </div>
        )}
        {selectedView === 'products' && <ProductsReport />}
        {selectedView === 'sales' && <SalesReport />}
        {selectedView === 'customers' && <CustomerReport />}
      </div>
    </div>
  );
};

export default AdminDashboard;