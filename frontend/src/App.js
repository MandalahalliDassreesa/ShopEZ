import { Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import { CartContext } from './contexts/CartContext';
import './App.css';

function App() {
  const { totalItems } = useContext(CartContext);

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">ShopEZ</Link>
          <div className="navbar-nav ms-auto d-flex align-items-center">
            <Link className="nav-link" to="/cart">
              Cart {totalItems > 0 && <span className="badge bg-primary">{totalItems}</span>}
            </Link>
            <Link className="nav-link" to="/login">Login</Link>
          </div>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
