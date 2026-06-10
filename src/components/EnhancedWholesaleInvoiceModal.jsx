// src/components/EnhancedWholesaleInvoiceModal.jsx
import React, { useState, useEffect } from "react";
import QuickCustomerModal from "./QuickCustomerModal";

const EnhancedWholesaleInvoiceModal = ({
  onClose,
  onSave,
  initialData,
  clients,
  products,
  onAddCustomer
}) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "pending",
    paymentTerms: "cash",
    discount: 0,
    shippingCharge: 0,
    items: [],
    notes: "",
    paymentMode: "cash",
    invoiceType: "retail"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [isWalkinCustomer, setIsWalkinCustomer] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const due = new Date();
      due.setDate(due.getDate() + (formData.paymentTerms === "cash" ? 0 : 15));
      setFormData((prev) => ({
        ...prev,
        dueDate: due.toISOString().split("T")[0]
      }));
    }
  }, [initialData, formData.paymentTerms]);

  const handleCustomerSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId === "new") {
      setShowNewCustomer(true);
    } else if (selectedId === "walkin") {
      setIsWalkinCustomer(true);
      setFormData({
        ...formData,
        clientName: "Walk-in Customer",
        clientId: "walkin"
      });
    } else {
      const selectedClient = clients.find(
        (c) => c.id.toString() === selectedId
      );
      if (selectedClient) {
        setIsWalkinCustomer(false);
        setFormData({
          ...formData,
          clientName: selectedClient.name,
          clientId: selectedClient.id
        });
      }
    }
  };

  const handleNewCustomerSave = (customer) => {
    onAddCustomer(customer);
    setFormData({
      ...formData,
      clientName: customer.name,
      clientId: customer.id
    });
    setShowNewCustomer(false);
    setIsWalkinCustomer(customer.isWalkin);
  };

  const addProductToBill = (product) => {
    const retailPrice = product.retailPrice;
    const wholesalePrice = product.wholesalePrice;
    const selectedPrice = formData.invoiceType === "wholesale" ? wholesalePrice : retailPrice;
    
    // Calculate discount if any (you can set a default discount percentage per product)
    const discountPercent = product.discountPercent || 0;
    const discountAmount = (selectedPrice * discountPercent) / 100;
    const finalPrice = selectedPrice - discountAmount;
    
    const existingItem = formData.items.find(
      (item) => item.productId === product.id
    );
    
    if (existingItem) {
      updateItem(
        formData.items.indexOf(existingItem),
        "quantity",
        existingItem.quantity + 1
      );
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            originalPrice: selectedPrice,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
            unitPrice: finalPrice,
            unit: product.unit,
            gst: product.gst,
            total: finalPrice,
            gstAmount: (finalPrice * product.gst) / 100
          }
        ]
      });
    }
    setSearchTerm("");
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === "quantity") {
      const qty = parseFloat(value) || 0;
      newItems[index].quantity = qty;
      newItems[index].total = newItems[index].unitPrice * qty;
      newItems[index].gstAmount = (newItems[index].total * newItems[index].gst) / 100;
    } else if (field === "discountPercent") {
      const discountPercent = parseFloat(value) || 0;
      newItems[index].discountPercent = discountPercent;
      newItems[index].discountAmount = (newItems[index].originalPrice * discountPercent) / 100;
      newItems[index].unitPrice = newItems[index].originalPrice - newItems[index].discountAmount;
      newItems[index].total = newItems[index].unitPrice * newItems[index].quantity;
      newItems[index].gstAmount = (newItems[index].total * newItems[index].gst) / 100;
    }
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTotalGST = () => {
    return formData.items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
  };

  const calculateTotalSavings = () => {
    return formData.items.reduce((sum, item) => {
      const originalTotal = item.originalPrice * item.quantity;
      const discountedTotal = item.unitPrice * item.quantity;
      return sum + (originalTotal - discountedTotal);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const totalGST = calculateTotalGST();
    return subtotal + totalGST + formData.shippingCharge;
  };

  const calculateOriginalTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Please add at least one product to the invoice");
      return;
    }

    const invoiceToSave = {
      ...formData,
      subtotal: calculateSubtotal(),
      totalGST: calculateTotalGST(),
      total: calculateTotal(),
      originalTotal: calculateOriginalTotal(),
      totalSavings: calculateTotalSavings(),
      items: formData.items,
      customerType: isWalkinCustomer ? "walkin" : "registered",
      invoiceNumber: `INV-${Date.now()}`
    };
    onSave(invoiceToSave);
  };

  const printInvoice = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${formData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; margin-top: 20px; font-size: 1.2em; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.9em; }
            .savings { color: green; font-weight: bold; }
            .original-price { text-decoration: line-through; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Wholesale Billing Pro</h2>
            <p>GSTIN: 27AAAAA1234B1Z</p>
          </div>
          <div class="invoice-details">
            <p><strong>Invoice No:</strong> ${formData.invoiceNumber}</p>
            <p><strong>Date:</strong> ${formData.date}</p>
            <p><strong>Customer:</strong> ${formData.clientName}</p>
            <p><strong>Payment Mode:</strong> ${formData.paymentMode}</p>
            <p><strong>Invoice Type:</strong> ${formData.invoiceType.toUpperCase()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Original Price</th>
                <th>Discount</th>
                <th>Unit Price</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${formData.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td class="original-price">₹${item.originalPrice.toFixed(2)}</td>
                  <td>${item.discountPercent}% (₹${item.discountAmount.toFixed(2)})</td>
                  <td>₹${item.unitPrice.toFixed(2)}</td>
                  <td>${item.gst}%</td>
                  <td>₹${(item.total + item.gstAmount).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            <p>Original Total: <span class="original-price">₹${calculateOriginalTotal().toFixed(2)}</span></p>
            <p>You Save: <span class="savings">₹${calculateTotalSavings().toFixed(2)}</span></p>
            <p>Subtotal: ₹${calculateSubtotal().toFixed(2)}</p>
            <p>GST: ₹${calculateTotalGST().toFixed(2)}</p>
            ${formData.shippingCharge > 0 ? `<p>Shipping: ₹${formData.shippingCharge.toFixed(2)}</p>` : ''}
            <p><strong>Grand Total: ₹${calculateTotal().toFixed(2)}</strong></p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer generated invoice</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (showNewCustomer) {
    return (
      <QuickCustomerModal
        onClose={() => setShowNewCustomer(false)}
        onSave={handleNewCustomerSave}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Invoice</h2>
          <button className="close-modal" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>

          {/* Customer */}
          <div className="customer-card">
            <h3>👤 Customer Information</h3>

            <select
              className="customer-select"
              value={formData.clientId}
              onChange={handleCustomerSelect}
              required
            >
              <option value="">Select Customer</option>
              <option value="walkin">🚶 Walk-in Customer</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName} - {c.name}
                </option>
              ))}
              <option value="new">➕ Add New Customer</option>
            </select>
          </div>

          {/* Product Search */}
          <div className="invoice-card">
            <h3>🔍 Add Products</h3>

            <div className="modern-search">
              <input
                type="text"
                placeholder="Search products, category or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && (
              <div className="product-dropdown">
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      className="product-item"
                      onClick={() => addProductToBill(product)}
                    >
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.category} - {product.brand}</small>
                      </div>
                      <div>
                        <span className="original-price">₹{formData.invoiceType === "wholesale" ? product.wholesalePrice : product.retailPrice}</span>
                        {product.discountPercent > 0 && (
                          <span className="discount-badge">-{product.discountPercent}%</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="invoice-card">
            <h3>🧾 Bill Items</h3>

            <div className="table-container">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Original Price</th>
                    <th>Discount %</th>
                    <th>Unit Price</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.productName}</strong>
                      </td>

                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          className="qty-input"
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                        />
                      </td>

                      <td>{item.unit}</td>

                      <td className="original-price-cell">
                        ₹{item.originalPrice.toFixed(2)}
                      </td>

                      <td>
                        <input
                          type="number"
                          value={item.discountPercent}
                          min="0"
                          max="100"
                          step="0.5"
                          className="discount-input"
                          onChange={(e) =>
                            updateItem(idx, "discountPercent", e.target.value)
                          }
                        />
                        <span className="discount-symbol">%</span>
                      </td>

                      <td>
                        <strong>₹{item.unitPrice.toFixed(2)}</strong>
                        {item.discountAmount > 0 && (
                          <small className="save-text">
                            (Save ₹{item.discountAmount.toFixed(2)})
                          </small>
                        )}
                      </td>

                      <td>{item.gst}%</td>

                      <td>
                        <strong>₹{(item.total + item.gstAmount).toFixed(2)}</strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => removeItem(idx)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Section */}
          <div className="invoice-top-grid">
            <div className="invoice-card">
              <h3>📋 Invoice Details</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Invoice Type</label>
                  <select
                    value={formData.invoiceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceType: e.target.value
                      })
                    }
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMode: e.target.value
                      })
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Invoice Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Shipping Charge (₹)</label>
                  <input
                    type="number"
                    value={formData.shippingCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingCharge: parseFloat(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h3>💰 Invoice Summary</h3>
              
              <div className="summary-row">
                <span>Original Total</span>
                <strong className="original-price">₹{calculateOriginalTotal().toFixed(2)}</strong>
              </div>

              <div className="summary-row savings">
                <span>You Save</span>
                <strong className="savings-amount">-₹{calculateTotalSavings().toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>Subtotal</span>
                <strong>₹{calculateSubtotal().toFixed(2)}</strong>
              </div>

              <div className="summary-row">
                <span>GST</span>
                <strong>+₹{calculateTotalGST().toFixed(2)}</strong>
              </div>

              {formData.shippingCharge > 0 && (
                <div className="summary-row">
                  <span>Shipping</span>
                  <strong>+₹{formData.shippingCharge.toFixed(2)}</strong>
                </div>
              )}

              <div className="grand-total">₹{calculateTotal().toFixed(2)}</div>
            </div>
          </div>

          

          {/* Footer */}
          <div className="action-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>
              ❌ Cancel
            </button>

            <button type="button" className="btn-print" onClick={printInvoice}>
              🖨️ Print Invoice
            </button>

            <button type="submit" className="btn-save">
              💾 Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedWholesaleInvoiceModal;