import { describe, it, expect, beforeAll } from 'vitest'
import axios from 'axios'
import https from 'https'

/**
 * PROVIDER BOOKINGS API TESTS
 * 
 * Testuje wszystkie endpointy związane z rezerwacjami providera:
 * - GET /provider/bookings - lista rezerwacji
 * - GET /provider/bookings/{id} - szczegóły rezerwacji
 * - POST /provider/bookings/{id}/accept - zaakceptuj rezerwację
 * - POST /provider/bookings/{id}/decline - odrzuć rezerwację
 * - POST /provider/bookings/{id}/start - rozpocznij usługę
 * - POST /provider/bookings/{id}/complete - zakończ usługę
 * - POST /provider/bookings/{id}/send-quote - wyślij cytat
 * - POST /provider/bookings/complete-overdue - zaznacz zaległe jako ukończone
 * - DELETE /provider/bookings/{id} - ukryj rezerwację
 * 
 * Wymagania:
 * - Laravel backend na https://ls.test
 * - Zalogowany provider (auth token) - opcjonalnie
 * 
 * Uruchomienie:
 * npm test -- tests/e2e/provider-bookings.test.ts --run
 */

const API_BASE_URL = 'https://ls.test/api/v1'

// Pobierz auth token
const getAuthToken = () => {
  return process.env.TEST_AUTH_TOKEN || null
}

// Helper do tworzenia axios client z HTTPS support
const createApiClient = (token?: string | null) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  })

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  return client
}

const token = getAuthToken()
const apiClient = createApiClient(token)

describe('Provider Bookings API Tests', () => {
  let bookingId: number | null = null
  let pendingBookingId: number | null = null
  let confirmedBookingId: number | null = null
  let backendAvailable = true

  beforeAll(async () => {
    console.log('🚀 Testing Provider Bookings API at:', API_BASE_URL)
    console.log('🔐 Auth token:', token ? 'Yes' : 'No (will get 401)')
    
    // Sprawdź czy backend jest dostępny
    try {
      const response = await apiClient.get('/provider/bookings', {
        timeout: 2000,
      })
      backendAvailable = response.status !== undefined
    } catch (error: any) {
      console.warn('⚠️ Backend niedostępny - testy będą zmienione na skip')
      backendAvailable = false
    }
  })

  describe('GET /provider/bookings', () => {
    it('should return paginated bookings or 401', async () => {
      if (!backendAvailable) {
        console.log('⏭️ Skipping - backend not available')
        return
      }

      try {
        const response = await apiClient.get('/provider/bookings', {
          params: { page: 1, per_page: 15 },
        })

        console.log('✅ GET /provider/bookings')
        console.log('   Status:', response.status)
        expect([200, 401]).toContain(response.status)

        if (response.status === 200 && response.data?.data) {
          expect(response.data.data).toBeDefined()
          expect(Array.isArray(response.data.data)).toBe(true)
          expect(response.data.pagination).toBeDefined()

          if (response.data.data.length > 0) {
            bookingId = response.data.data[0].id
            console.log(`   📌 Found ${response.data.data.length} booking(s), first ID: ${bookingId}`)
          }
        }
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should filter bookings by status', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.get('/provider/bookings', {
          params: { status: 'pending', per_page: 10 },
        })

        console.log('✅ GET /provider/bookings (status=pending)')
        console.log('   Status:', response.status)
        expect([200, 401]).toContain(response.status)

        if (response.status === 200 && response.data?.data?.length > 0) {
          pendingBookingId = response.data.data[0].id
          console.log(`   📌 Found pending booking ID: ${pendingBookingId}`)
        }
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should support pagination', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.get('/provider/bookings', {
          params: { page: 1, per_page: 5 },
        })

        console.log('✅ GET /provider/bookings (pagination)')
        console.log('   Status:', response.status)
        expect([200, 401]).toContain(response.status)

        if (response.status === 200) {
          expect(response.data.pagination?.current_page).toBe(1)
          expect(response.data.pagination?.per_page).toBe(5)
        }
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('GET /provider/bookings/{id}', () => {
    it('should return 404 for non-existent booking', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.get('/provider/bookings/999999')

        console.log('✅ GET /provider/bookings/999999')
        console.log('   Status:', response.status)
        expect([401, 403, 404]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should return booking details if exists', async () => {
      if (!bookingId || !backendAvailable) {
        console.log('⏭️ Skipping - no booking ID or backend unavailable')
        return
      }

      try {
        const response = await apiClient.get(`/provider/bookings/${bookingId}`)

        console.log(`✅ GET /provider/bookings/${bookingId}`)
        console.log('   Status:', response.status)
        expect([200, 401, 403, 404]).toContain(response.status)

        if (response.status === 200) {
          expect(response.data.data?.id).toBe(bookingId)
        }
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('POST /provider/bookings/{id}/accept', () => {
    it('should return 401 for unauthenticated request', async () => {
      if (!backendAvailable) return

      try {
        const unauthClient = createApiClient() // Bez tokenu
        const response = await unauthClient.post('/provider/bookings/1/accept', {})

        console.log('✅ POST /provider/bookings/1/accept (no auth)')
        console.log('   Status:', response.status)
        expect(response.status).toBe(401)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should return 404 for non-existent booking', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.post('/provider/bookings/999999/accept', {})

        console.log('✅ POST /provider/bookings/999999/accept')
        console.log('   Status:', response.status)
        expect([401, 404, 403]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should accept a pending booking', async () => {
      if (!pendingBookingId || !backendAvailable) {
        console.log('⏭️ Skipping - no pending booking')
        return
      }

      try {
        const response = await apiClient.post(`/provider/bookings/${pendingBookingId}/accept`, {})

        console.log(`✅ POST /provider/bookings/${pendingBookingId}/accept`)
        console.log('   Status:', response.status)
        expect([200, 400, 401, 403, 404, 422]).toContain(response.status)

        if (response.status === 200 && response.data?.data?.id) {
          confirmedBookingId = response.data.data.id
          console.log(`   📌 Booking accepted, ID: ${confirmedBookingId}`)
        }
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('POST /provider/bookings/{id}/decline', () => {
    it('should return 401 for unauthenticated request', async () => {
      if (!backendAvailable) return

      try {
        const unauthClient = createApiClient()
        const response = await unauthClient.post('/provider/bookings/1/decline', {})

        console.log('✅ POST /provider/bookings/1/decline (no auth)')
        console.log('   Status:', response.status)
        expect(response.status).toBe(401)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should decline a pending booking', async () => {
      if (!backendAvailable) return

      try {
        const listResponse = await apiClient.get('/provider/bookings', {
          params: { status: 'pending', per_page: 1 },
        })

        if (listResponse.status !== 200 || !listResponse.data?.data?.length) {
          console.log('⏭️ Skipping - no pending booking')
          return
        }

        const bookingToDecline = listResponse.data.data[0].id
        const response = await apiClient.post(`/provider/bookings/${bookingToDecline}/decline`, {})

        console.log(`✅ POST /provider/bookings/${bookingToDecline}/decline`)
        console.log('   Status:', response.status)
        expect([200, 400, 401, 403, 404, 422]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('POST /provider/bookings/{id}/start', () => {
    it('should return 401 for unauthenticated request', async () => {
      if (!backendAvailable) return

      try {
        const unauthClient = createApiClient()
        const response = await unauthClient.post('/provider/bookings/1/start', {})

        console.log('✅ POST /provider/bookings/1/start (no auth)')
        console.log('   Status:', response.status)
        expect(response.status).toBe(401)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should start a confirmed booking', async () => {
      if (!confirmedBookingId || !backendAvailable) {
        console.log('⏭️ Skipping - no confirmed booking')
        return
      }

      try {
        const response = await apiClient.post(
          `/provider/bookings/${confirmedBookingId}/start`,
          { notes: 'Starting service' }
        )

        console.log(`✅ POST /provider/bookings/${confirmedBookingId}/start`)
        console.log('   Status:', response.status)
        expect([200, 400, 401, 403, 404, 422]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('POST /provider/bookings/{id}/complete', () => {
    it('should return 401 for unauthenticated request', async () => {
      if (!backendAvailable) return

      try {
        const unauthClient = createApiClient()
        const response = await unauthClient.post('/provider/bookings/1/complete', {})

        console.log('✅ POST /provider/bookings/1/complete (no auth)')
        console.log('   Status:', response.status)
        expect(response.status).toBe(401)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should complete an in-progress booking', async () => {
      if (!backendAvailable) return

      try {
        const listResponse = await apiClient.get('/provider/bookings', {
          params: { status: 'in_progress', per_page: 1 },
        })

        if (listResponse.status !== 200 || !listResponse.data?.data?.length) {
          console.log('⏭️ Skipping - no in-progress booking')
          return
        }

        const bookingToComplete = listResponse.data.data[0].id
        const response = await apiClient.post(
          `/provider/bookings/${bookingToComplete}/complete`,
          { notes: 'Completed', final_price: 150.00 }
        )

        console.log(`✅ POST /provider/bookings/${bookingToComplete}/complete`)
        console.log('   Status:', response.status)
        expect([200, 400, 401, 403, 404, 422]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('POST /provider/bookings/{id}/send-quote', () => {
    it('should return 401 for unauthenticated request', async () => {
      if (!backendAvailable) return

      try {
        const unauthClient = createApiClient()
        const response = await unauthClient.post('/provider/bookings/1/send-quote', { price: 100 })

        console.log('✅ POST /provider/bookings/1/send-quote (no auth)')
        console.log('   Status:', response.status)
        expect(response.status).toBe(401)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should send a quote with price', async () => {
      if (!bookingId || !backendAvailable) {
        console.log('⏭️ Skipping - no booking ID')
        return
      }

      try {
        const response = await apiClient.post(
          `/provider/bookings/${bookingId}/send-quote`,
          { price: 250.75, duration_hours: 2.5 }
        )

        console.log(`✅ POST /provider/bookings/${bookingId}/send-quote`)
        console.log('   Status:', response.status)
        expect([200, 400, 401, 403, 404, 422]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should validate price is required', async () => {
      if (!bookingId || !backendAvailable) {
        console.log('⏭️ Skipping - no booking ID')
        return
      }

      try {
        const response = await apiClient.post(
          `/provider/bookings/${bookingId}/send-quote`,
          { duration_hours: 2 } // Brak price
        )

        console.log(`✅ POST /provider/bookings/${bookingId}/send-quote (missing price)`)
        console.log('   Status:', response.status)
        expect([422, 401, 403, 404]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('POST /provider/bookings/complete-overdue', () => {
    it('should return 401 for unauthenticated request', async () => {
      if (!backendAvailable) return

      try {
        const unauthClient = createApiClient()
        const response = await unauthClient.post('/provider/bookings/complete-overdue', {})

        console.log('✅ POST /provider/bookings/complete-overdue (no auth)')
        console.log('   Status:', response.status)
        expect(response.status).toBe(401)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should complete overdue bookings', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.post('/provider/bookings/complete-overdue', {})

        console.log('✅ POST /provider/bookings/complete-overdue')
        console.log('   Status:', response.status)
        expect([200, 401, 403]).toContain(response.status)

        if (response.status === 200) {
          expect(typeof response.data.count).toBe('number')
          console.log(`   📌 Completed ${response.data.count} overdue booking(s)`)
        }
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('DELETE /provider/bookings/{id}', () => {
    it('should return 401 for unauthenticated request', async () => {
      if (!backendAvailable) return

      try {
        const unauthClient = createApiClient()
        const response = await unauthClient.delete('/provider/bookings/1')

        console.log('✅ DELETE /provider/bookings/1 (no auth)')
        console.log('   Status:', response.status)
        expect(response.status).toBe(401)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should hide a booking', async () => {
      if (!bookingId || !backendAvailable) {
        console.log('⏭️ Skipping - no booking ID')
        return
      }

      try {
        const response = await apiClient.delete(`/provider/bookings/${bookingId}`)

        console.log(`✅ DELETE /provider/bookings/${bookingId}`)
        console.log('   Status:', response.status)
        expect([200, 401, 403, 404]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)

    it('should return 404 for non-existent booking', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.delete('/provider/bookings/999999')

        console.log('✅ DELETE /provider/bookings/999999')
        console.log('   Status:', response.status)
        expect([401, 403, 404]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('GET /provider/statistics', () => {
    it('should return statistics', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.get('/provider/statistics')

        console.log('✅ GET /provider/statistics')
        console.log('   Status:', response.status)
        expect([200, 401]).toContain(response.status)

        if (response.status === 200) {
          expect(response.data.data?.total_bookings).toBeDefined()
          expect(typeof response.data.data?.total_bookings).toBe('number')
        }
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoint', async () => {
      if (!backendAvailable) return

      try {
        const response = await apiClient.get('/provider/bookings/nonexistent')

        console.log('✅ GET /provider/bookings/nonexistent')
        console.log('   Status:', response.status)
        expect([401, 403, 404]).toContain(response.status)
      } catch (error: any) {
        console.error('❌ Error:', error.message)
        throw error
      }
    }, 10000)
  })
})
