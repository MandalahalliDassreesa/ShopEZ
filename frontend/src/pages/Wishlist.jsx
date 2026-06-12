import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, moveWishlistItemToCart } = useWishlist();
  const { addToast } = useToast();

  const handleMoveToCart = (product) => {
    // Check stock for default variant
    const defaultVariant = product.variants[0] || { stockQuantity: 0 };
    if (defaultVariant.stockQuantity <= 0) {
      addToast('Sorry, this product variant is out of stock', 'error');
      return;
    }

    moveWishlistItemToCart(product, {
      size: defaultVariant.size,
      color: defaultVariant.color,
      storage: defaultVariant.storage,
      weight: defaultVariant.weight
    });
    addToast(`${product.name} moved to Cart!`, 'success');
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Heart size={28} fill="hsl(0, 84%, 55%)" color="hsl(0, 84%, 55%)" />
        <span>My Wishlist</span>
      </h1>

      {wishlistItems.length === 0 ? (
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
          <Heart size={48} color="var(--text-light)" />
          <h2>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any products to your wishlist yet.</p>
          <Link to="/" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Go Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistItems.map((product) => {
            const finalPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
            return (
              <div key={product._id} className="product-card-item glass-card">
                <div className="product-card-img-box">
                  <img src={product.images[0]} alt={product.name} className="product-card-img" />
                  <button
                    onClick={() => {
                      removeFromWishlist(product._id);
                      addToast(`${product.name} removed from Wishlist`, 'info');
                    }}
                    className="wishlist-toggle-btn active"
                    title="Remove from Wishlist"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>

                <div className="product-card-details">
                  <span className="product-card-brand">{product.brand}</span>
                  <h3 className="product-card-title">
                    <Link to={`/product/${product._id}`}>{product.name}</Link>
                  </h3>

                  <div className="product-card-price-row" style={{ marginTop: 'auto' }}>
                    <span className="product-curr-price">₹{finalPrice.toFixed(2)}</span>
                    {product.discountPercentage > 0 && (
                      <span className="product-orig-price">₹{product.price}</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '0 16px 16px 16px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="btn btn-primary"
                    style={{ flexGrow: 1, padding: '10px' }}
                  >
                    <ShoppingCart size={16} />
                    <span>Move to Cart</span>
                  </button>
                  <button
                    onClick={() => {
                      removeFromWishlist(product._id);
                      addToast('Removed from Wishlist', 'info');
                    }}
                    className="btn btn-secondary"
                    style={{ width: '40px', height: '40px', padding: 0 }}
                    title="Delete"
                  >
                    <Trash2 size={16} color="hsl(0, 84%, 55%)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
