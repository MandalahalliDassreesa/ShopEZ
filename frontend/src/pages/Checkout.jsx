import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, CreditCard, Landmark, Wallet, Truck, ArrowLeft, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import axios from 'axios';

const Checkout = () => {
  const { user, addAddress } = useAuth();
  const { cartItems, appliedCoupon, clearCart, getTotals } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Step tracker: 1 = Address, 2 = Review & Pay
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    return user?.addresses && user.addresses.length > 0 ? user.addresses[0]._id : '';
  });

  // New Address Form toggle and fields
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrType, setAddrType] = useState('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  // Payment simulation
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Credit Card fields (animated preview)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // UPI fields
  const [upiId, setUpiId] = useState('');

  // Post placement success
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    itemsPrice,
    bogoDiscount,
    couponDiscount,
    discountAmount,
    taxPrice,
    shippingPrice,
    totalPrice
  } = getTotals();

  // If no items, redirect back
  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Your Cart is Empty</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Shop Now</Link>
      </div>
    );
  }

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrFullName || !addrPhone || !addrStreet || !addrCity || !addrState || !addrZip) {
      addToast('Please fill all address fields', 'error');
      return;
    }

    try {
      const addresses = await addAddress({
        type: addrType,
        fullName: addrFullName,
        phone: addrPhone,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip
      });

      addToast('New address added successfully!', 'success');
      
      // Auto select new address
      if (addresses && addresses.length > 0) {
        setSelectedAddressId(addresses[addresses.length - 1]._id);
      }

      // Reset fields
      setShowAddressForm(false);
      setAddrFullName('');
      setAddrPhone('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
    } catch (error) {
      addToast('Error saving address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast('Please select a shipping address', 'error');
      return;
    }

    const shippingAddress = user.addresses.find(a => a._id === selectedAddressId);
    if (!shippingAddress) {
      addToast('Selected address is invalid', 'error');
      return;
    }

    // Prepare simulated payment result
    let paymentResult = {
      id: 'simulated_txn_' + Date.now(),
      status: 'SUCCESS',
      updateTime: new Date().toISOString()
    };

    if (paymentMethod === 'Card') {
      if (cardNumber.length < 15 || cardCvv.length < 3 || !cardName) {
        addToast('Please fill all credit card fields correctly', 'error');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId.includes('@')) {
        addToast('Please enter a valid UPI ID (e.g. user@upi)', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
          variant: item.variant
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          type: shippingAddress.type
        },
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountAmount,
        totalPrice,
        paymentResult
      };

      const { data } = await axios.post('http://localhost:5000/api/orders', orderData);
      
      setOrderSuccess(data);
      clearCart();
      addToast('Order placed successfully!', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Error placing order', 'error');
    }
    setLoading(false);
  };

  // Render Post placement Success screen
  if (orderSuccess) {
    return (
      <div className="container" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="glass-panel" style={{ padding: '48px', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(142, 60%, 95%)', display: 'flex', alignItems: 'center', justifyCentert: 'center', color: 'hsl(142, 70%, 40%)' }}>
            <ShieldCheck size={48} style={{ margin: 'auto' }} />
          </div>
          <div>
            <h1>Order Confirmed!</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>
          
          <div className="glass-panel" style={{ width: '100%', padding: '20px', borderRadius: 'var(--radius-sm)', textAlign: 'left', background: 'var(--bg-primary)' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Order ID:</span>
              <p style={{ fontWeight: 'bold' }}>{orderSuccess._id}</p>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Shipping Address:</span>
              <p style={{ fontSize: '0.9rem' }}>
                {orderSuccess.shippingAddress.fullName}, {orderSuccess.shippingAddress.street}, {orderSuccess.shippingAddress.city}, {orderSuccess.shippingAddress.zipCode}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Total Amount:</span>
              <p style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.2rem' }}>₹{orderSuccess.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <Link to="/order-history" className="btn btn-secondary" style={{ flexGrow: 1, padding: '12px' }}>
              View Order History
            </Link>
            <Link to="/" className="btn btn-primary" style={{ flexGrow: 1, padding: '12px' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      {/* Step Stepper Progress Indicators */}
      <nav className="checkout-steps-nav">
        <div className={`checkout-step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="checkout-step-circle">{step > 1 ? '✓' : '1'}</div>
          <span className="checkout-step-label">Shipping Address</span>
        </div>
        <div className={`checkout-step-indicator ${step >= 2 ? 'active' : ''}`}>
          <div className="checkout-step-circle">2</div>
          <span className="checkout-step-label">Review & Payment</span>
        </div>
      </nav>

      {/* Grid: Forms vs Summary card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '32px' }}>
        <div>
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h2 style={{ marginBottom: '20px' }}>Select Shipping Address</h2>

              {user?.addresses && user.addresses.length > 0 ? (
                <div className="addresses-select-grid">
                  {user.addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddressId(address._id)}
                      className={`address-select-card ${selectedAddressId === address._id ? 'selected' : ''}`}
                    >
                      <span className="address-type-tag">{address.type}</span>
                      <strong style={{ display: 'block', marginBottom: '8px' }}>{address.fullName}</strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {address.street}, {address.city}, {address.state} - {address.zipCode}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '8px' }}>
                        Phone: {address.phone}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px 0', color: 'var(--text-light)', textAlign: 'center' }}>
                  No shipping addresses saved. Please add a new address below.
                </div>
              )}

              {/* Add New Address Button */}
              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  <MapPin size={16} /> Add New Address
                </button>
              ) : (
                <form onSubmit={handleAddAddress} style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Add Address Details</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group-field">
                      <label className="form-label-txt">Address Type</label>
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
                      Save Address
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Step navigations */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button
                  disabled={!selectedAddressId}
                  onClick={() => setStep(2)}
                  className="btn btn-primary"
                  style={{ padding: '12px 24px' }}
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD & PLACE */}
          {step === 2 && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h2 style={{ marginBottom: '20px' }}>Select Payment Method</h2>

              <div className="payment-sim-options">
                {/* Credit card sim */}
                <div
                  onClick={() => setPaymentMethod('Card')}
                  className={`payment-sim-option-card ${paymentMethod === 'Card' ? 'selected' : ''}`}
                >
                  <CreditCard size={20} color={paymentMethod === 'Card' ? 'var(--primary)' : 'currentColor'} />
                  <div>
                    <strong style={{ display: 'block' }}>Credit / Debit Card Simulation</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Secure transactions using 3D secure simulation.</span>
                  </div>
                </div>

                {/* UPI Sim */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`payment-sim-option-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                >
                  <Landmark size={20} color={paymentMethod === 'UPI' ? 'var(--primary)' : 'currentColor'} />
                  <div>
                    <strong style={{ display: 'block' }}>UPI Instant Payment Simulation</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Pay instantly using QR or virtual address simulation.</span>
                  </div>
                </div>

                {/* Wallet Sim */}
                <div
                  onClick={() => setPaymentMethod('Wallet')}
                  className={`payment-sim-option-card ${paymentMethod === 'Wallet' ? 'selected' : ''}`}
                >
                  <Wallet size={20} color={paymentMethod === 'Wallet' ? 'var(--primary)' : 'currentColor'} />
                  <div>
                    <strong style={{ display: 'block' }}>ShopEZ Digital Wallet</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Pay using your pre-loaded wallet balances.</span>
                  </div>
                </div>

                {/* COD option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`payment-sim-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                >
                  <Truck size={20} color={paymentMethod === 'COD' ? 'var(--primary)' : 'currentColor'} />
                  <div>
                    <strong style={{ display: 'block' }}>Cash On Delivery (COD)</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Pay in cash or card at the time of delivery.</span>
                  </div>
                </div>
              </div>

              {/* Conditional forms based on selected option */}
              {paymentMethod === 'Card' && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                  <h3>Enter Card Details</h3>

                  {/* 3D Animated Card Preview Component */}
                  <div className="credit-card-preview">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.2rem', fontStyle: 'italic' }}>VISA</span>
                      <ShieldCheck size={24} />
                    </div>
                    <div style={{ fontSize: '1.3rem', letterSpacing: '2px', fontFamily: 'monospace', margin: '20px 0 10px 0' }}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Cardholder</span>
                        <strong>{cardName.toUpperCase() || 'YOUR NAME'}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Expires</span>
                        <strong>{cardExpiry || 'MM/YY'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Fields input */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group-field">
                      <label className="form-label-txt">Card Number</label>
                      <input
                        type="text"
                        className="form-input-val"
                        placeholder="4111 2222 3333 4444"
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      />
                    </div>
                    <div className="form-group-field">
                      <label className="form-label-txt">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-input-val"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group-field">
                      <label className="form-label-txt">Expiry Date</label>
                      <input
                        type="text"
                        className="form-input-val"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="form-group-field">
                      <label className="form-label-txt">CVV Code</label>
                      <input
                        type="password"
                        className="form-input-val"
                        placeholder="•••"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                  <h3>UPI Configuration</h3>
                  <div className="form-group-field">
                    <label className="form-label-txt">UPI Address</label>
                    <input
                      type="text"
                      className="form-input-val"
                      placeholder="username@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Wallet' && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px', padding: '16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', fontWeight: 'bold' }}>
                  Wallet simulation selected. Your current balance ($500.00) is sufficient to cover this order.
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Cash On Delivery selected. You will pay the delivery agent in cash or card when they hand over the parcel.
                </div>
              )}

              {/* Step navigations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-secondary"
                  style={{ padding: '12px 24px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Address</span>
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="btn btn-primary"
                  style={{ padding: '12px 24px' }}
                  disabled={loading}
                >
                  <span>{loading ? 'Processing...' : 'Place Order'}</span>
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary layout card */}
        <div>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '16px' }}>Checkout Summary</h3>

            {/* Cart item snapshots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              {cartItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem' }}>
                  <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f7' }} />
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <p style={{ fontWeight: 'bold', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.name}
                    </p>
                    <span style={{ color: 'var(--text-light)' }}>Qty: {item.qty}</span>
                  </div>
                  <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            {/* Price lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContet: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Items Price</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContet: 'space-between', justifyContent: 'space-between', color: 'hsl(142, 70%, 40%)' }}>
                  <span>Discounts Applied</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContet: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping Fees</span>
                <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContet: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Tax</span>
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContet: 'space-between', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>Grand Total</strong>
              <strong style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>₹{totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
