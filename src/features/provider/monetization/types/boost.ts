/**
 * Typy dla systemu Boost'ów
 */

export type BoostType = 'city_boost' | 'spotlight'
export type BoostDuration = 7 | 14 | 30

export interface BoostPurchaseRequest {
  type: BoostType
  days: BoostDuration
  city?: string
  category?: string
}

export interface Boost {
  id: number
  provider_id: number
  type: BoostType
  city?: string
  category?: string
  expires_at: string
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BoostCheckoutResponse {
  checkout_url: string
  session_id: string
  boost_id?: number
}

export const BOOST_PRICES: Record<BoostType, Record<BoostDuration, number>> = {
  city_boost: {
    7: 9.99,
    14: 19.99,
    30: 29.99
  },
  spotlight: {
    7: 14.99,
    14: 24.99,
    30: 39.99
  }
}

export const BOOST_DURATIONS: BoostDuration[] = [7, 14, 30]

export const BOOST_TYPE_LABELS: Record<BoostType, string> = {
  city_boost: 'City Boost',
  spotlight: 'Spotlight'
}
