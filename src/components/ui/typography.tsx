import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

/**
 * Główny nagłówek strony (H1)
 * Gradient cyan-to-teal, duża czcionka
 */
export const PageTitle: React.FC<TypographyProps> = ({ children, className, gradient = true }) => {
  return (
    <h1
      className={cn(
        'text-lg md:text-xl font-normal tracking-normal',
        gradient ? 'bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent' : 'text-slate-900',
        className
      )}
    >
      {children}
    </h1>
  );
};

/**
 * Sekcja nagłówek (H2)
 * Ciemniejszy, mniejszy od PageTitle
 */
export const SectionTitle: React.FC<TypographyProps> = ({ children, className, gradient = false }) => {
  return (
    <h2
      className={cn(
        'text-base md:text-lg font-normal tracking-normal',
        gradient ? 'bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent' : 'text-slate-900',
        className
      )}
    >
      {children}
    </h2>
  );
};

/**
 * Podsekcja nagłówek (H3)
 */
export const SubsectionTitle: React.FC<TypographyProps> = ({ children, className, gradient = false }) => {
  return (
    <h3
      className={cn(
        'text-sm md:text-base font-normal tracking-normal',
        gradient ? 'bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent' : 'text-slate-900',
        className
      )}
    >
      {children}
    </h3>
  );
};

/**
 * Mały nagłówek (H4)
 */
export const CardTitle: React.FC<TypographyProps> = ({ children, className }) => {
  return (
    <h4 className={cn('text-base font-normal text-slate-900', className)}>
      {children}
    </h4>
  );
};

/**
 * Podstawowy tekst paragrafowy
 */
export const Text: React.FC<TypographyProps & { size?: 'sm' | 'base' | 'lg'; muted?: boolean }> = ({
  children,
  className,
  size = 'base',
  muted = false,
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
  };

  return (
    <p
      className={cn(
        sizeClasses[size],
        'leading-relaxed',
        muted ? 'text-slate-600' : 'text-slate-700',
        className
      )}
    >
      {children}
    </p>
  );
};

/**
 * Wzmocniony tekst (strong/bold)
 */
export const Strong: React.FC<TypographyProps> = ({ children, className }) => {
  return (
    <strong className={cn('font-medium text-slate-900', className)}>
      {children}
    </strong>
  );
};

/**
 * Mały tekst pomocniczy (caption, label)
 */
export const Caption: React.FC<TypographyProps & { muted?: boolean }> = ({
  children,
  className,
  muted = true,
}) => {
  return (
    <span
      className={cn(
        'text-xs leading-tight',
        muted ? 'text-slate-500' : 'text-slate-600',
        className
      )}
    >
      {children}
    </span>
  );
};

/**
 * Etykieta pola formularza
 */
export const Label: React.FC<TypographyProps & { required?: boolean }> = ({
  children,
  className,
  required = false,
}) => {
  return (
    <label className={cn('block text-xs font-normal text-slate-700 mb-1.5', className)}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

/**
 * Link z hover efektami
 */
export const Link: React.FC<
  TypographyProps & {
    href?: string;
    onClick?: () => void;
    underline?: boolean;
  }
> = ({ children, className, href, onClick, underline = false }) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'text-cyan-600 hover:text-cyan-700 transition-colors cursor-pointer',
        underline && 'underline underline-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
};

/**
 * Badge/Tag komponent
 */
export const Badge: React.FC<
  TypographyProps & {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';
  }
> = ({ children, className, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-cyan-100 text-cyan-700',
    gradient: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px]',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

/**
 * Stat value - duża liczba z opisem
 */
export const StatValue: React.FC<TypographyProps & { description?: string; gradient?: boolean }> = ({
  children,
  className,
  description,
  gradient = false,
}) => {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          'text-xl md:text-2xl font-normal tracking-normal',
          gradient ? 'bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent' : 'text-slate-900',
          className
        )}
      >
        {children}
      </div>
      {description && (
        <Caption className="text-slate-500">{description}</Caption>
      )}
    </div>
  );
};

/**
 * Empty state text
 */
export const EmptyText: React.FC<TypographyProps> = ({ children, className }) => {
  return (
    <p className={cn('text-center text-slate-500 text-sm', className)}>
      {children}
    </p>
  );
};

/**
 * Helper text (pod inputami)
 */
export const HelperText: React.FC<TypographyProps & { error?: boolean }> = ({
  children,
  className,
  error = false,
}) => {
  return (
    <p
      className={cn(
        'text-xs mt-1',
        error ? 'text-red-600' : 'text-slate-500',
        className
      )}
    >
      {children}
    </p>
  );
};
