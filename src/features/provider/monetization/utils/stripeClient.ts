/**
 * Inicjalizacja Stripe.js
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripeInstance: Stripe | null = null

/**
 * Pobiera instancję Stripe lub ją inicjalizuje
 */
export async function getStripeInstance(): Promise<Stripe | null> {
  if (!stripeInstance) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
    
    if (!publishableKey) {
      console.error('VITE_STRIPE_PUBLIC_KEY nie skonfigurowany w .env')
      return null
    }
    
    try {
      stripeInstance = await loadStripe(publishableKey)
    } catch (error) {
      console.error('Błąd przy inicjalizacji Stripe:', error)
      return null
    }
  }
  
  return stripeInstance
}

/**
 * Resetuje instancję Stripe (użyteczne w testach)
 */
export function resetStripeInstance(): void {
  stripeInstance = null
}
