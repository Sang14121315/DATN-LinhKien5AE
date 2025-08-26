// components/RatingStars.tsx
import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  reviewCount?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  size = 16, 
  showNumber = false, 
  reviewCount 
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="rating-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex' }}>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} color="#ffc107" size={size} />
        ))}
        {hasHalfStar && <FaStarHalfAlt color="#ffc107" size={size} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} color="#ffc107" size={size} />
        ))}
      </div>
      {showNumber && (
        <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;