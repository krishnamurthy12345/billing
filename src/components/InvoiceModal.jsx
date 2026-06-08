// src/components/InvoiceModal.jsx
import React, { useState, useEffect } from "react";

const InvoiceModal = ({ onClose, onSave, initialData, clients }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "pending",
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName,
        date: initialData.date,
        dueDate: initialData.dueDate,
        status: initialData.status,
        items: initialData.items.map((item) => ({ ...item }))
      });
    } else {
      const due = new Date();
      due.setDate(due.getDate() + 15);
      setFormData((prev) => ({
        ...prev,
        dueDate: due.toISOString().split("T")[0]
      }));
    }
  }, [initialData]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] =
      field === "quantity" || field === "unitPrice"
        ? parseFloat(value) || 0
        : value;
    newItems[index].total =
      newItems[index].quantity * newItems[index].unitPrice;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, unitPrice: 0, total: 0 }
      ]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotal = () => {
    return formData.items
      .reduce((sum, item) => sum + (item.total || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = parseFloat(calculateTotal());
    const invoiceToSave = {
      ...formData,
      total,
      items: formData.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }))
    };
    onSave(invoiceToSave);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "Edit Invoice" : "Create New Invoice"}</h2>
          <button className="close-modal" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem"
            }}
          >
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
          </div>

          <div className="items-section">
            <label>Line Items</label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="item-row">
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(idx, "description", e.target.value)
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                  step="0.01"
                />
                <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem"
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button type="button" className="add-item-btn" onClick={addItem}>
              + Add Item
            </button>
          </div>
          <div
            style={{
              textAlign: "right",
              margin: "1rem 0",
              fontWeight: "bold",
              fontSize: "1.2rem"
            }}
          >
            Total: ${calculateTotal()}
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

export default InvoiceModal;
