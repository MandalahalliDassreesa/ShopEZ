import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Users, Ticket, Plus, Trash2, Edit, Check, AlertTriangle, Eye, Lock, Unlock } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../components/Toast';
import { MonthlySalesChart, CategoryPerformanceChart, CustomerGrowthChart } from '../components/Charts';

const AdminDashboard = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Analytics states
  const [analytics, setAnalytics] = useState(null);

  // Inventory states
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Product Form fields
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodFeatures, setProdFeatures] = useState('');
  const [prodTags, setProdTags] = useState('');
  const [prodIsBOGO, setProdIsBOGO] = useState(false);
  
  // Standard default variant variables
  const [prodStock, setProdStock] = useState('50');
  const [prodVariantSize, setProdVariantSize] = useState('');
  const [prodVariantColor, setProdVariantColor] = useState('');

  // Orders states
  const [orders, setOrders] = useState([]);

  // Users states
  const [users, setUsers] = useState([]);

  // Coupons states
  const [coupons, setCoupons] = useState([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState('percentage');
  const [coupValue, setCoupValue] = useState('');
  const [coupMin, setCoupMin] = useState('0');
  const [coupExpiry, setCoupExpiry] = useState('');

  // Main fetch routines based on active tab
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const { data } = await axios.get('http://localhost:5000/api/admin/analytics');
        setAnalytics(data);
      } else if (activeTab === 'inventory') {
        const { data } = await axios.get('http://localhost:5000/api/products?limit=100');
        setProducts(data.products || []);
      } else if (activeTab === 'orders') {
        const { data } = await axios.get('http://localhost:5000/api/admin/orders');
        setOrders(data);
      } else if (activeTab === 'customers') {
        const { data } = await axios.get('http://localhost:5000/api/admin/users');
        setUsers(data);
      } else if (activeTab === 'marketing') {
        const { data } = await axios.get('http://localhost:5000/api/coupons');
        setCoupons(data);
      }
    } catch (error) {
      console.error('Error loading admin panel details:', error.message);
      addToast('Error loading panel data', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodBrand || !prodCategory || !prodPrice || !prodDesc || !prodImage) {
      addToast('Please fill all required product fields', 'error');
      return;
    }

    // Programmatically construct variants array based on simple fields
    const variants = [
      {
        size: prodVariantSize || undefined,
        color: prodVariantColor || undefined,
        stockQuantity: Number(prodStock || 0),
        priceAdjustment: 0
      }
    ];

    const productPayload = {
      name: prodName,
      brand: prodBrand,
      category: prodCategory,
      price: Number(prodPrice),
      discountPercentage: Number(prodDiscount || 0),
      description: prodDesc,
      images: [prodImage],
      features: prodFeatures.split(',').map(f => f.trim()).filter(Boolean),
      tags: prodTags.split(',').map(t => t.trim()).filter(Boolean),
      isBOGO: prodIsBOGO,
      variants
    };

    try {
      if (editingProductId) {
        // Edit Product
        await axios.put(`http://localhost:5000/api/admin/products/${editingProductId}`, productPayload);
        addToast('Product updated successfully!', 'success');
      } else {
        // Create Product
        await axios.post('http://localhost:5000/api/admin/products', productPayload);
        addToast('Product created successfully!', 'success');
      }

      // Reset
      setShowProductForm(false);
      setEditingProductId(null);
      setProdName('');
      setProdBrand('');
      setProdCategory('');
      setProdPrice('');
      setProdDiscount('0');
      setProdDesc('');
      setProdImage('');
      setProdFeatures('');
      setProdTags('');
      setProdIsBOGO(false);
      setProdStock('50');
      setProdVariantSize('');
      setProdVariantColor('');
      
      // Reload list
      loadDashboardData();
    } catch (error) {
      addToast('Error saving product', 'error');
    }
  };

  const handleEditProductClick = (p) => {
    setEditingProductId(p._id);
    setProdName(p.name);
    setProdBrand(p.brand);
    setProdCategory(p.category);
    setProdPrice(String(p.price));
    setProdDiscount(String(p.discountPercentage));
    setProdDesc(p.description);
    setProdImage(p.images[0] || '');
    setProdFeatures(p.features ? p.features.join(', ') : '');
    setProdTags(p.tags ? p.tags.join(', ') : '');
    setProdIsBOGO(p.isBOGO);
    
    // Set variant values from first variant if present
    if (p.variants && p.variants.length > 0) {
      const v = p.variants[0];
      setProdStock(String(v.stockQuantity));
      setProdVariantSize(v.size || '');
      setProdVariantColor(v.color || '');
    }
    
    setShowProductForm(true);
  };

  const handleDeleteProductClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/products/${productId}`);
        addToast('Product removed successfully', 'info');
        loadDashboardData();
      } catch (error) {
        addToast('Error deleting product', 'error');
      }
    }
  };

  // Order Status transition
  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status });
      addToast(`Order status updated to "${status}"`, 'success');
      loadDashboardData();
    } catch (error) {
      addToast('Error updating order status', 'error');
    }
  };

  // User blocks
  const handleToggleBlockUser = async (user) => {
    try {
      if (user.blocked) {
        await axios.put(`http://localhost:5000/api/admin/users/${user._id}/unblock`);
        addToast(`User ${user.name} unblocked`, 'success');
      } else {
        await axios.put(`http://localhost:5000/api/admin/users/${user._id}/block`);
        addToast(`User ${user.name} blocked!`, 'info');
      }
      loadDashboardData();
    } catch (error) {
      addToast('Error updating block status', 'error');
    }
  };

  // Coupons creation
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!coupCode || !coupValue || !coupExpiry) {
      addToast('Please fill all coupon fields', 'error');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/coupons', {
        code: coupCode,
        discountType: coupType,
        discountValue: Number(coupValue),
        minPurchase: Number(coupMin || 0),
        expiryDate: new Date(coupExpiry)
      });

      addToast('Coupon campaign created!', 'success');
      setShowCouponForm(false);
      setCoupCode('');
      setCoupValue('');
      setCoupMin('0');
      setCoupExpiry('');
      loadDashboardData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Error creating coupon', 'error');
    }
  };

  const handleDeleteCouponClick = async (coupId) => {
    if (window.confirm('Delete this promotional coupon code?')) {
      try {
        await axios.delete(`http://localhost:5000/api/coupons/${coupId}`);
        addToast('Coupon campaign removed', 'info');
        loadDashboardData();
      } catch (error) {
        addToast('Error deleting coupon', 'error');
      }
    }
  };

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', margin: '20px 0' }}>
      {/* Admin Control Sidebar */}
      <aside className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', height: 'fit-content' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`suggestion-item ${activeTab === 'overview' ? 'active-order-glow' : ''}`}
            style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'overview' ? 'bold' : 'normal' }}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`suggestion-item ${activeTab === 'inventory' ? 'active-order-glow' : ''}`}
            style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'inventory' ? 'bold' : 'normal' }}
          >
            <Package size={16} />
            <span>Product Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`suggestion-item ${activeTab === 'orders' ? 'active-order-glow' : ''}`}
            style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'orders' ? 'bold' : 'normal' }}
          >
            <ShoppingBag size={16} />
            <span>Customer Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`suggestion-item ${activeTab === 'customers' ? 'active-order-glow' : ''}`}
            style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'customers' ? 'bold' : 'normal' }}
          >
            <Users size={16} />
            <span>Customer Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`suggestion-item ${activeTab === 'marketing' ? 'active-order-glow' : ''}`}
            style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'marketing' ? 'bold' : 'normal' }}
          >
            <Ticket size={16} />
            <span>Promo Coupons</span>
          </button>
        </div>
      </aside>

      {/* Main admin work view */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="skeleton-box skeleton-circle" style={{ width: '50px', margin: 'auto' }}></div>
          </div>
        ) : (
          <>
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && analytics && (
              <div>
                <h1 style={{ marginBottom: '24px' }}>Sales & Operations Analytics</h1>

                {/* Stats cards row */}
                <div className="admin-stats-grid">
                  <div className="glass-panel admin-stat-card">
                    <div className="admin-stat-icon-wrapper">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <span className="admin-stat-label">Total Revenue</span>
                      <p className="admin-stat-val">₹{analytics.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="glass-panel admin-stat-card">
                    <div className="admin-stat-icon-wrapper" style={{ background: 'rgba(280, 75, 60, 0.15)', color: 'rgba(280, 75, 60, 1)' }}>
                      <Package size={20} />
                    </div>
                    <div>
                      <span className="admin-stat-label">Total Orders</span>
                      <p className="admin-stat-val">{analytics.totalOrders}</p>
                    </div>
                  </div>

                  <div className="glass-panel admin-stat-card">
                    <div className="admin-stat-icon-wrapper" style={{ background: 'rgba(38, 92, 50, 0.15)', color: 'rgba(38, 92, 50, 1)' }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <span className="admin-stat-label">Customers</span>
                      <p className="admin-stat-val">{analytics.totalCustomers}</p>
                    </div>
                  </div>
                </div>

                {/* Charts panel */}
                <div className="admin-charts-grid">
                  <div className="glass-panel admin-chart-box">
                    <h3 style={{ marginBottom: '16px' }}>Monthly Sales Trend ($)</h3>
                    <div style={{ height: '260px' }}>
                      <MonthlySalesChart salesData={analytics.monthlySales} />
                    </div>
                  </div>

                  <div className="glass-panel admin-chart-box">
                    <h3 style={{ marginBottom: '16px' }}>Category Revenue Share ($)</h3>
                    <div style={{ height: '260px' }}>
                      <CategoryPerformanceChart categoryData={analytics.categoryPerformance} />
                    </div>
                  </div>
                </div>

                <div className="admin-charts-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="glass-panel admin-chart-box" style={{ minHeight: '340px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Customer Acquisition Growth</h3>
                    <div style={{ height: '260px' }}>
                      <CustomerGrowthChart growthData={analytics.customerGrowth} />
                    </div>
                  </div>
                </div>

                {/* Inventory health summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                  <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} color="hsl(38, 92%, 45%)" /> Inventory Health Alerts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total catalog products:</span>
                        <strong>{analytics.inventorySummary.totalProducts}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(38, 92%, 45%)' }}>
                        <span>Low stock items warning (&lt; 10):</span>
                        <strong>{analytics.inventorySummary.lowStockCount}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(0, 84%, 55%)' }}>
                        <span>Out of stock items:</span>
                        <strong>{analytics.inventorySummary.outOfStockCount}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', overflowY: 'auto', maxHeight: '180px' }}>
                    <h3 style={{ marginBottom: '12px' }}>Low Stock Product List</h3>
                    {analytics.inventoryList.filter(item => item.totalStock < 10).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '70%' }}>{item.name}</span>
                        <strong style={{ color: item.totalStock === 0 ? 'hsl(0, 84%, 55%)' : 'hsl(38, 92%, 45%)' }}>
                          Stock: {item.totalStock}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT INVENTORY CRUD VIEW */}
            {activeTab === 'inventory' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h1>Catalog & Inventory</h1>
                  {!showProductForm && (
                    <button onClick={() => setShowProductForm(true)} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                      <Plus size={16} /> Create Product
                    </button>
                  )}
                </div>

                {/* CRUD Form overlay (Edit/Add) */}
                {showProductForm && (
                  <form onSubmit={handleProductSubmit} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                    <h3>{editingProductId ? 'Edit Product Attributes' : 'Create Product Entry'}</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                      <div className="form-group-field">
                        <label className="form-label-txt">Product Name *</label>
                        <input type="text" className="form-input-val" required value={prodName} onChange={(e) => setProdName(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Brand *</label>
                        <input type="text" className="form-input-val" required value={prodBrand} onChange={(e) => setProdBrand(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div className="form-group-field">
                        <label className="form-label-txt">Category *</label>
                        <input type="text" className="form-input-val" required placeholder="e.g. Electronics" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Base Price (₹) *</label>
                        <input type="number" step="0.01" className="form-input-val" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Discount %</label>
                        <input type="number" className="form-input-val" value={prodDiscount} onChange={(e) => setProdDiscount(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group-field">
                      <label className="form-label-txt">Description *</label>
                      <textarea rows="3" className="form-textarea-box" required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)}></textarea>
                    </div>

                    <div className="form-group-field">
                      <label className="form-label-txt">Image URL *</label>
                      <input type="text" className="form-input-val" placeholder="https://unsplash..." required value={prodImage} onChange={(e) => setProdImage(e.target.value)} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group-field">
                        <label className="form-label-txt">Key Features (comma separated)</label>
                        <input type="text" className="form-input-val" placeholder="Feature A, Feature B, Feature C" value={prodFeatures} onChange={(e) => setProdFeatures(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Tags (comma separated)</label>
                        <input type="text" className="form-input-val" placeholder="Trending, New Arrival" value={prodTags} onChange={(e) => setProdTags(e.target.value)} />
                      </div>
                    </div>

                    {/* Stock and initial variant fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div className="form-group-field">
                        <label className="form-label-txt">Inventory Stock Quantity *</label>
                        <input type="number" className="form-input-val" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Variant size (optional)</label>
                        <input type="text" className="form-input-val" placeholder="S, M, L, XL" value={prodVariantSize} onChange={(e) => setProdVariantSize(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Variant color (optional)</label>
                        <input type="text" className="form-input-val" placeholder="Black, Silver" value={prodVariantColor} onChange={(e) => setProdVariantColor(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      <input type="checkbox" checked={prodIsBOGO} onChange={(e) => setProdIsBOGO(e.target.checked)} />
                      <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Enable Buy One Get One Free promotion (BOGO)</label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                        {editingProductId ? 'Update Product' : 'Create Entry'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProductId(null);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '10px 20px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Table Products logs */}
                <div className="admin-table-wrapper">
                  <table className="admin-crud-table">
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Inventory</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
                        const statusClass = totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'healthy';
                        const statusText = totalStock === 0 ? 'Out of Stock' : totalStock < 10 ? 'Low Stock' : 'In Stock';

                        return (
                          <tr key={p._id}>
                            <td style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <img src={p.images[0]} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f7' }} />
                              <strong style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '200px' }}>{p.name}</strong>
                            </td>
                            <td>{p.brand}</td>
                            <td>{p.category}</td>
                            <td><strong>₹{p.price.toFixed(2)}</strong></td>
                            <td>
                              <span className={`admin-inventory-status ${statusClass}`}>{statusText} ({totalStock})</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => handleEditProductClick(p)}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', borderRadius: '4px' }}
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProductClick(p._id)}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', borderRadius: '4px', color: 'hsl(0, 84%, 55%)' }}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDER MANAGEMENT VIEW */}
            {activeTab === 'orders' && (
              <div>
                <h1 style={{ marginBottom: '24px' }}>Customer Orders Management</h1>
                
                <div className="admin-table-wrapper">
                  <table className="admin-crud-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>User Email</th>
                        <th>Date Placed</th>
                        <th>Total price</th>
                        <th>Paid</th>
                        <th>Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td><strong>{order._id}</strong></td>
                          <td>{order.user?.email || 'Guest/Deleted'}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td><strong>₹{order.totalPrice.toFixed(2)}</strong></td>
                          <td>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: order.isPaid ? 'hsl(142, 60%, 95%)' : 'hsl(0, 100%, 94%)',
                                color: order.isPaid ? 'hsl(142, 70%, 30%)' : 'hsl(0, 100%, 35%)'
                              }}
                            >
                              {order.isPaid ? 'PAID' : 'UNPAID'}
                            </span>
                          </td>
                          <td>
                            {/* Dropdown status update changer */}
                            <select
                              value={order.deliveryStatus}
                              onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                              className="form-select-val"
                              style={{ padding: '4px 8px', fontSize: '0.85rem', width: '150px' }}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CUSTOMERS CONTROL VIEW */}
            {activeTab === 'customers' && (
              <div>
                <h1 style={{ marginBottom: '24px' }}>Customer Registrations Logs</h1>

                <div className="admin-table-wrapper">
                  <table className="admin-crud-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Date Registered</th>
                        <th>Account Access</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((cust) => (
                        <tr key={cust._id}>
                          <td><strong>{cust.name}</strong> {cust.role === 'admin' && <span className="badge-tag trending" style={{ fontSize: '0.65rem' }}>Admin</span>}</td>
                          <td>{cust.email}</td>
                          <td>{new Date(cust.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: cust.blocked ? 'hsl(0, 100%, 94%)' : 'hsl(142, 60%, 95%)',
                                color: cust.blocked ? 'hsl(0, 100%, 35%)' : 'hsl(142, 70%, 30%)'
                              }}
                            >
                              {cust.blocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            {cust.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleBlockUser(cust)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                {cust.blocked ? (
                                  <>
                                    <Unlock size={12} /> Unblock
                                  </>
                                ) : (
                                  <>
                                    <Lock size={12} style={{ color: 'hsl(0, 84%, 55%)' }} /> Block
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MARKETING COUPON VIEW */}
            {activeTab === 'marketing' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h1>Marketing Promotions & Coupons</h1>
                  {!showCouponForm && (
                    <button onClick={() => setShowCouponForm(true)} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                      <Plus size={16} /> Create Coupon
                    </button>
                  )}
                </div>

                {showCouponForm && (
                  <form onSubmit={handleCouponSubmit} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                    <h3>Create New Coupon</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                      <div className="form-group-field">
                        <label className="form-label-txt">Promo Coupon Code *</label>
                        <input type="text" className="form-input-val" required placeholder="e.g. MEGA25" value={coupCode} onChange={(e) => setCoupCode(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Discount Type *</label>
                        <select className="form-select-val" value={coupType} onChange={(e) => setCoupType(e.target.value)}>
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat ($)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div className="form-group-field">
                        <label className="form-label-txt">Discount Value *</label>
                        <input type="number" className="form-input-val" required value={coupValue} onChange={(e) => setCoupValue(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Minimum Purchase ($)</label>
                        <input type="number" className="form-input-val" value={coupMin} onChange={(e) => setCoupMin(e.target.value)} />
                      </div>
                      <div className="form-group-field">
                        <label className="form-label-txt">Expiry Date *</label>
                        <input type="date" className="form-input-val" required value={coupExpiry} onChange={(e) => setCoupExpiry(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                        Create Campaign
                      </button>
                      <button type="button" onClick={() => setShowCouponForm(false)} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="admin-table-wrapper">
                  <table className="admin-crud-table">
                    <thead>
                      <tr>
                        <th>Coupon Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Min Purchase</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon._id}>
                          <td><strong>{coupon.code}</strong></td>
                          <td>{coupon.discountType}</td>
                          <td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}</td>
                          <td>₹{coupon.minPurchase}</td>
                          <td>{new Date(coupon.expiryDate).toLocaleDateString('en-US')}</td>
                          <td>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: new Date(coupon.expiryDate) < new Date() ? 'hsl(0, 100%, 94%)' : 'hsl(142, 60%, 95%)',
                                color: new Date(coupon.expiryDate) < new Date() ? 'hsl(0, 100%, 35%)' : 'hsl(142, 70%, 30%)'
                              }}
                            >
                              {new Date(coupon.expiryDate) < new Date() ? 'EXPIRED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteCouponClick(coupon._id)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', borderRadius: '4px', color: 'hsl(0, 84%, 55%)' }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
