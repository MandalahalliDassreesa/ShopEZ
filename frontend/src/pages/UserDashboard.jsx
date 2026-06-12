import React, { useState } from 'react';
import { User, MapPin, Eye, Settings, ShieldAlert, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user, updateProfile, addAddress, updateAddress, deleteAddress, recentlyViewed } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Address fields
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  const [addrType, setAddrType] = useState('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({ name, email, password });
      addToast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      addToast(error.response?.data?.message || 'Error updating profile', 'error');
    }
    setProfileLoading(false);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrStreet || !addrCity || !addrState || !addrZip) {
      addToast('Please fill all address fields', 'error');
      return;
    }

    try {
      if (editingAddressId) {
        // Edit Address
        await updateAddress(editingAddressId, {
          type: addrType,
          fullName: addrFullName,
          phone: addrPhone,
          street: addrStreet,
          city: addrCity,
          state: addrState,
          zipCode: addrZip
        });
        addToast('Address updated successfully!', 'success');
      } else {
        // Create Address
        await addAddress({
          type: addrType,
          fullName: addrFullName,
          phone: addrPhone,
          street: addrStreet,
          city: addrCity,
          state: addrState,
          zipCode: addrZip
        });
        addToast('New address added successfully!', 'success');
      }

      // Reset
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddrFullName('');
      setAddrPhone('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
    } catch (error) {
      addToast('Error saving address details', 'error');
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddressId(addr._id);
    setAddrType(addr.type);
    setAddrFullName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrZip(addr.zipCode);
    setShowAddressForm(true);
  };

  const handleDeleteAddressClick = async (addrId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addrId);
        addToast('Address deleted successfully', 'info');
      } catch (error) {
        addToast('Error deleting address', 'error');
      }
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>My Account</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px' }}>
        {/* Navigation Sidebar */}
        <aside className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`suggestion-item ${activeTab === 'profile' ? 'active-order-glow' : ''}`}
              style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}
            >
              <User size={16} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`suggestion-item ${activeTab === 'addresses' ? 'active-order-glow' : ''}`}
              style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'addresses' ? 'bold' : 'normal' }}
            >
              <MapPin size={16} />
              <span>My Addresses</span>
            </button>
            <button
              onClick={() => setActiveTab('viewed')}
              className={`suggestion-item ${activeTab === 'viewed' ? 'active-order-glow' : ''}`}
              style={{ width: '100%', background: 'transparent', textAlign: 'left', fontWeight: activeTab === 'viewed' ? 'bold' : 'normal' }}
            >
              <Eye size={16} />
              <span>Recently Viewed</span>
            </button>
          </div>
        </aside>

        {/* Tab contents */}
        <div>
          {/* PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h2 style={{ marginBottom: '20px' }}>Account Settings</h2>
              <form onSubmit={handleProfileUpdate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group-field">
                    <label className="form-label-txt">Full Name</label>
                    <input
                      type="text"
                      className="form-input-val"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group-field">
                    <label className="form-label-txt">Email Address</label>
                    <input
                      type="email"
                      className="form-input-val"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                  <div className="form-group-field">
                    <label className="form-label-txt">New Password (leave empty to keep current)</label>
                    <input
                      type="password"
                      className="form-input-val"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group-field">
                    <label className="form-label-txt">Confirm Password</label>
                    <input
                      type="password"
                      className="form-input-val"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', marginTop: '20px' }}
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving changes...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}

          {/* ADDRESS VIEW */}
          {activeTab === 'addresses' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>My Addresses</h2>
                {!showAddressForm && (
                  <button onClick={() => setShowAddressForm(true)} className="btn btn-primary" style={{ padding: '8px 16px' }}>
                    <Plus size={16} /> Add Address
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddressSubmit} style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  <h3>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                    <div className="form-group-field">
                      <label className="form-label-txt">Address Tag</label>
                      <select className="form-select-val" value={addrType} onChange={(e) => setAddrType(e.target.value)}>
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group-field">
                      <label className="form-label-txt">Full Name</label>
                      <input type="text" className="form-input-val" required value={addrFullName} onChange={(e) => setAddrFullName(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group-field">
                      <label className="form-label-txt">Phone Number</label>
                      <input type="text" className="form-input-val" required value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} />
                    </div>
                    <div className="form-group-field">
                      <label className="form-label-txt">Street Address</label>
                      <input type="text" className="form-input-val" required value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group-field">
                      <label className="form-label-txt">City</label>
                      <input type="text" className="form-input-val" required value={addrCity} onChange={(e) => setAddrCity(e.target.value)} />
                    </div>
                    <div className="form-group-field">
                      <label className="form-label-txt">State</label>
                      <input type="text" className="form-input-val" required value={addrState} onChange={(e) => setAddrState(e.target.value)} />
                    </div>
                    <div className="form-group-field">
                      <label className="form-label-txt">Zip Code</label>
                      <input type="text" className="form-input-val" required value={addrZip} onChange={(e) => setAddrZip(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '10px 20px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Lists addresses */}
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="addresses-select-grid" style={{ pointerEvents: 'auto' }}>
                  {user.addresses.map((address) => (
                    <div key={address._id} className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-sm)', position: 'relative', border: '1px solid var(--border-color)' }}>
                      <span className="address-type-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{address.type}</span>
                      <strong style={{ display: 'block', marginBottom: '8px' }}>{address.fullName}</strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {address.street}, {address.city}, {address.state} - {address.zipCode}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '8px' }}>
                        Phone: {address.phone}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <button
                          onClick={() => handleEditAddressClick(address)}
                          className="cart-item-action-btn"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddressClick(address._id)}
                          className="cart-item-action-btn"
                          style={{ color: 'hsl(0, 84%, 55%)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-light)', padding: '20px 0', textAlign: 'center' }}>
                  No shipping addresses saved yet. Click "Add Address" to create one.
                </div>
              )}
            </div>
          )}

          {/* VIEWED PRODUCTS VIEW */}
          {activeTab === 'viewed' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h2 style={{ marginBottom: '20px' }}>Recently Viewed Products</h2>
              {recentlyViewed.length === 0 ? (
                <div style={{ color: 'var(--text-light)', padding: '20px 0', textAlign: 'center' }}>
                  You haven't viewed any products recently.
                </div>
              ) : (
                <div className="product-grid">
                  {recentlyViewed.map((product) => {
                    const finalPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
                    return (
                      <Link to={`/product/${product._id}`} key={product._id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px', background: '#f5f5f7' }}
                        />
                        <h4 style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.5rem', marginBottom: '4px' }}>
                          {product.name}
                        </h4>
                        <strong style={{ marginTop: 'auto' }}>₹{finalPrice.toFixed(2)}</strong>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
