import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Eye, Star, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import ProductComparisonModal from '../components/ProductComparisonModal';
import { useToast } from '../components/Toast';

// Carousel promo banners
const promoBanners = [
  {
    title: 'Festival Mega Sale',
    subtitle: 'Get up to 50% off on all premium Electronics & Smart Appliances.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80',
    link: '/?category=Electronics'
  },
  {
    title: 'Step Into Comfort',
    subtitle: 'Explore elite running shoes and trainers. Buy One Get One Free on selected Footwear.',
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&auto=format&fit=crop&q=80',
    link: '/?category=Footwear'
  },
  {
    title: 'Urban Fashion Arrivals',
    subtitle: 'Classic cuts, organic materials, and trendy styles for the new season.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
    link: '/?category=Fashion'
  }
];

const testimonials = [
  { name: 'Marcus Sterling', comment: 'ShopEZ has completely replaced other platforms for me. The interface is stunning and shipping estimate dates are highly accurate!', rating: 5 },
  { name: 'Sarah Jenkins', comment: 'The product comparison drawer is a game changer. I compared three smartwatches side by side in seconds. Great design!', rating: 5 },
  { name: 'David Carter', comment: 'Highly verified purchase reviews and direct coupon applications during checkout made my shopping extremely easy. 10/10.', rating: 5 }
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const searchCategory = searchParams.get('category') || '';
  
  const { addToast } = useToast();

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Products and catalog states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(searchCategory);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [discountOnly, setDiscountOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Showcase section lists (unfiltered highlights for homepage feel)
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  // Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Flash Sale Timer Countdown (Daily timed deals)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 30, seconds: 0 });

  // Load showcase sections once
  useEffect(() => {
    const fetchShowcases = async () => {
      try {
        const flashRes = await axios.get('http://localhost:5000/api/products?limit=4&discount=true');
        setFlashSaleProducts(flashRes.data.products || []);

        const trendRes = await axios.get('http://localhost:5000/api/products?limit=4&sortBy=bestSelling');
        setTrendingProducts(trendRes.data.products || []);

        const bestRes = await axios.get('http://localhost:5000/api/products?limit=4&rating=4');
        setBestSellers(bestRes.data.products || []);

        const newRes = await axios.get('http://localhost:5000/api/products?limit=4&sortBy=newest');
        setNewArrivals(newRes.data.products || []);
      } catch (error) {
        console.error('Error fetching showcase products:', error.message);
      }
    };
    fetchShowcases();
  }, []);

  // Sync category params
  useEffect(() => {
    setSelectedCategory(searchCategory);
    setPage(1);
  }, [searchCategory]);

  // Load Main Paginated/Filtered Catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        let query = `http://localhost:5000/api/products?page=${page}&limit=8&sortBy=${sortBy}`;
        if (searchKeyword) query += `&keyword=${encodeURIComponent(searchKeyword)}`;
        if (selectedCategory) query += `&category=${encodeURIComponent(selectedCategory)}`;
        if (selectedBrand) query += `&brand=${encodeURIComponent(selectedBrand)}`;
        if (minPrice) query += `&minPrice=${minPrice}`;
        if (maxPrice) query += `&maxPrice=${maxPrice}`;
        if (minRating) query += `&rating=${minRating}`;
        if (discountOnly) query += `&discount=true`;
        if (inStockOnly) query += `&inStock=true`;

        const { data } = await axios.get(query);
        setProducts(data.products || []);
        setPages(data.pages || 1);
      } catch (error) {
        console.error('Error fetching catalog:', error.message);
      }
      setLoading(false);
    };

    fetchCatalog();
  }, [page, searchKeyword, selectedCategory, selectedBrand, minPrice, maxPrice, minRating, discountOnly, inStockOnly, sortBy]);

  // Load metadata filters (categories, brands)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const catRes = await axios.get('http://localhost:5000/api/products/meta/categories');
        setCategories(catRes.data || []);
        const brandRes = await axios.get('http://localhost:5000/api/products/meta/brands');
        setBrands(brandRes.data || []);
      } catch (error) {
        console.error('Error fetching metadata:', error.message);
      }
    };
    fetchMeta();
  }, []);

  // Timer countdown math
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto slide banners
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoBanners.length);
    }, 6000);
    return () => clearInterval(bannerInterval);
  }, []);

  const handleToggleCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        addToast(`${product.name} removed from comparison list`, 'info');
        return prev.filter((item) => item._id !== product._id);
      }
      if (prev.length >= 3) {
        addToast('You can compare a maximum of 3 products at a time', 'error');
        return prev;
      }
      addToast(`${product.name} added to comparison list!`, 'success');
      return [...prev, product];
    });
  };

  const handleCategoryClick = (category) => {
    setSearchParams({ category });
    setSelectedCategory(category);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setDiscountOnly(false);
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      {/* 1. Hero Promo Banner Slider */}
      {!searchKeyword && !selectedCategory && (
        <section className="hero-slider-section" style={{ position: 'relative', overflow: 'hidden', height: '550px', borderRadius: 'var(--radius-xl)', marginBottom: '40px', boxShadow: 'var(--shadow-lg)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="hero-slide active"
              style={{ backgroundImage: `url(${promoBanners[currentSlide].image})`, position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', margin: 0, height: '100%' }}
            >
              <div className="hero-slide-text" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '8%', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '48px', borderRadius: 'var(--radius-lg)', maxWidth: '550px' }}>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                >
                  {promoBanners[currentSlide].title}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  style={{ fontSize: '1.2rem', color: '#f0f0f0', marginBottom: '32px', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}
                >
                  {promoBanners[currentSlide].subtitle}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Link to={promoBanners[currentSlide].link} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '50px', background: 'var(--primary)', border: 'none', color: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', transition: 'transform 0.3s ease', display: 'inline-block' }}>
                    Shop Now
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="slider-arrows" style={{ position: 'absolute', inset: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', pointerEvents: 'none' }}>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + promoBanners.length) % promoBanners.length)}
              className="slider-arrow-btn"
              style={{ pointerEvents: 'auto', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % promoBanners.length)}
              className="slider-arrow-btn"
              style={{ pointerEvents: 'auto', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            >
              <ChevronRight size={28} />
            </button>
          </div>
          <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 10 }}>
            {promoBanners.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{ width: idx === currentSlide ? '32px' : '10px', height: '10px', borderRadius: '5px', background: idx === currentSlide ? 'var(--primary)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.4s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Horizontal Category Selectors Showcase */}
      {!searchKeyword && !selectedCategory && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.4rem' }}>Browse Categories</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '16px'
            }}
          >
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => handleCategoryClick(cat)}
                className="glass-card"
                style={{
                  padding: '16px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {cat}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Flash Sale Timer Banner */}
      {!searchKeyword && !selectedCategory && flashSaleProducts.length > 0 && (
        <section
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '40px',
            background: 'linear-gradient(135deg, rgba(114, 46, 209, 0.05), rgba(280, 75, 60, 0.05))'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px'
            }}
          >
            <div>
              <span className="badge-tag flash" style={{ marginBottom: '8px' }}>
                Limited Time Deals
              </span>
              <h2>Daily Flash Sale!</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ending In:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span className="btn btn-secondary" style={{ width: '40px', height: '36px', padding: 0 }}>
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="btn btn-secondary" style={{ width: '40px', height: '36px', padding: 0 }}>
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="btn btn-secondary" style={{ width: '40px', height: '36px', padding: 0 }}>
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>
          <div className="product-grid">
            {flashSaleProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                compareList={compareList}
                onToggleCompare={handleToggleCompare}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Main Product Catalog Section with Sidebar Filters */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '32px',
          margin: '40px 0'
        }}
      >
        {/* Filters Sidebar */}
        <aside className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-md)', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button onClick={clearFilters} style={{ background: 'transparent', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="form-group-field">
            <label className="form-label-txt">Category</label>
            <select
              className="form-select-val"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchParams({ category: e.target.value });
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="form-group-field">
            <label className="form-label-txt">Brand</label>
            <select
              className="form-select-val"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Brands</option>
              {brands.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filters */}
          <div className="form-group-field">
            <label className="form-label-txt">Price Range (₹)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Min"
                className="form-input-val"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
              />
              <input
                type="number"
                placeholder="Max"
                className="form-input-val"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Ratings Filters */}
          <div className="form-group-field">
            <label className="form-label-txt">Customer Rating</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[4, 3, 2].map((stars) => (
                <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="minRating"
                    checked={Number(minRating) === stars}
                    onChange={() => {
                      setMinRating(stars);
                      setPage(1);
                    }}
                  />
                  <span style={{ display: 'flex', color: 'var(--accent)' }}>
                    {Array(stars).fill('★').join('')}
                    {Array(5 - stars).fill('☆').join('')}
                  </span>
                  <span>& Up</span>
                </label>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="minRating"
                  checked={minRating === ''}
                  onChange={() => {
                    setMinRating('');
                    setPage(1);
                  }}
                />
                <span>Any Rating</span>
              </label>
            </div>
          </div>

          {/* Special Toggle Options */}
          <div className="form-group-field" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={(e) => {
                  setDiscountOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <span>Has Discount</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Catalog view */}
        <div>
          {/* Header row with search query feedback and sort selector */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              {searchKeyword ? (
                <h2>Search results for "{searchKeyword}"</h2>
              ) : selectedCategory ? (
                <h2>Category: {selectedCategory}</h2>
              ) : (
                <h2>All Products</h2>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</span>
              <select
                className="form-select-val"
                style={{ width: '170px', padding: '6px 12px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="highestRated">Highest Rated</option>
                <option value="bestSelling">Best Selling</option>
              </select>
            </div>
          </div>

          {/* Skeleton Loaders / Products grid */}
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="glass-card" style={{ padding: '16px', height: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton-box" style={{ flexGrow: 1, borderRadius: 'var(--radius-sm)' }}></div>
                  <div className="skeleton-box" style={{ height: '18px', width: '60%' }}></div>
                  <div className="skeleton-box" style={{ height: '24px', width: '90%' }}></div>
                  <div className="skeleton-box" style={{ height: '36px', width: '100%' }}></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
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
              <AlertCircle size={48} color="var(--text-light)" />
              <h3>No Products Found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No items matched your search criteria. Try modifying your filter rules.</p>
              <button onClick={clearFilters} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    compareList={compareList}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px' }}
                  >
                    Prev
                  </button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`btn ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: '36px', height: '36px', padding: 0 }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(page + 1)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 5. Additional Amazon-style grids when not searching */}
      {!searchKeyword && !selectedCategory && (
        <>
          {/* Trending Products */}
          <section style={{ margin: '60px 0' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2>Trending Now</h2>
            </div>
            <div className="product-grid">
              {trendingProducts.map((p) => (
                <ProductCard key={p._id} product={p} compareList={compareList} onToggleCompare={handleToggleCompare} />
              ))}
            </div>
          </section>

          {/* Best Sellers */}
          <section style={{ margin: '60px 0' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2>Best Sellers</h2>
            </div>
            <div className="product-grid">
              {bestSellers.map((p) => (
                <ProductCard key={p._id} product={p} compareList={compareList} onToggleCompare={handleToggleCompare} />
              ))}
            </div>
          </section>

          {/* New Arrivals */}
          <section style={{ margin: '60px 0' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2>New Arrivals</h2>
            </div>
            <div className="product-grid">
              {newArrivals.map((p) => (
                <ProductCard key={p._id} product={p} compareList={compareList} onToggleCompare={handleToggleCompare} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* 6. Customer Testimonials */}
      {!searchKeyword && !selectedCategory && (
        <section style={{ margin: '60px 0 40px 0', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>What Our Customers Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', color: 'var(--accent)', marginBottom: '8px' }}>
                  {Array(t.rating).fill('★').join('')}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '16px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  "{t.comment}"
                </p>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>- {t.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Floating Product Compare Drawer */}
      {compareList.length > 0 && (
        <div className="compare-floating-drawer glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={16} />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              Compare list ({compareList.length}/3)
            </span>
          </div>
          <button
            onClick={() => setShowCompareModal(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Compare Now
          </button>
          <button
            onClick={() => setCompareList([])}
            style={{ background: 'transparent', color: 'hsl(0, 84%, 55%)', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* 8. Spec Compare Modal Popup */}
      {showCompareModal && (
        <ProductComparisonModal
          products={compareList}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
