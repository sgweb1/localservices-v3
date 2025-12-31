import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

export const TabsRadix = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    className={cn('w-full', className)}
    {...props}
  />
));
TabsRadix.displayName = TabsPrimitive.Root.displayName;

export const TabsListRadix = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center justify-start gap-0 border-b border-slate-200 dark:border-slate-700 w-full',
      className
    )}
    {...props}
  />
));
TabsListRadix.displayName = TabsPrimitive.List.displayName;

export const TabsTriggerRadix = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 hover:text-slate-900 dark:hover:text-slate-100 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-all after:duration-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-cyan-500 data-[state=active]:after:to-blue-500',
      className
    )}
    {...props}
  />
));
TabsTriggerRadix.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContentRadix = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-white dark:ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContentRadix.displayName = TabsPrimitive.Content.displayName;
