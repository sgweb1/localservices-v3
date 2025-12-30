/**
 * Typy dla systemu Subskrypcji
 */

export type BillingPeriod = 'monthly' | 'yearly'

export interface SubscriptionPlan {
  id: number
  name: string
  description: string
  slug: string
  price_monthly: number
  price_yearly: number
  features: string[]
  visibility_multiplier: number
  max_services: number
  max_photos: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: number
  provider_id: number
  plan_id: number
  billing_period: BillingPeriod
  status: 'active' | 'cancelled' | 'expired'
  auto_renew: boolean
  starts_at: string
  ends_at: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
}

export interface SubscriptionPurchaseRequest {
  plan_id: number
  billing_period: BillingPeriod
}

export interface SubscriptionCheckoutResponse {
  checkout_url: string
  session_id: string
  subscription_id?: number
}

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: 'Miesiąc',
  yearly: 'Rok'
}
