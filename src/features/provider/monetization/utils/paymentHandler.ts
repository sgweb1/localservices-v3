/**
 * Handler dla procesu płatności - API communication
 */

import axios from 'axios'
import type { BoostPurchaseRequest, BoostCheckoutResponse } from '../types/boost'
import type { SubscriptionPurchaseRequest, SubscriptionCheckoutResponse } from '../types/subscription'

const API_BASE_URL = '/api/v1'

/**
 * Inicjuje checkout dla boost'a
 */
export async function initiateBoostCheckout(payload: BoostPurchaseRequest): Promise<BoostCheckoutResponse> {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/boosts/purchase`, payload)
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Błąd przy inicjalizacji checkout')
    }
    
    return data.data as BoostCheckoutResponse
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Błąd przy inicjalizacji checkout'
    throw new Error(message)
  }
}

/**
 * Inicjuje checkout dla subskrypcji
 */
export async function initiateSubscriptionCheckout(
  payload: SubscriptionPurchaseRequest
): Promise<SubscriptionCheckoutResponse> {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/subscriptions/purchase`, payload)
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Błąd przy inicjalizacji checkout')
    }
    
    return data.data as SubscriptionCheckoutResponse
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Błąd przy inicjalizacji checkout'
    throw new Error(message)
  }
}

/**
 * Potwierdza płatność i pobiera szczegóły boost/subskrypcji
 */
export async function confirmPayment(
  sessionId: string,
  type: 'boost' | 'subscription'
): Promise<any> {
  try {
    const endpoint = type === 'boost'
      ? `${API_BASE_URL}/boosts/success?session_id=${sessionId}`
      : `${API_BASE_URL}/subscriptions/success?session_id=${sessionId}`
    
    const { data } = await axios.get(endpoint)
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Błąd przy potwierdzaniu płatności')
    }
    
    return data.data
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Błąd przy potwierdzaniu płatności'
    throw new Error(message)
  }
}

/**
 * Przedłuża boost
 */
export async function renewBoost(boostId: number, days: number): Promise<any> {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/boosts/${boostId}/renew`, { days })
    
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Błąd przy przedłużeniu boost')
    }
    
    return data.data
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Błąd przy przedłużeniu boost'
    throw new Error(message)
  }
}

/**
 * Anuluje boost
 */
export async function cancelBoost(boostId: number): Promise<void> {
  try {
    const { data } = await axios.delete(`${API_BASE_URL}/boosts/${boostId}`)
    
    if (!data.success) {
      throw new Error(data.message || 'Błąd przy anulowaniu boost')
    }
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Błąd przy anulowaniu boost'
    throw new Error(message)
  }
}

/**
 * Pobiera listę boost'ów użytkownika
 */
export async function fetchUserBoosts(): Promise<any[]> {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/boosts`)
    
    if (!data.success) {
      throw new Error(data.message || 'Błąd przy pobieraniu boost')
    }
    
    return data.data || []
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Błąd przy pobieraniu boost'
    throw new Error(message)
  }
}

/**
 * Pobiera listę planów subskrypcji
 */
export async function fetchSubscriptionPlans(): Promise<any[]> {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/subscription-plans`)
    
    if (!data.success) {
      throw new Error(data.message || 'Błąd przy pobieraniu planów')
    }
    
    return data.data || []
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Błąd przy pobieraniu planów'
    throw new Error(message)
  }
}

/**
 * Pobiera aktywną subskrypcję użytkownika
 */
export async function fetchActiveSubscription(): Promise<any | null> {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/subscriptions/active`)
    
    if (!data.success) {
      return null
    }
    
    return data.data || null
  } catch {
    return null
  }
}
