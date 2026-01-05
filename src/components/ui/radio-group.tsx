import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../lib/utils';

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-2', className)} {...props} />
  )
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: string;
  description?: string;
}

export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  ({ className, children, label, description, ...props }, ref) => (
    <div className="flex items-start gap-3">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          'aspect-square h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600 text-primary-500 shadow focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 mt-1 flex-shrink-0',
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <div className="flex flex-col gap-1">
        {(label || children) && (
          <label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
            {label || children}
          </label>
        )}
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  )
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
