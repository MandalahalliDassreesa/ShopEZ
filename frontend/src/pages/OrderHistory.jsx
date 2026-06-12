import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Circle, AlertCircle, Calendar, DollarSign, Package, MapPin } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../components/Toast';

const deliveryStages = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderHistory = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/orders/myorders');
        setOrders(data);
        if (data.length > 0) {
          setActiveTrackingOrderId(data[0]._id); // default trace first order
        }
      } catch (error) {
        console.error('Error loading order history:', error.message);
        addToast('Error loading orders', 'error');
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="skeleton-box" style={{ height: '100px', width: '100%', marginBottom: '20px' }}></div>
        <div className="skeleton-box" style={{ height: '300px', width: '100%' }}></div>
      </div>
    );
  }

  const trackingOrder = orders.find(o => o._id === activeTrackingOrderId);

  // Return step status
  const getStageStatus = (order, stage) => {
    const orderIndex = deliveryStages.indexOf(order.deliveryStatus);
    const stageIndex = deliveryStages.indexOf(stage);

    if (stageIndex < orderIndex) return 'completed';
    if (stageIndex === orderIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '48px',
            textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Package size={48} color="var(--text-light)" />
          <h2>No Orders Placed Yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't purchased any items yet. Start shopping now!</p>
          <a href="/" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Browse Products
          </a>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.7fr 1fr',
            gap: '32px'
          }}
        >
          {/* 1. Orders List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => setActiveTrackingOrderId(order._id)}
                className={`glass-panel ${activeTrackingOrderId === order._id ? 'active-order-glow' : ''}`}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  border: activeTrackingOrderId === order._id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Order ID:</span>
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{order._id}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Placed on:</span>
                    <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Total:</span>
                    <p style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--primary)' }}>₹{order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>

                {/* Items snapshot list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {order.orderItems.map((item, idx) => {
                    const variantStr = [
                      item.variant?.size && `Size: ${item.variant.size}`,
                      item.variant?.color && `Color: ${item.variant.color}`,
                      item.variant?.storage && `Storage: ${item.variant.storage}`,
                      item.variant?.weight && `Weight: ${item.variant.weight}`
                    ].filter(Boolean).join(', ');

                    return (
                      <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f7' }} />
                        <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</span>
                          {variantStr && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{variantStr}</p>
                          )}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qty: {item.qty}</span>
                        <strong>₹{(item.price * item.qty).toFixed(2)}</strong>
                      </div>
                    );
                  })}
                </div>

                {/* Status bottom tags */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--text-light)' }}>Payment:</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        background: order.isPaid ? 'hsl(142, 60%, 95%)' : 'hsl(0, 100%, 94%)',
                        color: order.isPaid ? 'hsl(142, 70%, 30%)' : 'hsl(0, 100%, 35%)'
                      }}
                    >
                      {order.isPaid ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <span style={{ color: 'var(--text-light)' }}>Delivery:</span>
                    <span style={{ fontWeight: 'bold', color: order.deliveryStatus === 'Delivered' ? 'hsl(142, 70%, 40%)' : 'var(--primary)' }}>
                      {order.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Order Tracking Detail Stepper */}
          <div>
            {trackingOrder ? (
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', position: 'sticky', top: '100px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} />
                  <span>Order Tracking</span>
                </h3>
                
                <div style={{ marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Tracking Order: <strong>{trackingOrder._id}</strong></span>
                </div>

                {/* Vertical Stepper tracker layout */}
                <div className="tracking-stepper-wrapper">
                  {deliveryStages.map((stage, index) => {
                    const status = getStageStatus(trackingOrder, stage);
                    
                    let dateText = '';
                    if (stage === 'Processing') {
                      dateText = new Date(trackingOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    } else if (stage === 'Delivered' && trackingOrder.deliveredAt) {
                      dateText = new Date(trackingOrder.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    }

                    return (
                      <div key={index} className={`tracking-step-row ${status}`}>
                        <div className="tracking-step-dot"></div>
                        <span className="tracking-step-title">{stage}</span>
                        {dateText && <p className="tracking-step-date">{dateText}</p>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <MapPin size={14} /> Shipping Destination
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>{trackingOrder.shippingAddress.fullName}</strong><br />
                    {trackingOrder.shippingAddress.street}, {trackingOrder.shippingAddress.city}, {trackingOrder.shippingAddress.state} - {trackingOrder.shippingAddress.zipCode}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px 0' }}>
                Select an order to view live tracking details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
