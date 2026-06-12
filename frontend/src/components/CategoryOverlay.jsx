import React from 'react';
import { useTransition } from '../context/TransitionContext';
import './CategoryOverlay.css';

const CategoryOverlay = () => {
  const { activeCategory, transitionProducts, zoomPhase } = useTransition();

  if (!activeCategory) return null;

  const getShapeClass = (category) => {
    switch (category) {
      case 'Footwear': return 'shape-shoebox';
      case 'Fashion': return 'shape-bag';
      case 'Electronics': return 'shape-phone';
      case 'Watches': return 'shape-dial';
      default: return 'shape-box';
    }
  };

  return (
    <div className={`category-overlay active ${zoomPhase ? 'zoom-phase' : ''}`}>
      <div key={activeCategory} className="overlay-bg"></div>
      
      {/* Falling Products Container */}
      <div className="falling-products-container">
        {transitionProducts.map((product, index) => {
          // Pre-calculate some staggered positions and delays for up to 6 products
          const leftPositions = ['15%', '45%', '75%', '30%', '60%', '85%'];
          const delays = ['0s', '0.2s', '0.4s', '0.1s', '0.3s', '0.5s'];
          const shapeClass = getShapeClass(activeCategory);
          
          return (
            <div 
              key={product._id}
              className={`falling-product-container ${shapeClass}`}
              style={{
                left: leftPositions[index % 6],
                animationDelay: delays[index % 6]
              }}
            >
              <div className="cube-wrapper">
                <div className="face face-front">
                  <img src={product.images[0]} alt={product.name} />
                </div>
                <div className="face face-back">
                  <img src={product.images[0]} alt={product.name} />
                </div>
                <div className="face face-right"></div>
                <div className="face face-left"></div>
                <div className="face face-top"></div>
                <div className="face face-bottom"></div>
              </div>
            </div>
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
