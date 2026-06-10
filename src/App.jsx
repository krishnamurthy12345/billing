// src/App.jsx
import React, { useState, useEffect } from "react";
import "./App.css";
import { loadData, saveData, initialData } from "./data/db";
import WholesaleInvoiceModal from "./components/WholesaleInvoiceModal";
import ProductModal from "./components/ProductModal";
import StockAlert from "./components/StockAlert";
import EnhancedWholesaleInvoiceModal from "./components/EnhancedWholesaleInvoiceModal";
import InvoiceModal from "./components/InvoiceModal";
import QuickCustomerModal from "./components/QuickCustomerModal";

function App() {
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    saveData(data);
  }, [data]);

  const categories = [
    { name: "All", icon: "📦" },
    { name: "Grocery", icon: "🛒" },
    { name: "Vegetables", icon: "🥦" },
    { name: "Makeup", icon: "💄" },
    { name: "Clothing", icon: "👕" },
    { name: "Market Properties", icon: "🏪" }
  ];

  const filteredInvoices = data.invoices.filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = data.products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      product.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: data.invoices.reduce((sum, inv) => sum + inv.total, 0),
    pending: data.invoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.total, 0),
    paid: data.invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0),
    overdue: data.invoices
      .filter((inv) => inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.total, 0),
    count: data.invoices.length,
    totalProducts: data.products.length,
    lowStock: data.products.filter((p) => p.stock <= p.minStock).length
  };

  const handleAddCustomer = (customer) => {
    setData((prev) => ({
      ...prev,
      clients: [...prev.clients, customer]
    }));
    return customer;
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm("Delete this invoice?")) {
      setData((prev) => ({
        ...prev,
        invoices: prev.invoices.filter((inv) => inv.id !== id)
      }));
    }
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Delete this product?")) {
      setData((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id)
      }));
    }
  };

  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      setData((prev) => ({
        ...prev,
        invoices: prev.invoices.map((inv) =>
          inv.id === editingInvoice.id ? { ...invoiceData, id: inv.id } : inv
        )
      }));
    } else {
      const newId = data.nextInvoiceId;
      const newInvoice = { ...invoiceData, id: newId };
      const nextNum = parseInt(newId.split("-")[1]) + 1;
      const nextId = `INV-${String(nextNum).padStart(3, "0")}`;
      setData((prev) => ({
        ...prev,
        invoices: [newInvoice, ...prev.invoices],
        nextInvoiceId: nextId
      }));

      // Update stock
      invoiceData.items.forEach((item) => {
        const product = data.products.find((p) => p.id === item.productId);
        if (product) {
          const updatedProduct = {
            ...product,
            stock: product.stock - item.quantity
          };
          setData((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p.id === item.productId ? updatedProduct : p
            )
          }));
        }
      });
    }
    setIsInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === editingProduct.id ? { ...productData, id: p.id } : p
        )
      }));
    } else {
      const newId = data.nextProductId;
      const newProduct = { ...productData, id: newId };
      const nextNum = parseInt(newId.split("-")[1]) + 1;
      const nextId = `PRD-${String(nextNum).padStart(3, "0")}`;
      setData((prev) => ({
        ...prev,
        products: [...prev.products, newProduct],
        nextProductId: nextId
      }));
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const ProductsView = () => (
    <div>
      <StockAlert products={data.products} />
      <div className="action-bar">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`filter-btn ${
                categoryFilter === cat.name.toLowerCase() ? "active" : ""
              }`}
              onClick={() => setCategoryFilter(cat.name.toLowerCase())}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
        >
          ➕ Add Product
        </button>
      </div>
      <div className="table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Wholesale Price</th>
              <th>Retail Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  <strong>{product.name}</strong>
                  <br />
                  <small>{product.unit}</small>
                </td>
                <td>
                  {product.category}
                  <br />
                  <small>{product.subCategory}</small>
                </td>
                <td>{product.brand}</td>
                <td>₹{product.wholesalePrice.toFixed(2)}</td>
                <td>₹{product.retailPrice.toFixed(2)}</td>
                <td
                  className={
                    product.stock <= product.minStock ? "low-stock" : ""
                  }
                >
                  {product.stock} {product.unit}
                </td>
                <td>
                  <span
                    className={`status-badge ${product.stock <= product.minStock ? "status-low" : "status-paid"}`}
                  >
                    {product.stock <= product.minStock
                      ? "Low Stock"
                      : "In Stock"}
                  </span>
                </td>
                <td className="action-icons">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsProductModalOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InvoicesView = () => (
    <>
      <div className="action-bar">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by client or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingInvoice(null);
            setIsInvoiceModalOpen(true);
          }}
        >
          ➕ New Wholesale Invoice
        </button>
      </div>
      <div className="table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <strong>{inv.id}</strong>
                </td>
                <td>{inv.clientName}</td>
                <td>{inv.date}</td>
                <td>{inv.dueDate}</td>
                <td>₹{inv.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${inv.status}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="action-icons">
                  <button
                    onClick={() => {
                      setEditingInvoice(inv);
                      setIsInvoiceModalOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteInvoice(inv.id)}>
                    🗑️
                  </button>
                  <button
                    onClick={() => alert(JSON.stringify(inv.items, null, 2))}
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <h1>WholesaleBilling Pro</h1>
        </div>
        <div className="nav-buttons">
          <button
            className={`nav-btn ${activeTab === "invoices" ? "active" : ""}`}
            onClick={() => setActiveTab("invoices")}
          >
            Invoices ({stats.count})
          </button>
          <button
            className={`nav-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products ({stats.totalProducts})
          </button>
          <button
            className={`nav-btn ${activeTab === "clients" ? "active" : ""}`}
            onClick={() => setActiveTab("clients")}
          >
            Clients ({data.clients.length})
          </button>
          <button
            className="nav-btn admin-btn"
            onClick={() => window.open("/admin", "_blank")}
          >
            👑 Admin
          </button>
        </div>
      </header>

      <main className="main-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div>
              <h3>TOTAL REVENUE</h3>
              <div className="stat-value">₹{stats.total.toFixed(2)}</div>
            </div>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-card">
            <div>
              <h3>PENDING</h3>
              <div className="stat-value">₹{stats.pending.toFixed(2)}</div>
            </div>
            <span className="stat-icon">⏳</span>
          </div>
          <div className="stat-card">
            <div>
              <h3>LOW STOCK</h3>
              <div className="stat-value">{stats.lowStock}</div>
            </div>
            <span className="stat-icon">⚠️</span>
          </div>
          <div className="stat-card">
            <div>
              <h3>TOTAL PRODUCTS</h3>
              <div className="stat-value">{stats.totalProducts}</div>
            </div>
            <span className="stat-icon">📦</span>
          </div>
        </div>

        {activeTab === "invoices" && <InvoicesView />}
        {activeTab === "products" && <ProductsView />}
        {activeTab === "clients" && (
          <div className="table-container">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Business Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>GSTIN</th>
                  <th>Total Purchases</th>
                </tr>
              </thead>
              <tbody>
                {data.clients.map((client) => {
                  const clientTotal = data.invoices
                    .filter((inv) => inv.clientName === client.name)
                    .reduce((sum, inv) => sum + inv.total, 0);
                  return (
                    <tr key={client.id}>
                      <td>#{client.id}</td>
                      <td>
                        <strong>{client.businessName}</strong>
                        <br />
                        <small>{client.name}</small>
                      </td>
                      <td>{client.contactPerson}</td>
                      <td>{client.email}</td>
                      <td>{client.phone}</td>
                      <td>{client.gstin}</td>
                      <td>₹{clientTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isInvoiceModalOpen && (
        <EnhancedWholesaleInvoiceModal
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setEditingInvoice(null);
          }}
          onSave={handleSaveInvoice}
          initialData={editingInvoice}
          clients={data.clients}
          products={data.products}
          onAddCustomer={handleAddCustomer}
        />
      )}

      {isProductModalOpen && (
        <ProductModal
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          initialData={editingProduct}
          categories={[
            "Grocery",
            "Vegetables",
            "Makeup",
            "Clothing",
            "Market Properties"
          ]}
        />
      )}
    </div>
  );
}

export default App;
