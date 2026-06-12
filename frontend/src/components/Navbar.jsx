import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Sun, Moon, Search, User, LogOut, ChevronDown, Clock, Sparkles, Smartphone, Tv, Watch, Shirt, Footprints, ShoppingBag, Sparkles as SparklesIcon, BookOpen, Dumbbell, Apple } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useTransition } from '../context/TransitionContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { triggerTransition } = useTransition();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cart item count (sum of all quantities)
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Monitor Scroll for sticky styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch autocomplete suggestions when typing
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/products?limit=5&keyword=${searchQuery}`
        );
        setSuggestions(data.products || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error.message);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside search or dropdown closures
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeSearch(searchQuery.trim());
    }
  };

  const executeSearch = (query) => {
    // Save to recent searches
    const updatedRecents = [query, ...recentSearches.filter((q) => q !== query)].slice(0, 5);
    setRecentSearches(updatedRecents);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecents));

    setShowSuggestions(false);
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (productName) => {
    setSearchQuery(productName);
    executeSearch(productName);
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    executeSearch(query);
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <header className={`navbar-header glass-panel ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="logo-brand">
          <Sparkles size={24} fill="var(--primary)" />
          <span>ShopEZ</span>
        </Link>

        {/* Mega Menu Selector */}
        <div className="mega-menu-trigger nav-link-btn" style={{ fontSize: '0.95rem' }}>
          <span>Categories</span>
          <ChevronDown size={14} />
          <div className="mega-menu-content glass-panel">
            <div className="mega-menu-column">
              <h4>Electronics & Home</h4>
              <ul>
                <li><Link to="/?category=Electronics" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Electronics', '/?category=Electronics'); }}>
                  <div className="menu-icon-wrapper"><Smartphone size={18} /></div><span>Electronics</span>
                </Link></li>
                <li><Link to="/?category=Home Appliances" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Home Appliances', '/?category=Home Appliances'); }}>
                  <div className="menu-icon-wrapper"><Tv size={18} /></div><span>Home Appliances</span>
                </Link></li>
                <li><Link to="/?category=Watches" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Watches', '/?category=Watches'); }}>
                  <div className="menu-icon-wrapper"><Watch size={18} /></div><span>Watches</span>
                </Link></li>
              </ul>
            </div>
            <div className="mega-menu-column">
              <h4>Lifestyle & Apparel</h4>
              <ul>
                <li><Link to="/?category=Fashion" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Fashion', '/?category=Fashion'); }}>
                  <div className="menu-icon-wrapper"><Shirt size={18} /></div><span>Fashion Wear</span>
                </Link></li>
                <li><Link to="/?category=Footwear" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Footwear', '/?category=Footwear'); }}>
                  <div className="menu-icon-wrapper"><Footprints size={18} /></div><span>Footwear</span>
                </Link></li>
                <li><Link to="/?category=Accessories" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Accessories', '/?category=Accessories'); }}>
                  <div className="menu-icon-wrapper"><ShoppingBag size={18} /></div><span>Accessories</span>
                </Link></li>
                <li><Link to="/?category=Beauty" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Beauty', '/?category=Beauty'); }}>
                  <div className="menu-icon-wrapper"><SparklesIcon size={18} /></div><span>Beauty & Cosmetics</span>
                </Link></li>
              </ul>
            </div>
            <div className="mega-menu-column">
              <h4>Leisure & Kitchen</h4>
              <ul>
                <li><Link to="/?category=Books" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Books', '/?category=Books'); }}>
                  <div className="menu-icon-wrapper"><BookOpen size={18} /></div><span>Books</span>
                </Link></li>
                <li><Link to="/?category=Sports" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Sports', '/?category=Sports'); }}>
                  <div className="menu-icon-wrapper"><Dumbbell size={18} /></div><span>Sports & Fitness</span>
                </Link></li>
                <li><Link to="/?category=Grocery" className="menu-icon-link" onClick={(e) => { e.preventDefault(); triggerTransition('Grocery', '/?category=Grocery'); }}>
                  <div className="menu-icon-wrapper"><Apple size={18} /></div><span>Grocery</span>
                </Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dynamic Search Bar */}
        <div ref={searchRef} className="search-wrapper">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              className="search-input-box"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className="search-icon-btn">
              <Search size={18} />
            </button>
          </form>

          {/* Search Dropdown Suggestions */}
          {showSuggestions && (
            <div className="search-suggestions-dropdown glass-panel">
              {/* Autocomplete database results */}
              {suggestions.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                    Suggested Products
                  </div>
                  {suggestions.map((p) => (
                    <div
                      key={p._id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(p.name)}
                    >
                      <Search size={14} color="var(--text-light)" />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: 'auto' }}>in {p.category}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Searches Widget when empty input */}
              {searchQuery.trim().length === 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                      Recent Searches
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={clearRecentSearches}
                        style={{ background: 'transparent', fontSize: '0.75rem', color: 'hsl(0, 84%, 55%)', fontWeight: 'bold' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {recentSearches.length === 0 ? (
                    <div style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center' }}>
                      No recent searches
                    </div>
                  ) : (
                    recentSearches.map((query, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleRecentSearchClick(query)}
                      >
                        <Clock size={14} color="var(--text-light)" />
                        <span style={{ fontSize: '0.9rem' }}>{query}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Action items */}
        <div className="nav-actions">
          {/* Wishlist Link */}
          <Link to="/wishlist" className="nav-link-btn" title="View Wishlist">
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="badge-counter">{wishlistItems.length}</span>
            )}
          </Link>

          {/* Shopping Cart Link */}
          <Link to="/cart" className="nav-link-btn" title="View Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="badge-counter">{cartCount}</span>
            )}
          </Link>

          {/* Light/Dark Toggle */}
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* User Account / Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            {user ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="nav-link-btn btn-secondary"
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)' }}
              >
                <User size={16} />
                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={12} />
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', borderRadius: 'var(--radius-full)' }}>
                Sign In
              </Link>
            )}

            {/* User Submenu dropdown card */}
            {user && showUserDropdown && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  width: '200px',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  zIndex: 999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  animation: 'slideInUp 0.15s ease-out'
                }}
              >
                <Link
                  to="/dashboard"
                  className="suggestion-item"
                  onClick={() => setShowUserDropdown(false)}
                  style={{ padding: '8px 12px' }}
                >
                  <User size={14} />
                  <span>My Dashboard</span>
                </Link>
                <Link
                  to="/order-history"
                  className="suggestion-item"
                  onClick={() => setShowUserDropdown(false)}
                  style={{ padding: '8px 12px' }}
                >
                  <Clock size={14} />
                  <span>Order History</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="suggestion-item"
                    onClick={() => setShowUserDropdown(false)}
                    style={{ padding: '8px 12px', color: 'var(--primary)', fontWeight: 'bold' }}
                  >
                    <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="suggestion-item"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'hsl(0, 84%, 55%)',
                    textAlign: 'left',
                    padding: '8px 12px'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
