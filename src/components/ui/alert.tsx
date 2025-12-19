import * as React from 'react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-blue-200 text-blue-900 dark:border-blue-800 dark:text-blue-100 bg-blue-50 dark:bg-blue-950/40',
  success: 'border-emerald-200 text-emerald-900 dark:border-emerald-800 dark:text-emerald-100 bg-emerald-50 dark:bg-emerald-950/40',
  warning: 'border-amber-200 text-amber-900 dark:border-amber-800 dark:text-amber-100 bg-amber-50 dark:bg-amber-950/40',
  destructive: 'border-red-200 text-red-900 dark:border-red-800 dark:text-red-100 bg-red-50 dark:bg-red-950/40',
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'info', ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', variantClasses[variant], className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';
