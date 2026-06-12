import React from 'react';
import { useTransition } from '../context/TransitionContext';
import './CategoryOverlay.css';

const CategoryOverlay = () => {
  const { activeCategory, transitionProducts, zoomPhase } = useTransition();

  if (!activeCategory) return null;

  return (
    <div className={`category-overlay active ${zoomPhase ? 'zoom-phase' : ''}`}>
      <div key={activeCategory} className="overlay-bg"></div>
      
      {/* Falling Products Container */}
      <div className="falling-products-container">
        {transitionProducts.map((product, index) => {
          // Pre-calculate some staggered positions and delays for up to 6 products
          const leftPositions = ['15%', '45%', '75%', '30%', '60%', '85%'];
          const delays = ['0s', '0.2s', '0.4s', '0.1s', '0.3s', '0.5s'];
          const rotations = ['rotate(-15deg)', 'rotate(10deg)', 'rotate(-5deg)', 'rotate(20deg)', 'rotate(-25deg)', 'rotate(5deg)'];
          
          return (
            <img 
              key={product._id}
              src={product.images[0]}
              alt={product.name}
              className="falling-product-img"
              style={{
                left: leftPositions[index % 6],
                animationDelay: delays[index % 6],
                transform: rotations[index % 6],
              }}
            />
          );
        })}
      </div>

      <div key={`text-${activeCategory}`} className="overlay-content">
        {activeCategory}
      </div>
    </div>
  );
};

export default CategoryOverlay;
