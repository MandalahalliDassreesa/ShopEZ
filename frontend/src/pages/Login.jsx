import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const Login = () => {
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in successfully!', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Invalid email or password', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Sparkles size={20} fill="var(--primary)" />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to access your ShopEZ account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-field">
            <label className="form-label-txt">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              className="form-input-val"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group-field">
            <label className="form-label-txt">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="form-input-val"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo details alert */}
        <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: 'var(--radius-sm)', marginTop: '20px', fontSize: '0.8rem', color: 'var(--primary)' }}>
          <strong>Demo credentials:</strong><br />
          Customer: john@gmail.com / john1234<br />
          Admin: admin@shopez.com / admin1234
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const { register, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill all fields', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      addToast('Registered and logged in successfully!', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Error registering user', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '32px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Join ShopEZ to unlock premium features
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-field">
            <label className="form-label-txt">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              className="form-input-val"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group-field">
            <label className="form-label-txt">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              className="form-input-val"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group-field">
            <label className="form-label-txt">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="form-input-val"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group-field">
            <label className="form-label-txt">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="form-input-val"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '12px' }}
            disabled={loading}
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};
