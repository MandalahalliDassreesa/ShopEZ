import React from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';

const ProductComparisonModal = ({ products, onClose }) => {
  if (products.length === 0) return null;

  return (
    <div className="compare-modal-overlay">
      <div className="compare-modal-box glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Product Comparison</h2>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Features</th>
                {products.map((p) => {
                  const finalPrice = p.price * (1 - (p.discountPercentage || 0) / 100);
                  return (
                    <th key={p._id}>
                      <div className="compare-product-header">
                        <img src={p.images[0]} alt={p.name} className="compare-product-img" />
                        <span className="compare-product-name">{p.name}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{finalPrice.toFixed(2)}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Brand</td>
                {products.map((p) => <td key={p._id}>{p.brand}</td>)}
              </tr>
              <tr>
                <td>Category</td>
                {products.map((p) => <td key={p._id}>{p.category}</td>)}
              </tr>
              <tr>
                <td>Rating</td>
                {products.map((p) => (
                  <td key={p._id}>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>★ {p.rating}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}> ({p.numReviews} reviews)</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Discount</td>
                {products.map((p) => (
                  <td key={p._id} style={{ color: p.discountPercentage > 0 ? 'hsl(142, 70%, 40%)' : 'inherit' }}>
                    {p.discountPercentage > 0 ? `${p.discountPercentage}% Off` : 'None'}
                  </td>
                ))}
              </tr>
              <tr>
                <td>BOGO Offer</td>
                {products.map((p) => (
                  <td key={p._id}>
                    {p.isBOGO ? (
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Yes</span>
                    ) : 'No'}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Inventory Stock</td>
                {products.map((p) => {
                  const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
                  return (
                    <td key={p._id}>
                      {totalStock > 0 ? (
                        <span style={{ color: 'hsl(142, 70%, 40%)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> In Stock ({totalStock})
                        </span>
                      ) : (
                        <span style={{ color: 'hsl(0, 84%, 55%)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> Out of Stock
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td>Key Features</td>
                {products.map((p) => (
                  <td key={p._id} style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                    <ul style={{ paddingLeft: '16px' }}>
                      {p.features.map((f, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{f}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonModal;
