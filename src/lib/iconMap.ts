import React from 'react';
import {
  Wrench,
  Zap,
  Sparkles,
  Heart,
  Leaf,
  Home,
  Lightbulb,
  Star,
} from 'lucide-react';

/**
 * Mapowanie Heroicon slugów do komponentów Lucide React
 * Używane w kategoriach usług i filtrach
 */
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'heroicon-o-wrench': Wrench,
  'heroicon-o-bolt': Zap,
  'heroicon-o-sparkles': Sparkles,
  'heroicon-o-heart': Heart,
  'heroicon-o-leaf': Leaf,
  'heroicon-o-home': Home,
  'heroicon-o-academic-cap': Lightbulb,
  'heroicon-o-star': Star,
};

/**
 * Zwraca komponent ikony na podstawie slugu z bazy danych
 * @param icon - Heroicon slug z bazy (np. "heroicon-o-wrench")
 * @returns Komponent Lucide React lub Sparkles jako fallback
 */
export const resolveIcon = (icon?: string): React.ComponentType<{ className?: string }> => {
  if (icon && ICON_MAP[icon]) {
    return ICON_MAP[icon];
  }
  return Sparkles;
};
