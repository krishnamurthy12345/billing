// src/components/QuickCustomerModal.jsx
import React, { useState } from "react";

const QuickCustomerModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    isWalkin: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const customerData = {
      id: Date.now(),
      name: formData.name || "Walk-in Customer",
      businessName:
        formData.businessName || formData.name || "Walk-in Customer",
      contactPerson: formData.name || "Walk-in Customer",
      email: formData.email || "walkin@customer.com",
      phone: formData.phone || "Not Provided",
      gstin: "NA",
      isWalkin: !formData.name
    };
    onSave(customerData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Customer</h2>
          <button className="close-modal" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name (Optional)</label>
            <input
              type="text"
              placeholder="Leave blank for walk-in customer"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <small>If left blank, will be saved as "Walk-in Customer"</small>
          </div>
          <div className="form-group">
            <label>Business Name (Optional)</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Phone Number (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Email (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCustomerModal;
