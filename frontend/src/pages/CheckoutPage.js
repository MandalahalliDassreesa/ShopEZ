import { useContext, useState } from 'react';
import { CartContext } from '../contexts/CartContext';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useContext(CartContext);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="alert alert-success">
        Order placed successfully! Your checkout has been completed.
      </div>
    );
  }

  return (
    <div>
      <h2>Checkout</h2>
      <p className="text-muted">Complete your order and review shipping details.</p>

      <div className="card mb-4">
        <div className="card-body">
          <h5>Order Summary</h5>
          <p>{items.length} items</p>
          <p><strong>Total:</strong> ${totalPrice.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Shipping Address</label>
          <input type="text" className="form-control" placeholder="123 Main St" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Payment Method</label>
          <select className="form-select" required>
            <option value="">Choose payment</option>
            <option value="card">Credit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Pay ${totalPrice.toFixed(2)}</button>
      </form>
    </div>
  );
}
