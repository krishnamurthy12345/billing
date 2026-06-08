// src/components/EnhancedWholesaleInvoiceModal.jsx
import React, { useState, useEffect } from 'react';
import QuickCustomerModal from './QuickCustomerModal';

const EnhancedWholesaleInvoiceModal = ({ onClose, onSave, initialData, clients, products, onAddCustomer }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'pending',
    paymentTerms: 'cash',
    discount: 0,
    shippingCharge: 0,
    items: [],
    notes: '',
    paymentMode: 'cash',
    invoiceType: 'retail'
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [isWalkinCustomer, setIsWalkinCustomer] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const due = new Date();
      due.setDate(due.getDate() + (formData.paymentTerms === 'cash' ? 0 : 15));
      setFormData(prev => ({ ...prev, dueDate: due.toISOString().split('T')[0] }));
    }
  }, [initialData, formData.paymentTerms]);

  const getFilteredClients = () => {
    const walkinCustomer = {
      id: 'walkin',
      name: 'Walk-in Customer',
      businessName: 'Walk-in Customer',
      isWalkin: true
    };
    return [walkinCustomer, ...clients];
  };

  const handleCustomerSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId === 'new') {
      setShowNewCustomer(true);
    } else if (selectedId === 'walkin') {
      setIsWalkinCustomer(true);
      setFormData({
        ...formData,
        clientName: 'Walk-in Customer',
        clientId: 'walkin'
      });
    } else {
      const selectedClient = clients.find(c => c.id.toString() === selectedId);
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
    const price = formData.invoiceType === 'wholesale' ? product.wholesalePrice : product.retailPrice;
    const existingItem = formData.items.find(item => item.productId === product.id);
    if (existingItem) {
      updateItem(formData.items.indexOf(existingItem), 'quantity', existingItem.quantity + 1);
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: price,
          unit: product.unit,
          gst: product.gst,
          total: price,
          gstAmount: (price * product.gst) / 100
        }]
      });
    }
    setSelectedProduct('');
    setSearchTerm('');
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'quantity') {
      const qty = parseFloat(value) || 0;
      newItems[index].quantity = qty;
      newItems[index].total = newItems[index].unitPrice * qty;
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

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const totalGST = calculateTotalGST();
    const afterDiscount = subtotal - formData.discount;
    return afterDiscount + formData.shippingCharge + totalGST;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one product to the invoice');
      return;
    }
    
    const invoiceToSave = {
      ...formData,
      subtotal: calculateSubtotal(),
      totalGST: calculateTotalGST(),
      total: calculateTotal(),
      items: formData.items,
      customerType: isWalkinCustomer ? 'walkin' : 'registered',
      invoiceNumber: `INV-${Date.now()}`
    };
    onSave(invoiceToSave);
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
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
          </div>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Unit</th><th>Price</th><th>GST</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${formData.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>₹${item.unitPrice}</td>
                  <td>${item.gst}%</td>
                  <td>₹${(item.total + item.gstAmount).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: ₹${calculateSubtotal().toFixed(2)}</p>
            <p>GST: ₹${calculateTotalGST().toFixed(2)}</p>
            <p>Discount: -₹${formData.discount.toFixed(2)}</p>
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
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="invoice-options">
            <div className="form-group">
              <label>Invoice Type</label>
              <select value={formData.invoiceType} onChange={(e) => setFormData({...formData, invoiceType: e.target.value})}>
                <option value="retail">Retail (Walk-in)</option>
                <option value="wholesale">Wholesale (Bulk)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Customer *</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select 
                value={formData.clientId} 
                onChange={handleCustomerSelect} 
                required 
                style={{ flex: 1 }}
              >
                <option value="">Select Customer</option>
                <option value="walkin">🚶 Walk-in Customer (No Name)</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} - {c.name}
                  </option>
                ))}
                <option value="new">➕ Add New Customer</option>
              </select>
            </div>
            {isWalkinCustomer && (
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                💡 Tip: You can add customer name by clicking "Add New Customer"
              </small>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Invoice Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
            </div>
          </div>

          <div className="product-search-section">
            <label>Add Products</label>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search products by name, category or brand..." 
                value={searchTerm}
                className="product-search-input "
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="product-dropdown">
                {products.filter(p => 
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(product => (
                  <div key={product.id} className="product-item" onClick={() => addProductToBill(product)}>
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.category} - {product.brand}</small>
                    </div>
                    <div>
                      {formData.invoiceType === 'wholesale' ? (
                        <span>Wholesale: ₹{product.wholesalePrice}</span>
                      ) : (
                        <span>Retail: ₹{product.retailPrice}</span>
                      )}
                      <span style={{ marginLeft: '10px' }}>Stock: {product.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="items-section">
            <label>Bill Items</label>
            <div className="table-container">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          min="0.1"
                          step="0.1"
                          style={{width: '80px'}}
                        />
                      </td>
                      <td>{item.unit}</td>
                      <td>₹{item.unitPrice.toFixed(2)}</td>
                      <td>{item.gst}%</td>
                      <td>₹{(item.total + item.gstAmount).toFixed(2)}</td>
                      <td>
                        <button type="button" onClick={() => removeItem(idx)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="invoice-summary">
            <div className="form-group">
              <label>Discount (₹)</label>
              <input type="number" value={formData.discount} onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea rows="2" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Any special instructions..." />
            </div>
          </div>

          <div className="total-summary">
            <div>Subtotal: ₹{calculateSubtotal().toFixed(2)}</div>
            <div>Total GST: ₹{calculateTotalGST().toFixed(2)}</div>
            <div>Discount: -₹{formData.discount.toFixed(2)}</div>
            <div className="grand-total">Grand Total: ₹{calculateTotal().toFixed(2)}</div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn-secondary" onClick={printInvoice}>🖨️ Print</button>
            <button type="submit" className="btn-primary">Save & Generate Invoice</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedWholesaleInvoiceModal;