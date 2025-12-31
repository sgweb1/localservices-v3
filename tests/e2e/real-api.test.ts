import { describe, it, expect, beforeAll } from 'vitest'
import axios from 'axios'

/**
 * REAL API TESTS - testuje prawdziwy Laravel backend
 * 
 * Wymagania:
 * - php artisan serve (Laravel backend na :8000)
 * - Zalogowany provider lub test auth token
 * 
 * Uruchomienie:
 * npm test -- tests/e2e/real-api.test.ts --run
 */

const API_BASE_URL = 'http://localhost:8000/api/v1'

// Opcjonalnie: auth token z localStorage (jeśli masz zalogowanego usera)
const getAuthToken = () => {
  // Możesz ustawić token tutaj ręcznie, jeśli masz
  return process.env.TEST_AUTH_TOKEN || null
}

// Tworzymy axios instancję jak w aplikacji
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Dodaj token jeśli dostępny
const token = getAuthToken()
if (token) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

describe('Real API Tests (Live Backend)', () => {
  beforeAll(() => {
    console.log('🚀 Testing REAL API at:', API_BASE_URL)
    console.log('🔐 Auth token:', token ? 'Yes' : 'No (will get 401)')
  })

  describe('GET /provider/dashboard/widgets', () => {
    it('should return 200 or 401', async () => {
      try {
        const response = await apiClient.get('/provider/dashboard/widgets', {
          params: { fields: 'pipeline,performance,insights,messages' },
          validateStatus: () => true, // Don't throw on any status
        })

        console.log('Status:', response.status)
        console.log('Response:', response.data)

        // Akceptujemy 200 (success) lub 401 (no auth)
        expect([200, 401]).toContain(response.status)

        if (response.status === 200) {
          console.log('✅ Successfully fetched widgets')
          expect(response.data).toBeDefined()
          expect(response.data.pipeline || response.data).toBeDefined()
        } else if (response.status === 401) {
          console.log('⚠️ 401 Unauthenticated (expected)')
          expect(response.data.message).toContain('Unauthenticated')
        }
      } catch (error: any) {
        console.error('❌ Request failed:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        })
        throw error
      }
    }, 10000)
  })

  describe('GET /provider/dashboard/bookings', () => {
    it('should return 200 or 401', async () => {
      try {
        const response = await apiClient.get('/provider/dashboard/bookings', {
          params: { limit: 5, sort: '-created_at' },
          validateStatus: () => true,
        })

        console.log('Status:', response.status)

        expect([200, 401]).toContain(response.status)

        if (response.status === 200) {
          console.log('✅ Successfully fetched bookings')
          expect(response.data.data).toBeDefined()
        } else if (response.status === 401) {
          console.log('⚠️ 401 Unauthenticated')
        }
      } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message)
        throw error
      }
    }, 10000)
  })

  describe('GET /provider/dashboard/conversations', () => {
    it('should return 200 or 401', async () => {
      try {
        const response = await apiClient.get('/provider/dashboard/conversations', {
          params: { limit: 5, sort: '-updated_at' },
          validateStatus: () => true,
        })

        console.log('Status:', response.status)

        expect([200, 401]).toContain(response.status)

        if (response.status === 200) {
          console.log('✅ Successfully fetched conversations')
          expect(response.data.data).toBeDefined()
        }
      } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message)
        throw error
      }
    }, 10000)
  })

  describe('GET /provider/dashboard/reviews', () => {
    it('should return 200 or 401', async () => {
      try {
        const response = await apiClient.get('/provider/dashboard/reviews', {
          params: { limit: 4, sort: '-created_at' },
          validateStatus: () => true,
        })

        console.log('Status:', response.status)

        expect([200, 401]).toContain(response.status)

        if (response.status === 200) {
          console.log('✅ Successfully fetched reviews')
          expect(response.data.data).toBeDefined()
        }
      } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message)
        throw error
      }
    }, 10000)
  })

  describe('GET /provider/dashboard/performance', () => {
    it('should return 200 or 401', async () => {
      try {
        const response = await apiClient.get('/provider/dashboard/performance', {
          validateStatus: () => true,
        })

        console.log('Status:', response.status)
        console.log('Response:', response.data)

        expect([200, 401]).toContain(response.status)

        if (response.status === 200) {
          console.log('✅ Successfully fetched performance')
          expect(response.data).toBeDefined()
          expect(response.data.views).toBeDefined()
        }
      } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message)
        throw error
      }
    }, 10000)
  })

  describe('Error handling', () => {
    it('should handle 404 for non-existent endpoint', async () => {
      try {
        const response = await apiClient.get('/provider/dashboard/nonexistent', {
          validateStatus: () => true,
        })

        console.log('Status:', response.status)

        // Powinien być 404
        expect(response.status).toBe(404)
        console.log('✅ 404 handled correctly')
      } catch (error: any) {
        console.error('❌ Unexpected error:', error.response?.data || error.message)
        throw error
      }
    }, 10000)
  })
})
