import * as React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'neutral';

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-100',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = 'primary', ...props }, ref) => (
  <span
    ref={ref}
    className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variantClasses[variant], className)}
    {...props}
  />
));

Badge.displayName = 'Badge';
