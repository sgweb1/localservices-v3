import React from 'react';

/**
 * Text Gradient - tekst z gradientem LocalServices
 * 
 * Używany do tytułów, liczb, Trust Score™
 */
interface TextGradientProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}

export const TextGradient: React.FC<TextGradientProps> = ({ 
  children, 
  className = '',
  strong = false 
}) => {
  const gradientClass = strong ? 'text-gradient-strong' : 'text-gradient';
  
  return (
    <span className={`${gradientClass} ${className}`}>
      {children}
    </span>
  );
};
