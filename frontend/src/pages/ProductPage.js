import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { CartContext } from '../contexts/CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetchProductById(id);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) return <div className="alert alert-info">Loading product...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div className="alert alert-warning">Product not found.</div>;

  return (
    <div>
      <div className="mb-4">
        <h2>{product.name}</h2>
        <p className="text-muted">{product.category || 'Uncategorized'}</p>
      </div>
      <div className="card shadow-sm">
        <div className="row g-0 align-items-center">
          <div className="col-md-5">
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
              className="img-fluid rounded-start"
              alt={product.name}
            />
          </div>
          <div className="col-md-7">
            <div className="card-body">
              <p className="h4 text-primary">${product.price?.toFixed(2) || '0.00'}</p>
              <p>{product.description || 'No description available.'}</p>
              <p><strong>Stock:</strong> {product.stock ?? 'N/A'}</p>
              <button className="btn btn-success" onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
