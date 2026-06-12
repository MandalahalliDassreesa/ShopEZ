import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-container">
      {/* Back to top */}
      <div className="footer-back-to-top" onClick={scrollToTop}>
        Back to top
      </div>

      {/* Main Links Area */}
      <div className="footer-main">
        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>Get to Know Us</h4>
            <ul>
              <li><Link to="#">About ShopEZ</Link></li>
              <li><Link to="#">Careers</Link></li>
              <li><Link to="#">Press Releases</Link></li>
              <li><Link to="#">ShopEZ Science</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Connect with Us</h4>
            <ul>
              <li><Link to="#">Facebook</Link></li>
              <li><Link to="#">Twitter</Link></li>
              <li><Link to="#">Instagram</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Make Money with Us</h4>
            <ul>
              <li><Link to="#">Sell on ShopEZ</Link></li>
              <li><Link to="#">Sell under ShopEZ Accelerator</Link></li>
              <li><Link to="#">Protect and Build Your Brand</Link></li>
              <li><Link to="#">ShopEZ Global Selling</Link></li>
              <li><Link to="#">Supply to ShopEZ</Link></li>
              <li><Link to="#">Become an Affiliate</Link></li>
              <li><Link to="#">Fulfilment by ShopEZ</Link></li>
              <li><Link to="#">Advertise Your Products</Link></li>
              <li><Link to="#">ShopEZ Pay on Merchants</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Let Us Help You</h4>
            <ul>
              <li><Link to="#">Your Account</Link></li>
              <li><Link to="#">Returns Centre</Link></li>
              <li><Link to="#">Recalls and Product Safety Alerts</Link></li>
              <li><Link to="#">100% Purchase Protection</Link></li>
              <li><Link to="#">ShopEZ App Download</Link></li>
              <li><Link to="#">Help</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logo & Selectors Area */}
      <div className="footer-middle">
        <div className="footer-middle-content">
          <div className="footer-logo">ShopEZ</div>
          <div className="footer-selectors">
            <button className="footer-selector-btn">
              <Globe size={16} />
              <span>English</span>
            </button>
            <button className="footer-selector-btn">
              <span>🇮🇳 India</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="footer-bottom">
        <div className="footer-bottom-grid">
          <div className="footer-bottom-item">
            <Link to="#">
              <strong>AbeBooks</strong>
              <span>Books, art<br/>& collectibles</span>
            </Link>
          </div>
          <div className="footer-bottom-item">
            <Link to="#">
              <strong>ShopEZ Web Services</strong>
              <span>Scalable Cloud<br/>Computing Services</span>
            </Link>
          </div>
          <div className="footer-bottom-item">
            <Link to="#">
              <strong>Audible</strong>
              <span>Download<br/>Audio Books</span>
            </Link>
          </div>
          <div className="footer-bottom-item">
            <Link to="#">
              <strong>IMDb</strong>
              <span>Movies, TV<br/>& Celebrities</span>
            </Link>
          </div>
          <div className="footer-bottom-item">
            <Link to="#">
              <strong>Shopbop</strong>
              <span>Designer<br/>Fashion Brands</span>
            </Link>
          </div>
          <div className="footer-bottom-item">
            <Link to="#">
              <strong>ShopEZ Business</strong>
              <span>Everything For<br/>Your Business</span>
            </Link>
          </div>
          <div className="footer-bottom-item">
            <Link to="#">
              <strong>ShopEZ Music</strong>
              <span>Stream millions of songs</span>
            </Link>
          </div>
        </div>
        
        <div className="footer-copyright">
          <div className="footer-copyright-links">
            <Link to="#">Conditions of Use & Sale</Link>
            <Link to="#">Privacy Notice</Link>
            <Link to="#">Interest-Based Ads</Link>
          </div>
          <p>© 1996-{new Date().getFullYear()}, ShopEZ.com, Inc. or its affiliates</p>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
