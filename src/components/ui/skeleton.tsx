import * as React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-800/80', className)}
    {...props}
  />
));

Skeleton.displayName = 'Skeleton';
