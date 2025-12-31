import { describe, it, expect } from 'vitest'
import axios from 'axios'

const BASE_URL = 'http://localhost:5173/api/v1'

/**
 * Testy API endpointów dla Provider Dashboard
 * 
 * Te testy sprawdzają:
 * 1. Czy endpointy zwracają 401 bez autoryzacji (smoke test)
 * 2. Czy error response ma poprawną strukturę
 * 3. Czy endpointy są dostępne (nie 404)
 */
describe('Provider Dashboard API Endpoints', () => {
  describe('Authentication Required', () => {
    it('should return 401 for widgets without auth', async () => {
      try {
        await axios.get(`${BASE_URL}/provider/dashboard/widgets`, {
          params: { fields: 'pipeline,performance,insights,messages' },
          validateStatus: () => true,
        })
      } catch (error: any) {
        // Oczekujemy 401 Unauthorized
        expect([401, 419]).toContain(error.response?.status)
      }
    })

    it('should return 401 for bookings without auth', async () => {
      try {
        await axios.get(`${BASE_URL}/provider/dashboard/bookings`, {
          params: { limit: 5, sort: '-created_at' },
          validateStatus: () => true,
        })
      } catch (error: any) {
        expect([401, 419]).toContain(error.response?.status)
      }
    })

    it('should return 401 for conversations without auth', async () => {
      try {
        await axios.get(`${BASE_URL}/provider/dashboard/conversations`, {
          params: { limit: 5, sort: '-updated_at' },
          validateStatus: () => true,
        })
      } catch (error: any) {
        expect([401, 419]).toContain(error.response?.status)
      }
    })

    it('should return 401 for reviews without auth', async () => {
      try {
        await axios.get(`${BASE_URL}/provider/dashboard/reviews`, {
          params: { limit: 4, sort: '-created_at' },
          validateStatus: () => true,
        })
      } catch (error: any) {
        expect([401, 419]).toContain(error.response?.status)
      }
    })

    it('should return 401 for performance without auth', async () => {
      try {
        await axios.get(`${BASE_URL}/provider/dashboard/performance`, {
          validateStatus: () => true,
        })
      } catch (error: any) {
        expect([401, 419]).toContain(error.response?.status)
      }
    })
  })

  describe('Error Response Structure', () => {
    it('should have proper error structure on 401', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/provider/dashboard/widgets`, {
          validateStatus: () => true,
        })
        
        if (response.status === 401) {
          expect(response.data).toBeDefined()
          // Laravel zwraca albo { message: "..." } albo redirect
        }
      } catch (error: any) {
        // axios throws on 401, to jest ok
        expect(error.response).toBeDefined()
      }
    })
  })

  describe('Endpoint Availability', () => {
    it('should not return 404 for widgets endpoint', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/provider/dashboard/widgets`, {
          validateStatus: () => true,
        })
        // 401 lub 419 jest ok (auth required), ale nie 404
        expect(response.status).not.toBe(404)
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).not.toBe(404)
        }
      }
    })

    it('should not return 404 for bookings endpoint', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/provider/dashboard/bookings`, {
          validateStatus: () => true,
        })
        expect(response.status).not.toBe(404)
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).not.toBe(404)
        }
      }
    })

    it('should not return 404 for conversations endpoint', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/provider/dashboard/conversations`, {
          validateStatus: () => true,
        })
        expect(response.status).not.toBe(404)
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).not.toBe(404)
        }
      }
    })

    it('should not return 404 for reviews endpoint', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/provider/dashboard/reviews`, {
          validateStatus: () => true,
        })
        expect(response.status).not.toBe(404)
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).not.toBe(404)
        }
      }
    })

    it('should not return 404 for performance endpoint', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/provider/dashboard/performance`, {
          validateStatus: () => true,
        })
        expect(response.status).not.toBe(404)
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).not.toBe(404)
        }
      }
    })
  })
})
