import * as React from 'react';
import { cn } from '../../lib/utils';
import { Caption } from './typography';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-2 p-6 pb-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-medium leading-tight tracking-tight text-gray-900 dark:text-white', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-600 dark:text-gray-400', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

/**
 * Glass Card z backdrop blur efektem
 */
export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }>(
  ({ className, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'backdrop-blur-xl bg-white/80 rounded-2xl shadow-lg border border-white/20',
        hover && 'transition-all duration-200 hover:shadow-xl hover:bg-white/90',
        className
      )}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';

/**
 * Stat Card - karta ze statystyką
 */
export const StatCard: React.FC<{
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger';
  className?: string;
}> = ({ value, label, icon, trend, variant = 'default', className }) => {
  const variantClasses = {
    default: 'from-slate-50 to-slate-100 border-slate-200',
    gradient: 'from-cyan-50 to-teal-50 border-cyan-200',
    success: 'from-emerald-50 to-emerald-100 border-emerald-200',
    warning: 'from-amber-50 to-amber-100 border-amber-200',
    danger: 'from-red-50 to-red-100 border-red-200',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br rounded-xl shadow-sm border p-4 transition-all duration-200',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-xl font-normal text-slate-900">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  'font-normal',
                  trend.value > 0 ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-white/30 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Day Card - karta dnia tygodnia w kalendarzu
 */
export const DayCard: React.FC<{
  day: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}> = ({ day, count, children, className }) => {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 overflow-hidden', className)}>
      {/* Nagłówek dnia */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-normal text-slate-700">{day}</CardTitle>
          {count !== undefined && (
            <Caption className="bg-white px-1.5 py-0.5 rounded text-slate-500">
              {count}
            </Caption>
          )}
        </div>
      </div>
      {/* Zawartość */}
      <div className="p-2 space-y-2 min-h-[120px] sm:min-h-[180px] max-h-[400px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

/**
 * Slot Card - karta pojedynczego slotu
 */
export const SlotCard: React.FC<{
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ active = true, children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg border transition-all text-xs',
        active
          ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200'
          : 'bg-slate-50/50 border-slate-200 hover:border-slate-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
