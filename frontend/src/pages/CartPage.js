import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeFromCart } = useContext(CartContext);

  if (items.length === 0) {
    return (
      <div>
        <h2>Your Cart</h2>
        <div className="alert alert-secondary mt-3">Your cart is empty. Browse products to add items.</div>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Cart</h2>
      <div className="list-group mb-4">
        {items.map((item) => (
          <div key={item._id} className="list-group-item d-flex align-items-center justify-content-between">
            <div>
              <h6>{item.name}</h6>
              <p className="mb-1 text-muted">${item.price?.toFixed(2)}</p>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                >
                  +
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeFromCart(item._id)}>
                  Remove
                </button>
              </div>
            </div>
            <div className="text-end">
              <p className="mb-1">Subtotal</p>
              <strong>${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5>Order total</h5>
            <p className="mb-0">${totalPrice.toFixed(2)}</p>
          </div>
          <Link className="btn btn-success" to="/checkout">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
