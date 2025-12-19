import React from 'react';

/**
 * Hero Gradient - sekcja hero z gradientem LocalServices
 * 
 * Używana w DashboardHero i innych hero sections
 */
interface HeroGradientProps {
  children: React.ReactNode;
  className?: string;
}

export const HeroGradient: React.FC<HeroGradientProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`hero-gradient ${className}`}>
      {children}
    </div>
  );
};
