import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, GitCompare } from 'lucide-react';
import { motion } from 'framer-motion';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from './Toast';

const ProductCard = ({ product, compareList = [], onToggleCompare }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, wishlistItems } = useWishlist();
  const { addToast } = useToast();

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);
  const isCompared = compareList.some((item) => item._id === product._id);

  const discountedPrice = product.price * (1 - (product.discountPercentage || 0) / 100);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      addToast(`${product.name} added to Wishlist!`, 'success');
    } else {
      addToast(`${product.name} removed from Wishlist`, 'info');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check stock in default variant
    const defaultVariant = product.variants[0] || { stockQuantity: 0 };
    if (defaultVariant.stockQuantity <= 0) {
      addToast('Sorry, this product variant is out of stock', 'error');
      return;
    }

    addToCart(product, 1, {
      size: defaultVariant.size,
      color: defaultVariant.color,
      storage: defaultVariant.storage,
      weight: defaultVariant.weight
    });
    addToast(`${product.name} added to Cart!`, 'success');
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    if (onToggleCompare) {
      onToggleCompare(product);
    }
  };

  return (
    <motion.div 
      className="product-card-item glass-card"
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ overflow: 'hidden' }}
    >
      <Link to={`/product/${product._id}`} style={{ display: 'block' }}>
        <div className="product-card-img-box">
          <img
            src={product.images[0]}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
          />
          {product.discountPercentage > 0 && (
            <span className="product-card-badge badge-tag flash">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isBOGO && (
            <span
              className="product-card-badge badge-tag trending"
              style={{ top: product.discountPercentage > 0 ? '40px' : '12px' }}
            >
              BOGO
            </span>
          )}
          <button
            onClick={handleWishlistClick}
            className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
            title="Add to Wishlist"
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="product-card-details">
          <span className="product-card-brand">{product.brand}</span>
          <h3 className="product-card-title">{product.name}</h3>
          
          <div className="product-rating-row">
            <StarRating rating={product.rating} size={14} />
            <span>({product.numReviews})</span>
          </div>

          <div className="product-card-price-row">
            <span className="product-curr-price">
              ${discountedPrice.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span className="product-orig-price">${product.price}</span>
              </>
            )}
          </div>
        </div>
      </Link>

      <div style={{ padding: '0 16px 16px 16px', display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button
          onClick={handleAddToCart}
          className="btn btn-primary product-card-btn-action"
          title="Add to Cart"
        >
          <ShoppingCart size={16} />
          <span>Add</span>
        </button>
        <button
          onClick={handleCompareClick}
          className="btn btn-secondary"
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center' }}
          title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
        >
          <GitCompare size={16} color={isCompared ? 'var(--primary)' : 'currentColor'} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
