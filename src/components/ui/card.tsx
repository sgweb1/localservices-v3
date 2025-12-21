import * as React from 'react';
import { cn } from '../../lib/utils';

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
  <h3 ref={ref} className={cn('text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-white', className)} {...props} />
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
        'bg-gradient-to-br rounded-2xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-600">{label}</div>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  'font-medium',
                  trend.value > 0 ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-slate-500">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-white/50 rounded-xl">
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
      <div className="bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{day}</h3>
          {count !== undefined && (
            <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-full">
              {count} {count === 1 ? 'slot' : 'slotów'}
            </span>
          )}
        </div>
      </div>
      {/* Zawartość */}
      <div className="p-3 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
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
        'p-3 rounded-lg border-2 transition-all',
        active
          ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 hover:shadow-sm'
          : 'bg-slate-50 border-slate-300 hover:border-slate-400',
        onClick && 'cursor-pointer hover:scale-[1.02] active:scale-100',
        className
      )}
    >
      {children}
    </div>
  );
};
