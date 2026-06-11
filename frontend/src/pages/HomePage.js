import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ProductsContext } from './ProductsContext';
import { CartContext } from '../contexts/CartContext';

export default function HomePage() {
  const { products, loading, error } = useContext(ProductsContext);
  const { addToCart } = useContext(CartContext);

  return (
    <div>
      <section className="hero-banner mb-5 text-center">
        <h1>ShopEZ Marketplace</h1>
        <p className="lead">Browse trending products and build your cart with one-click checkout.</p>
      </section>

      {loading && <div className="alert alert-info">Loading products...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <div className="row g-4">
          {products.map((product) => (
            <div className="col-md-6 col-lg-3" key={product._id}>
              <div className="card h-100 product-card shadow-sm">
                <img src={product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} className="card-img-top" alt={product.name} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted">{product.description?.slice(0, 70) || 'No description available.'}</p>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="fw-bold">${product.price?.toFixed(2) || '0.00'}</span>
                    <div>
                      <button className="btn btn-success btn-sm me-2" onClick={() => addToCart(product)}>
                        Add to Cart
                      </button>
                      <Link className="btn btn-primary btn-sm" to={`/product/${product._id}`}>View</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
