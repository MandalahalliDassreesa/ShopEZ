import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './components/Toast';
import { useAuth } from './context/AuthContext';
import LocationSelectorModal from './components/LocationSelectorModal';

// Component layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import OrderHistory from './pages/OrderHistory';
import UserDashboard from './pages/UserDashboard';
import { Login, Register } from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

const GlobalLocationModal = () => {
  const [showModal, React_useState] = React.useState(false);

  React.useEffect(() => {
    // Show modal if user hasn't picked a location yet
    if (!localStorage.getItem('userLocation')) {
      showModalState(true);
    }
  }, []);

  const showModalState = (val) => React_useState(val);

  const handleSelectLocation = (location) => {
    localStorage.setItem('userLocation', location);
  };

  return <LocationSelectorModal isOpen={showModal} onClose={() => showModalState(false)} onSelectLocation={handleSelectLocation} />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <CartProvider>
          <WishlistProvider>
            <AuthProvider>
              <ToastProvider>
                <div className="app-container">
                  <GlobalLocationModal />
                  <Navbar />
                  <main>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected Routes */}
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <UserDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/order-history"
                        element={
                          <ProtectedRoute>
                            <OrderHistory />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Guarded Routes */}
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </ToastProvider>
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
