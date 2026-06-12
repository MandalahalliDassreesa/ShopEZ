import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, interactive = false, onChange, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= activeRating;
        return (
          <Star
            key={index}
            size={size}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              fill: isFilled ? 'var(--accent)' : 'transparent',
              color: isFilled ? 'var(--accent)' : 'var(--text-light)',
              transition: 'all 0.1s ease'
            }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
