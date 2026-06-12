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
          const rotations = [
            'perspective(800px) rotateX(15deg) rotateY(25deg) rotateZ(-10deg)', 
            'perspective(800px) rotateX(-20deg) rotateY(-15deg) rotateZ(15deg)', 
            'perspective(800px) rotateX(10deg) rotateY(30deg) rotateZ(-5deg)', 
            'perspective(800px) rotateX(-15deg) rotateY(20deg) rotateZ(20deg)', 
            'perspective(800px) rotateX(25deg) rotateY(-25deg) rotateZ(-15deg)', 
            'perspective(800px) rotateX(-10deg) rotateY(10deg) rotateZ(5deg)'
          ];
          
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
