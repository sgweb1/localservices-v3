/**
 * Utilities dla HARD LOCK - ograniczanie dostępu do funkcji
 *
 * HARD LOCK = natychmiastowe wyłączenie funkcji gdy user przekroczy limity
 * Implementacja:
 * - Grey overlay na ukrytych elementach
 * - "Upgrade do {PLAN}" CTA button
 * - Disable action na buttonach (add, upload)
 *
 * @since 2025-12-24
 */

import { SubscriptionPlan } from '@/types';

export interface SubscriptionLimits {
  max_services: number;
  max_photos_per_service: number;
  max_portfolio_photos: number;
  has_promotional_video: boolean;
  has_calendar: boolean;
  has_subdomain: boolean;
  analytics_level: 'none' | 'basic' | 'advanced';
}

/**
 * Sprawdź czy user może dodać nową usługę
 * @param currentServices - liczba obecnych usług
 * @param limits - limity user'a
 * @returns true jeśli może dodać
 */
export const canAddService = (
  currentServices: number,
  limits: SubscriptionLimits,
): boolean => {
  return currentServices < limits.max_services;
};

/**
 * Sprawdź czy user może dodać więcej zdjęć do usługi
 * @param currentPhotos - liczba obecnych zdjęć
 * @param limits - limity user'a
 * @returns true jeśli może dodać
 */
export const canAddPhotoToService = (
  currentPhotos: number,
  limits: SubscriptionLimits,
): boolean => {
  return currentPhotos < limits.max_photos_per_service;
};

/**
 * Sprawdź czy user może dodać więcej zdjęć do portfolio
 * @param currentPhotos - liczba obecnych zdjęć w portfolio
 * @param limits - limity user'a
 * @returns true jeśli może dodać
 */
export const canAddPortfolioPhoto = (
  currentPhotos: number,
  limits: SubscriptionLimits,
): boolean => {
  return currentPhotos < limits.max_portfolio_photos;
};

/**
 * Pobierz liczbę ukrytych usług
 * @param totalServices - całkowita liczba usług
 * @param limits - limity user'a
 * @returns liczba ukrytych usług
 */
export const getHiddenServicesCount = (
  totalServices: number,
  limits: SubscriptionLimits,
): number => {
  return Math.max(0, totalServices - limits.max_services);
};

/**
 * Pobierz liczbę ukrytych zdjęć per usługa
 * @param totalPhotos - całkowita liczba zdjęć
 * @param limits - limity user'a
 * @returns liczba ukrytych zdjęć
 */
export const getHiddenPhotosPerService = (
  totalPhotos: number,
  limits: SubscriptionLimits,
): number => {
  return Math.max(0, totalPhotos - limits.max_photos_per_service);
};

/**
 * Pobierz liczbę ukrytych zdjęć portfolio
 * @param totalPhotos - całkowita liczba zdjęć portfolio
 * @param limits - limity user'a
 * @returns liczba ukrytych zdjęć
 */
export const getHiddenPortfolioPhotos = (
  totalPhotos: number,
  limits: SubscriptionLimits,
): number => {
  return Math.max(0, totalPhotos - limits.max_portfolio_photos);
};

/**
 * Filtruj widoczne usługi na podstawie limitu
 * @param services - lista wszystkich usług
 * @param limits - limity user'a
 * @returns tablica widocznych usług
 */
export const getVisibleServices = <T extends { id: any }>(
  services: T[],
  limits: SubscriptionLimits,
): T[] => {
  return services.slice(0, limits.max_services);
};

/**
 * Filtruj widoczne zdjęcia usługi
 * @param photos - lista zdjęć
 * @param limits - limity user'a
 * @returns tablica widocznych zdjęć
 */
export const getVisiblePhotosForService = <T extends { id: any }>(
  photos: T[],
  limits: SubscriptionLimits,
): T[] => {
  return photos.slice(0, limits.max_photos_per_service);
};

/**
 * Filtruj widoczne zdjęcia portfolio
 * @param photos - lista zdjęć portfolio
 * @param limits - limity user'a
 * @returns tablica widocznych zdjęć
 */
export const getVisiblePortfolioPhotos = <T extends { id: any }>(
  photos: T[],
  limits: SubscriptionLimits,
): T[] => {
  return photos.slice(0, limits.max_portfolio_photos);
};

/**
 * Sprawdź czy feature jest dostępny
 * @param feature - nazwa feature'a
 * @param limits - limity user'a
 * @returns true jeśli feature jest dostępny
 */
export const isFeatureAvailable = (
  feature: 'calendar' | 'subdomain' | 'video' | 'analytics',
  limits: SubscriptionLimits,
): boolean => {
  switch (feature) {
    case 'calendar':
      return limits.has_calendar;
    case 'subdomain':
      return limits.has_subdomain;
    case 'video':
      return limits.has_promotional_video;
    case 'analytics':
      return limits.analytics_level !== 'none';
    default:
      return false;
  }
};

/**
 * Pobierz tekst upgrade'u
 * @param current - obecna liczba
 * @param limit - limit
 * @returns tekst np. "2 / 5"
 */
export const getLimitText = (current: number, limit: number): string => {
  return `${current} / ${limit}`;
};

/**
 * Sprawdź czy user jest bliski limitu (80%)
 * @param current - obecna liczba
 * @param limit - limit
 * @returns true jeśli >= 80% limit
 */
export const isNearLimit = (current: number, limit: number): boolean => {
  return (current / limit) >= 0.8;
};

/**
 * Pobierz kolor dla status limitu
 * @param current - obecna liczba
 * @param limit - limit
 * @returns 'green' | 'yellow' | 'red'
 */
export const getLimitColor = (current: number, limit: number): string => {
  const percentage = (current / limit) * 100;
  
  if (percentage >= 100) return 'red';
  if (percentage >= 80) return 'yellow';
  return 'green';
};

/**
 * Pobierz wiadomość o limit'ie
 * @param current - obecna liczba
 * @param limit - limit
 * @param name - nazwa feature'a
 * @returns wiadomość np. "2/5 usług"
 */
export const getLimitMessage = (
  current: number,
  limit: number,
  name: string,
): string => {
  const remaining = limit - current;
  
  if (remaining === 0) {
    return `Limit ${name} osiągnięty. Upgrade, aby dodać więcej.`;
  }
  
  if (remaining === 1) {
    return `Jeszcze ${remaining} ${name}`;
  }
  
  return `Jeszcze ${remaining} ${name}`;
};
