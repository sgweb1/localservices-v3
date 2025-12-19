import React from 'react';

/**
 * Icon Gradient - kontener z gradientem dla ikon
 * 
 * Warianty 1/2/3 z LocalServices design system
 */
interface IconGradientProps {
  children: React.ReactNode;
  variant?: 1 | 2 | 3;
  className?: string;
}

export const IconGradient: React.FC<IconGradientProps> = ({ 
  children, 
  variant = 1,
  className = '' 
}) => {
  const gradientClass = `icon-gradient-${variant}`;
  
  return (
    <div className={`${gradientClass} p-3 rounded-xl inline-flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
};
