import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md', ...props }) => (
  <div
    className={cn('inline-block animate-spin rounded-full border-gray-200 dark:border-gray-700 border-t-primary-500', sizeMap[size], className)}
    {...props}
  />
);
