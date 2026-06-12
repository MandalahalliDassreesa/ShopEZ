import React from 'react';
import { useTransition } from '../context/TransitionContext';
import './CategoryOverlay.css';

const CategoryOverlay = () => {
  const { activeCategory } = useTransition();

  if (!activeCategory) return null;

  const getAnimationClass = (category) => {
    switch (category) {
      case 'Electronics':
        return 'anim-electronics';
      case 'Fashion':
        return 'anim-fashion';
      case 'Watches':
        return 'anim-watches';
      case 'Footwear':
        return 'anim-footwear';
      default:
        return 'anim-generic';
    }
  };

  return (
    <div className={`category-overlay ${activeCategory ? 'active' : ''} ${getAnimationClass(activeCategory)}`}>
      <div className="overlay-bg"></div>
      <div className="overlay-content">
        {activeCategory}
      </div>
    </div>
  );
};

export default CategoryOverlay;
