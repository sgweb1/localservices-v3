import React from 'react';

/**
 * Glass Card - bazowy komponent dla wszystkich widgetów dashboardu
 * 
 * Identyczny z LocalServices: backdrop-blur, white/90, border, shadow
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = false 
}) => {
  const hoverClass = hover ? 'card-hover cursor-pointer' : '';
  
  return (
    <div 
      className={`glass-card p-6 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
