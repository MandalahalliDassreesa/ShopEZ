import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShieldAlert, Sparkles, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

const Cart = () => {
  const {
    cartItems,
    saveForLaterItems,
    appliedCoupon,
    removeFromCart,
    updateCartQty,
    saveForLater,
    moveToCart,
    removeSaveForLater,
    applyCouponCode,
    removeCoupon,
    getTotals
  } = useCart();

  const { addToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const {
    itemsPrice,
    bogoDiscount,
    couponDiscount,
    discountAmount,
    taxPrice,
    shippingPrice,
    totalPrice,
    deliveryEstimate
  } = getTotals();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    const result = await applyCouponCode(couponCode.trim());
    setCouponLoading(false);

    if (result.success) {
      addToast(`Coupon "${couponCode.toUpperCase()}" applied successfully!`, 'success');
      setCouponCode('');
    } else {
      addToast(result.message, 'error');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    addToast('Coupon code removed', 'info');
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '48px',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px'
          }}
        >
          <ShoppingBag size={48} color="var(--text-light)" />
          <h2>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Add products to your cart to begin shopping.</p>
          <Link to="/" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-page-layout">
          {/* 1. Items List */}
          <div className="cart-items-panel">
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {cartItems.map((item, index) => {
                const variantString = [
                  item.variant.size && `Size: ${item.variant.size}`,
                  item.variant.color && `Color: ${item.variant.color}`,
                  item.variant.storage && `Storage: ${item.variant.storage}`,
                  item.variant.weight && `Weight: ${item.variant.weight}`
                ].filter(Boolean).join(', ');

                return (
                  <div
                    key={index}
                    className="cart-item-row"
                    style={{
                      borderBottom: index < cartItems.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <div className="cart-item-img-box">
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                    </div>

                    <div className="cart-item-info">
                      <h3 className="cart-item-title">
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                      </h3>
                      {variantString && (
                        <p className="cart-item-variant-label">{variantString}</p>
                      )}
                      
                      {item.isBOGO && (
                        <span className="badge-tag trending" style={{ fontSize: '0.7rem', padding: '2px 8px', marginBottom: '8px', display: 'inline-block' }}>
                          BOGO Applied
                        </span>
                      )}

                      <div className="cart-item-actions-row">
                        {/* Qty widgets */}
                        <div className="qty-input-widget" style={{ scale: '0.9' }}>
                          <button
                            onClick={() => updateCartQty(item.product, item.variant, item.qty - 1)}
                            className="qty-input-btn"
                            disabled={item.qty <= 1}
                          >
                            -
                          </button>
                          <span className="qty-input-value">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.product, item.variant, item.qty + 1)}
                            className="qty-input-btn"
                            disabled={item.qty >= item.maxStock}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => saveForLater(item)}
                          className="cart-item-action-btn"
                        >
                          Save for Later
                        </button>

                        <button
                          onClick={() => {
                            removeFromCart(item.product, item.variant);
                            addToast('Item removed from cart', 'info');
                          }}
                          className="cart-item-action-btn"
                          style={{ color: 'hsl(0, 84%, 55%)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-price-col">
                      <span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
                      {item.qty > 1 && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                          (${item.price.toFixed(2)} each)
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Order Summary Card */}
          <div className="cart-summary-panel">
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Order Summary</h3>

              {/* Coupon Form */}
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    className="form-input-val"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '10px 16px' }} disabled={couponLoading}>
                    Apply
                  </button>
                </form>
              ) : (
                <div className="coupon-status-applied">
                  <span>Code Applied: <strong>{appliedCoupon.code}</strong> (-${appliedCoupon.discountAmount.toFixed(2)})</span>
                  <button onClick={handleRemoveCoupon} className="coupon-remove-btn">
                    Remove
                  </button>
                </div>
              )}

              {/* Price rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span>${itemsPrice.toFixed(2)}</span>
                </div>
                {bogoDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(142, 70%, 40%)' }}>
                    <span>BOGO Promotion</span>
                    <span>-${bogoDiscount.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(142, 70%, 40%)' }}>
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping Fees</span>
                  <span>{shippingPrice === 0 ? <strong style={{ color: 'hsl(142, 70%, 40%)' }}>FREE</strong> : `$${shippingPrice.toFixed(2)}`}</span>
                </div>
                {shippingPrice > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '-8px' }}>
                    Add ${(150 - (itemsPrice - discountAmount)).toFixed(2)} more for FREE shipping
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated Tax (8%)</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                <strong style={{ fontSize: '1.2rem' }}>Total Price</strong>
                <strong style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>${totalPrice.toFixed(2)}</strong>
              </div>

              {/* Shipping Date Estimate */}
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '8px', marginBottom: '24px', fontSize: '0.85rem' }}>
                <ShieldAlert size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ fontWeight: 600 }}>Estimated Delivery Date:</span>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {deliveryEstimate.min} - {deliveryEstimate.max}
                  </p>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Save for Later list */}
      {saveForLaterItems.length > 0 && (
        <section style={{ margin: '60px 0 20px 0', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Save for Later ({saveForLaterItems.length})</h2>
          <div className="product-grid">
            {saveForLaterItems.map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f7' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.name}
                  </h4>
                  <strong style={{ display: 'block', margin: '4px 0', fontSize: '1rem' }}>${item.price.toFixed(2)}</strong>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        moveToCart(item);
                        addToast(`${item.name} moved back to Cart!`, 'success');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => {
                        removeSaveForLater(item.product);
                        addToast('Saved item deleted', 'info');
                      }}
                      style={{ background: 'transparent', color: 'hsl(0, 84%, 55%)', fontSize: '0.75rem', fontWeight: 'bold' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Cart;
