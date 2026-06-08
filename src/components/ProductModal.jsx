// src/components/ProductModal.jsx
import React, { useState, useEffect } from "react";

const ProductModal = ({ onClose, onSave, initialData, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subCategory: "",
    unit: "piece",
    wholesalePrice: 0,
    retailPrice: 0,
    stock: 0,
    minStock: 10,
    gst: 0,
    hsnCode: "",
    brand: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "Edit Product" : "Add New Product"}</h2>
          <button className="close-modal" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sub Category</label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) =>
                  setFormData({ ...formData, subCategory: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              >
                <option value="piece">Piece</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="liter">Liter (L)</option>
                <option value="dozen">Dozen</option>
                <option value="pack">Pack</option>
                <option value="meter">Meter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Wholesale Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.wholesalePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    wholesalePrice: parseFloat(e.target.value)
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Retail Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.retailPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    retailPrice: parseFloat(e.target.value)
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Current Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label>Minimum Stock Alert</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStock: parseInt(e.target.value)
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>GST (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.gst}
                onChange={(e) =>
                  setFormData({ ...formData, gst: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label>HSN/SAC Code</label>
              <input
                type="text"
                value={formData.hsnCode}
                onChange={(e) =>
                  setFormData({ ...formData, hsnCode: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
