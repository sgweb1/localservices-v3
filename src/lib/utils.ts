import { clsx, type ClassValue } from 'clsx';

/**
 * Utility do łączenia klas CSS
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
