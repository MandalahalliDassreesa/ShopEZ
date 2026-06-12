import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, ShoppingCart, Award, CheckCircle, Info, ChevronRight } from 'lucide-react';
import axios from 'axios';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user, trackRecentlyViewed } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlistItems } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  
  // Gallery
  const [selectedImage, setSelectedImage] = useState('');

  // Selected Variant options
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');

  // Quantity selector
  const [qty, setQty] = useState(1);

  // Recommendations lists
  const [recommendations, setRecommendations] = useState({
    related: [],
    similar: [],
    frequentlyBought: []
  });

  // Reviews list
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  // Load product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);
        setSelectedImage(data.images[0] || '');
        setQty(1);

        // Pre-select first variant attributes
        if (data.variants && data.variants.length > 0) {
          const first = data.variants[0];
          setSelectedSize(first.size || '');
          setSelectedColor(first.color || '');
          setSelectedStorage(first.storage || '');
          setSelectedWeight(first.weight || '');
        }

        // Trigger recently viewed track
        if (user) {
          trackRecentlyViewed(data._id);
        }

        // Fetch Recommendations
        const recRes = await axios.get(`http://localhost:5000/api/products/${id}/recommendations`);
        setRecommendations(recRes.data);

        // Fetch Reviews
        const revRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReviews(revRes.data);
      } catch (error) {
        console.error('Error loading product page:', error.message);
        addToast('Error loading product details', 'error');
      }
      setLoading(false);
    };

    fetchProductDetails();
  }, [id, user]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="product-detail-layout">
          <div className="skeleton-box" style={{ height: '380px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton-box" style={{ height: '32px', width: '80%' }}></div>
            <div className="skeleton-box" style={{ height: '18px', width: '30%' }}></div>
            <div className="skeleton-box" style={{ height: '80px', width: '100%' }}></div>
            <div className="skeleton-box" style={{ height: '48px', width: '50%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="container">Product not found</div>;

  // Variant resolution logic
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const storages = [...new Set(product.variants.map((v) => v.storage).filter(Boolean))];
  const weights = [...new Set(product.variants.map((v) => v.weight).filter(Boolean))];

  // Find currently matched variant inside selection
  const matchedVariant = product.variants.find((v) => {
    const sizeMatch = !selectedSize || v.size === selectedSize;
    const colorMatch = !selectedColor || v.color === selectedColor;
    const storageMatch = !selectedStorage || v.storage === selectedStorage;
    const weightMatch = !selectedWeight || v.weight === selectedWeight;
    return sizeMatch && colorMatch && storageMatch && weightMatch;
  }) || product.variants[0] || { stockQuantity: 0, priceAdjustment: 0 };

  const currentPrice = product.price + (matchedVariant.priceAdjustment || 0);
  const finalPrice = currentPrice * (1 - (product.discountPercentage || 0) / 100);
  const totalStock = matchedVariant.stockQuantity;

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);

  const handleAddToCart = () => {
    if (totalStock <= 0) {
      addToast('Product is currently out of stock', 'error');
      return;
    }

    addToCart(product, qty, {
      size: selectedSize,
      color: selectedColor,
      storage: selectedStorage,
      weight: selectedWeight
    });
    addToast(`${product.name} added to Cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (totalStock <= 0) {
      addToast('Product is currently out of stock', 'error');
      return;
    }

    addToCart(product, qty, {
      size: selectedSize,
      color: selectedColor,
      storage: selectedStorage,
      weight: selectedWeight
    });
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(product);
    if (added) {
      addToast(`${product.name} added to Wishlist!`, 'success');
    } else {
      addToast(`${product.name} removed from Wishlist`, 'info');
    }
  };

  // Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to post a review', 'error');
      navigate('/login');
      return;
    }

    try {
      const { data } = await axios.post(`http://localhost:5000/api/reviews/${product._id}`, {
        rating: newRating,
        comment: newComment
      });

      addToast('Review submitted successfully!', 'success');
      setReviews([data, ...reviews]);
      setNewComment('');
      
      // Update local rating calculation snapshot
      const updatedProduct = await axios.get(`http://localhost:5000/api/products/${product._id}`);
      setProduct(updatedProduct.data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Error submitting review', 'error');
    }
  };

  // Helpfulness review vote
  const handleReviewHelpful = async (reviewId) => {
    if (!user) {
      addToast('Please login to vote on reviews', 'error');
      return;
    }

    try {
      const { data } = await axios.post(`http://localhost:5000/api/reviews/${reviewId}/helpful`);
      setReviews((prev) => prev.map((rev) => (rev._id === reviewId ? data : rev)));
    } catch (error) {
      addToast('Error voting review helpfulness', 'error');
    }
  };

  return (
    <div className="container">
      {/* Category Trail Breadcrumbs */}
      <div className="detail-category-trail" style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to={`/?category=${product.category}`}>{product.category}</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </div>

      {/* Main product gallery and details */}
      <div className="product-detail-layout">
        {/* Gallery */}
        <div className="detail-img-gallery">
          <div className="detail-main-img-box">
            <img src={selectedImage} alt={product.name} className="detail-main-img" />
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={product.name}
                onClick={() => setSelectedImage(img)}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedImage === img ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: '#f5f5f7'
                }}
              />
            ))}
          </div>
        </div>

        {/* Content details */}
        <div className="detail-content-box">
          <span className="badge-tag trending" style={{ marginBottom: '8px' }}>
            {product.category}
          </span>
          <h1 className="detail-title">{product.name}</h1>
          <span className="detail-brand-lbl">Brand: <strong>{product.brand}</strong></span>

          {/* Rating Summary */}
          <div className="product-rating-row" style={{ fontSize: '1rem', marginBottom: '20px' }}>
            <StarRating rating={product.rating} />
            <span><strong>{product.rating}</strong> / 5</span>
            <span style={{ color: 'var(--text-light)' }}>|</span>
            <span>{product.numReviews} Verified Reviews</span>
          </div>

          {/* Price Breakdown */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{finalPrice.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '1.2rem' }}>₹{currentPrice.toFixed(2)}
                </span>
                <span className="badge-tag flash" style={{ fontSize: '0.85rem' }}>
                  {product.discountPercentage}% OFF
                </span>
              </>
            )}
            {product.isBOGO && (
              <span className="badge-tag trending" style={{ fontSize: '0.85rem' }}>
                Buy One Get One Free
              </span>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          {/* Variants Selectors */}
          {product.variants.length > 0 && (
            <div className="variant-picker-section">
              {/* Color option */}
              {colors.length > 0 && (
                <div className="variant-picker-group">
                  <span className="variant-picker-label">Color: {selectedColor}</span>
                  <div className="variant-options-list">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setQty(1);
                        }}
                        className={`variant-chip ${selectedColor === color ? 'selected' : ''}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size option */}
              {sizes.length > 0 && (
                <div className="variant-picker-group">
                  <span className="variant-picker-label">Size: {selectedSize}</span>
                  <div className="variant-options-list">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setQty(1);
                        }}
                        className={`variant-chip ${selectedSize === size ? 'selected' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage options */}
              {storages.length > 0 && (
                <div className="variant-picker-group">
                  <span className="variant-picker-label">Storage Capacity: {selectedStorage}</span>
                  <div className="variant-options-list">
                    {storages.map((storage) => (
                      <button
                        key={storage}
                        onClick={() => {
                          setSelectedStorage(storage);
                          setQty(1);
                        }}
                        className={`variant-chip ${selectedStorage === storage ? 'selected' : ''}`}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight options */}
              {weights.length > 0 && (
                <div className="variant-picker-group">
                  <span className="variant-picker-label">Weight Options: {selectedWeight}</span>
                  <div className="variant-options-list">
                    {weights.map((weight) => (
                      <button
                        key={weight}
                        onClick={() => {
                          setSelectedWeight(weight);
                          setQty(1);
                        }}
                        className={`variant-chip ${selectedWeight === weight ? 'selected' : ''}`}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Qty widget & Stock indicators */}
          <div className="qty-stock-section">
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Quantity:</span>
            <div className="qty-input-widget">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="qty-input-btn"
                disabled={qty <= 1}
              >
                -
              </button>
              <span className="qty-input-value">{qty}</span>
              <button
                onClick={() => setQty(Math.min(totalStock, qty + 1))}
                className="qty-input-btn"
                disabled={qty >= totalStock}
              >
                +
              </button>
            </div>

            <div className="stock-indicator">
              {totalStock > 10 ? (
                <span className="stock-indicator in-stock">✓ In Stock ({totalStock})</span>
              ) : totalStock > 0 ? (
                <span className="stock-indicator low-stock">⚠ Low Stock! Only {totalStock} items left</span>
              ) : (
                <span className="stock-indicator out-of-stock">✗ Out of Stock</span>
              )}
            </div>
          </div>

          {/* Main Action buttons */}
          <div className="action-buttons-group">
            <button
              onClick={handleAddToCart}
              className="btn btn-secondary"
              disabled={totalStock <= 0}
            >
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="btn btn-primary"
              disabled={totalStock <= 0}
            >
              <ShoppingBag size={18} />
              <span>Buy Now</span>
            </button>
            <button
              onClick={handleWishlistToggle}
              className="btn btn-secondary"
              style={{ flexGrow: 0, width: '48px', height: '48px', padding: 0 }}
              title="Add to Wishlist"
            >
              <Heart size={18} fill={isWishlisted ? 'hsl(0, 84%, 55%)' : 'none'} color={isWishlisted ? 'hsl(0, 84%, 55%)' : 'currentColor'} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs list (Detailed Description / Product Reviews) */}
      <section style={{ margin: '60px 0' }}>
        <div className="detail-tabs-header">
          <button
            onClick={() => setActiveTab('description')}
            className={`tab-nav-btn ${activeTab === 'description' ? 'active' : ''}`}
          >
            Details & Features
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`tab-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'description' ? (
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '16px' }}>Product Specifications</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {product.features && product.features.map((feat, idx) => (
                <li key={idx} style={{ color: 'var(--text-secondary)' }}>{feat}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="reviews-tab-layout">
            {/* Reviews display list */}
            <div>
              <h3>Customer Reviews</h3>
              {reviews.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--text-light)' }}>No reviews yet for this product. Be the first to write one!</div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="review-card-item">
                    <div className="review-author-row">
                      <span className="review-author-name">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="review-verified-badge" title="Purchased this item on ShopEZ">
                          <CheckCircle size={10} style={{ display: 'inline', marginRight: '4px' }} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <StarRating rating={rev.rating} size={14} />
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                    <div className="review-helpful-vote-row">
                      <span>Was this review helpful?</span>
                      <button
                        onClick={() => handleReviewHelpful(rev._id)}
                        className={`review-helpful-btn ${user && rev.votedUsers?.includes(user._id) ? 'active' : ''}`}
                      >
                        Helpful ({rev.helpfulVotes || 0})
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Review creation form */}
            <div>
              <div className="glass-panel add-review-form-box" style={{ borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ marginBottom: '16px' }}>Write a Review</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group-field">
                    <label className="form-label-txt">Overall Rating</label>
                    <StarRating
                      interactive={true}
                      rating={newRating}
                      onChange={(val) => setNewRating(val)}
                      size={24}
                    />
                  </div>
                  <div className="form-group-field">
                    <label className="form-label-txt">Review Comment</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Write your experience with the product..."
                      className="form-textarea-box"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', width: '100%' }}>
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Recommendations Slider Sections */}
      <section style={{ margin: '60px 0 20px 0' }}>
        <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          Frequently Bought Together
        </h2>
        <div className="product-grid">
          {recommendations.frequentlyBought && recommendations.frequentlyBought.map((p) => (
            <Link to={`/product/${p._id}`} key={p._id} className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <img src={p.images[0]} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f7' }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h4>
                <div style={{ display: 'flex', color: 'var(--accent)', fontSize: '0.8rem' }}>★ {p.rating}</div>
                <strong style={{ fontSize: '0.95rem' }}>₹{p.price.toFixed(2)}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ margin: '40px 0' }}>
        <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          Similar Products Recommendations
        </h2>
        <div className="product-grid">
          {recommendations.similar && recommendations.similar.slice(0, 4).map((p) => (
            <Link to={`/product/${p._id}`} key={p._id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px', background: '#f5f5f7' }} />
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.6rem' }}>{p.name}</h4>
              <div style={{ display: 'flex', color: 'var(--accent)', fontSize: '0.8rem', marginBottom: '8px' }}>★ {p.rating}</div>
              <strong style={{ marginTop: 'auto' }}>₹{p.price.toFixed(2)}</strong>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
