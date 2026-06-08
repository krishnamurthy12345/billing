// src/components/WholesaleInvoiceModal.jsx
import React, { useState, useEffect } from "react";

const WholesaleInvoiceModal = ({
  onClose,
  onSave,
  initialData,
  clients,
  products
}) => {
  const [formData, setFormData] = useState({
    clientName: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "pending",
    paymentTerms: "cash",
    discount: 0,
    shippingCharge: 0,
    items: [],
    notes: ""
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const due = new Date();
      due.setDate(due.getDate() + 15);
      setFormData((prev) => ({
        ...prev,
        dueDate: due.toISOString().split("T")[0]
      }));
    }
  }, [initialData]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProductToBill = (product) => {
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
            unitPrice: product.wholesalePrice,
            unit: product.unit,
            gst: product.gst,
            total: product.wholesalePrice,
            gstAmount: (product.wholesalePrice * product.gst) / 100
          }
        ]
      });
    }
    setSelectedProduct("");
    setSearchTerm("");
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === "quantity") {
      const qty = parseFloat(value) || 0;
      newItems[index].quantity = qty;
      newItems[index].total = newItems[index].unitPrice * qty;
      newItems[index].gstAmount =
        (newItems[index].total * newItems[index].gst) / 100;
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
    const invoiceToSave = {
      ...formData,
      subtotal: calculateSubtotal(),
      totalGST: calculateTotalGST(),
      total: calculateTotal(),
      items: formData.items
    };
    onSave(invoiceToSave);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {initialData
              ? "Edit Wholesale Invoice"
              : "Create Wholesale Invoice"}
          </h2>
          <button className="close-modal" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Client *</label>
              <select
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                required
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} - {c.businessName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Invoice Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
              >
                <option value="cash">Cash</option>
                <option value="credit">Credit (15 days)</option>
                <option value="credit30">Credit (30 days)</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online Transfer</option>
              </select>
            </div>
          </div>

          <div className="product-search-section">
            <label>Add Products</label>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products by name, category or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="product-dropdown">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="product-item"
                    onClick={() => addProductToBill(product)}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <small>
                        {product.category} - {product.brand}
                      </small>
                    </div>
                    <div>
                      ₹{product.wholesalePrice}/{product.unit} | Stock:{" "}
                      {product.stock}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="items-section">
            <label>Invoice Items</label>
            <div className="table-container">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Unit Price</th>
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
                          onChange={(e) =>
                            updateItem(idx, "quantity", e.target.value)
                          }
                          min="0.1"
                          step="0.1"
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td>{item.unit}</td>
                      <td>₹{item.unitPrice.toFixed(2)}</td>
                      <td>{item.gst}%</td>
                      <td>₹{(item.total + item.gstAmount).toFixed(2)}</td>
                      <td>
                        <button type="button" onClick={() => removeItem(idx)}>
                          🗑️
                        </button>
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
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount: parseFloat(e.target.value) || 0
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
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="total-summary">
            <div>Subtotal: ₹{calculateSubtotal().toFixed(2)}</div>
            <div>Total GST: ₹{calculateTotalGST().toFixed(2)}</div>
            <div>Discount: -₹{formData.discount.toFixed(2)}</div>
            <div>Shipping: +₹{formData.shippingCharge.toFixed(2)}</div>
            <div className="grand-total">
              Grand Total: ₹{calculateTotal().toFixed(2)}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WholesaleInvoiceModal;
