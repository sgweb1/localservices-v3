import React from 'react';

/**
 * Badge Gradient - badge z gradientem LocalServices
 * 
 * Używany do statusów, planów, wymagań
 */
interface BadgeGradientProps {
  children: React.ReactNode;
  className?: string;
}

export const BadgeGradient: React.FC<BadgeGradientProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <span className={`badge-gradient ${className}`}>
      {children}
    </span>
  );
};
