/**
 * Limity dla każdego planu subskrypcji
 * Zdefiniowane dla LocalServices
 */

export type PlanType = 'free' | 'basic' | 'pro' | 'premium';

export interface PlanLimits {
  maxServices: number;
  maxPhotosPerService: number;
  maxPortfolioPhotos: number;
  prioritySupport: boolean;
  analytics: boolean;
  subdomain: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  dedicatedManager: boolean;
  monthlyPrice: number | null; // null = darmowy
  currency: string;
  description: string;
  badge?: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxServices: 1,
    maxPhotosPerService: 3,
    maxPortfolioPhotos: 10,
    prioritySupport: false,
    analytics: false,
    subdomain: false,
    customBranding: false,
    apiAccess: false,
    dedicatedManager: false,
    monthlyPrice: null,
    currency: 'PLN',
    description: 'Idealny do rozpoczęcia - testuj funkcje bez zobowiązań',
  },
  basic: {
    maxServices: 3,
    maxPhotosPerService: 10,
    maxPortfolioPhotos: 20,
    prioritySupport: true,
    analytics: false,
    subdomain: false,
    customBranding: false,
    apiAccess: false,
    dedicatedManager: false,
    monthlyPrice: 49,
    currency: 'PLN',
    description: 'Dla firm chcących się rozwijać',
    badge: 'Popularne',
  },
  pro: {
    maxServices: 10,
    maxPhotosPerService: 30,
    maxPortfolioPhotos: 50,
    prioritySupport: true,
    analytics: true,
    subdomain: true,
    customBranding: true,
    apiAccess: false,
    dedicatedManager: false,
    monthlyPrice: 99,
    currency: 'PLN',
    description: 'Dla profesjonalistów - maksymalna widoczność',
    badge: 'Rekomendowany',
  },
  premium: {
    maxServices: 50,
    maxPhotosPerService: 50,
    maxPortfolioPhotos: 100,
    prioritySupport: true,
    analytics: true,
    subdomain: true,
    customBranding: true,
    apiAccess: true,
    dedicatedManager: true,
    monthlyPrice: 199,
    currency: 'PLN',
    description: 'Dla liderów rynku - wszystkie funkcje + priorytet',
    badge: 'Elita',
  },
};

/**
 * Porównanie limitów - dla tabeli
 */
export const LIMITS_COMPARISON = [
  {
    feature: 'Max usług',
    free: `${PLAN_LIMITS.free.maxServices}`,
    basic: `${PLAN_LIMITS.basic.maxServices}`,
    pro: `${PLAN_LIMITS.pro.maxServices}`,
    premium: '∞',
  },
  {
    feature: 'Max zdjęć per usługa',
    free: `${PLAN_LIMITS.free.maxPhotosPerService}`,
    basic: `${PLAN_LIMITS.basic.maxPhotosPerService}`,
    pro: `${PLAN_LIMITS.pro.maxPhotosPerService}`,
    premium: '∞',
  },
  {
    feature: 'Portfolio (razem)',
    free: `${PLAN_LIMITS.free.maxPortfolioPhotos}`,
    basic: `${PLAN_LIMITS.basic.maxPortfolioPhotos}`,
    pro: `${PLAN_LIMITS.pro.maxPortfolioPhotos}`,
    premium: '∞',
  },
  {
    feature: 'Subdomena',
    free: '❌',
    basic: '✔️',
    pro: '✔️',
    premium: '✔️',
  },
  {
    feature: 'Analityka',
    free: '❌',
    basic: '❌',
    pro: '✔️ Pełna',
    premium: '✔️ Zaawans.',
  },
  {
    feature: 'Wsparcie',
    free: 'Email',
    basic: 'Priorytet',
    pro: '24/7',
    premium: 'Menedżer',
  },
  {
    feature: 'Custom branding',
    free: '❌',
    basic: '❌',
    pro: '✔️',
    premium: '✔️',
  },
  {
    feature: 'API dostęp',
    free: '❌',
    basic: '❌',
    pro: '❌',
    premium: '✔️',
  },
];

/**
 * Get limit value
 */
export function getPlanLimit(plan: PlanType, limitKey: keyof PlanLimits): any {
  return PLAN_LIMITS[plan][limitKey];
}

/**
 * Check if user exceeded limit
 */
export function isLimitExceeded(
  plan: PlanType,
  currentCount: number,
  limitKey: 'maxServices' | 'maxPhotosPerService' | 'maxPortfolioPhotos'
): boolean {
  const limit = PLAN_LIMITS[plan][limitKey];
  return currentCount >= limit;
}

/**
 * Get remaining quota
 */
export function getRemainingQuota(
  plan: PlanType,
  currentCount: number,
  limitKey: 'maxServices' | 'maxPhotosPerService' | 'maxPortfolioPhotos'
): number {
  const limit = PLAN_LIMITS[plan][limitKey];
  return Math.max(0, limit - currentCount);
}

/**
 * Get usage percentage
 */
export function getUsagePercentage(
  plan: PlanType,
  currentCount: number,
  limitKey: 'maxServices' | 'maxPhotosPerService' | 'maxPortfolioPhotos'
): number {
  const limit = PLAN_LIMITS[plan][limitKey];
  if (limit === 999) return 0; // unlimited
  return Math.round((currentCount / limit) * 100);
}
