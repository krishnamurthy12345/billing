// src/data/db.js - Updated initial data
export const initialData = {
  invoices: [
    {
      id: "INV-001",
      clientName: "FreshMart Retail",
      date: "2025-05-15",
      dueDate: "2025-05-30",
      status: "paid",
      total: 12500.00,
      subtotal: 11200,
      totalGST: 1300,
      discount: 0,
      shippingCharge: 0,
      paymentTerms: "credit",
      items: [
        { productId: "PRD-001", productName: "Basmati Rice", quantity: 50, unitPrice: 120, unit: "kg", gst: 5, total: 6000, gstAmount: 300 }
      ]
    }
  ],
  clients: [
    { 
      id: 1, 
      name: "Rajesh Kumar", 
      businessName: "FreshMart Retail", 
      contactPerson: "Rajesh Kumar",
      email: "rajesh@freshmart.com", 
      phone: "+91 98765 43210",
      gstin: "27AAAAA1234B1Z"
    }
  ],
  products: [
    {
      id: "PRD-001",
      name: "Basmati Rice",
      category: "Grocery",
      subCategory: "Rice",
      unit: "kg",
      wholesalePrice: 120,
      retailPrice: 150,
      stock: 500,
      minStock: 50,
      gst: 5,
      hsnCode: "100630",
      brand: "India Gate"
    },
    {
      id: "PRD-002",
      name: "Tomatoes",
      category: "Vegetables",
      subCategory: "Fresh Vegetables",
      unit: "kg",
      wholesalePrice: 30,
      retailPrice: 40,
      stock: 100,
      minStock: 20,
      gst: 0,
      hsnCode: "070200",
      brand: "Fresh Farms"
    },
    {
      id: "PRD-003",
      name: "Lipstick - Red",
      category: "Makeup",
      subCategory: "Lips",
      unit: "piece",
      wholesalePrice: 250,
      retailPrice: 450,
      stock: 200,
      minStock: 30,
      gst: 18,
      hsnCode: "330410",
      brand: "Maybelline"
    },
    {
      id: "PRD-004",
      name: "Cotton T-Shirt",
      category: "Clothing",
      subCategory: "Men's Wear",
      unit: "piece",
      wholesalePrice: 350,
      retailPrice: 599,
      stock: 300,
      minStock: 50,
      gst: 12,
      hsnCode: "610910",
      brand: "Jockey"
    }
  ],
  nextInvoiceId: "INV-002",
  nextProductId: "PRD-005"
};

export const loadData = () => {
  const saved = localStorage.getItem('wholesaleBillingData');
  if (saved) {
    return JSON.parse(saved);
  }
  return initialData;
};

export const saveData = (data) => {
  localStorage.setItem('wholesaleBillingData', JSON.stringify(data));
};