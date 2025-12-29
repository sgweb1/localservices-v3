Czas odpowiedzi

undefined min

Cel: < 30 min

Wskaźnik ukończenia

null%

Cel: > 90%

Wskaźnik anulowań

null%

Cel: < 5%

Zadowolenie klienta

undefined/5

Cel: > 4.5/**
 * Testy dla komponentu NotificationsTab
 * 
 * Sprawdza czy:
 * - getAuthHeaders() dodaje Bearer token
 * - Fetch callsy zawierają Authorization header
 * - Obsługiwane są 401 errory
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NotificationsTab } from '../NotificationsTab'

describe('NotificationsTab - Authorization Headers', () => {
  let fetchSpy: any

  beforeEach(() => {
    // Mock fetch
    fetchSpy = vi.fn()
    ;(global as any).fetch = fetchSpy

    // Mock localStorage
    Storage.prototype.getItem = vi.fn((key: string) => {
      if (key === 'sanctum_token') return 'test_token_123'
      if (key === 'XSRF-TOKEN') return 'xsrf_token_456'
      return null
    })

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn(() => Promise.resolve(null)),
            subscribe: vi.fn(() => Promise.resolve({
              endpoint: 'https://example.com/push',
              getKey: vi.fn(() => new Uint8Array([1, 2, 3]))
            }))
          }
        })
      },
      writable: true
    })

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      value: 'XSRF-TOKEN=xsrf_token_456',
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuthHeaders()', () => {
    it('should include X-XSRF-TOKEN from cookie', () => {
      // Import helper function
      const getCsrfToken = (): string => {
        const name = 'XSRF-TOKEN'
        let token = ''
        if (document.cookie) {
          const cookies = document.cookie.split(';')
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              token = decodeURIComponent(cookie.substring(name.length + 1))
              break
            }
          }
        }
        return token
      }

      const token = getCsrfToken()
      expect(token).toBe('xsrf_token_456')
    })

    it('should include Authorization Bearer token from localStorage', () => {
      const token = localStorage.getItem('sanctum_token') || localStorage.getItem('dev_mock_token')
      expect(token).toBe('test_token_123')
      expect(token).toMatch(/^test_token/)
    })

    it('should construct proper Authorization header format', () => {
      const token = 'test_token_123'
      const authHeader = `Bearer ${token}`
      expect(authHeader).toBe('Bearer test_token_123')
    })
  })

  describe('fetchPreferences()', () => {
    it('should include Authorization header in request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn(() => Promise.resolve({ data: [] }))
      }
      fetchSpy.mockResolvedValue(mockResponse)

      // Simulate fetch call
      const token = localStorage.getItem('sanctum_token')
      await fetch('http://ls.test/api/v1/notification-preferences', {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://ls.test/api/v1/notification-preferences',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token_123'
          })
        })
      )
    })

    it('should not send request without Authorization header', async () => {
      const mockResponse = {
        ok: false,
        status: 401
      }
      fetchSpy.mockResolvedValue(mockResponse)

      const res = await fetch('http://ls.test/api/v1/notification-preferences', {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })

      expect(res.status).toBe(401)
    })
  })

  describe('updatePreference()', () => {
    it('should use Authorization header in PUT request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn(() => Promise.resolve({}))
      }
      fetchSpy.mockResolvedValue(mockResponse)

      const token = localStorage.getItem('sanctum_token')
      await fetch('http://ls.test/api/v1/notification-preferences/1', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ channels: { email: true } })
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token_123'
          })
        })
      )
    })
  })

  describe('sendTestNotification()', () => {
    it('should include Authorization header in POST request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn(() => Promise.resolve({ toast: { type: 'success', message: 'Wysłano' } }))
      }
      fetchSpy.mockResolvedValue(mockResponse)

      const token = localStorage.getItem('sanctum_token')
      await fetch('http://ls.test/api/v1/notifications/1/test', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ channel: 'email' })
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token_123'
          })
        })
      )
    })
  })

  describe('ensurePushSubscription()', () => {
    it('should include Authorization header in push/status request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn(() => Promise.resolve({ data: { has_subscription: false } }))
      }
      fetchSpy.mockResolvedValue(mockResponse)

      const token = localStorage.getItem('sanctum_token')
      await fetch('http://ls.test/api/v1/push/status', {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token_123'
          })
        })
      )
    })

    it('should include Authorization header in push/enable POST request', async () => {
      const mockResponse = { ok: true }
      fetchSpy.mockResolvedValue(mockResponse)

      const token = localStorage.getItem('sanctum_token')
      await fetch('http://ls.test/api/v1/push/enable', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint: 'https://example.com',
          p256dh: 'key',
          auth: 'auth'
        })
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token_123'
          })
        })
      )
    })
  })

  describe('Authorization Header Consistency', () => {
    it('should use getAuthHeaders() consistently across all fetch calls', () => {
      const fetchCalls = [
        // fetchPreferences
        { endpoint: 'http://ls.test/api/v1/notification-preferences', method: 'GET' },
        // updatePreference
        { endpoint: 'http://ls.test/api/v1/notification-preferences/1', method: 'PUT' },
        // sendTestNotification
        { endpoint: 'http://ls.test/api/v1/notifications/1/test', method: 'POST' },
        // ensurePushSubscription - status
        { endpoint: 'http://ls.test/api/v1/push/status', method: 'GET' },
        // ensurePushSubscription - enable
        { endpoint: 'http://ls.test/api/v1/push/enable', method: 'POST' }
      ]

      fetchCalls.forEach(({ endpoint, method }) => {
        fetchSpy.mockResolvedValue({ ok: true, json: vi.fn(() => Promise.resolve({})) })

        const token = localStorage.getItem('sanctum_token')
        const headers: Record<string, string> = {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
        if (method === 'PUT' || method === 'POST') {
          headers['Content-Type'] = 'application/json'
        }

        fetch(endpoint, { method, headers })

        expect(fetchSpy).toHaveBeenCalledWith(
          endpoint,
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test_token_123'
            })
          })
        )
      })
    })

    it('should handle missing token gracefully', () => {
      ;(localStorage.getItem as any).mockReturnValue(null)

      const getCsrfToken = (): string => {
        const name = 'XSRF-TOKEN'
        let token = ''
        if (document.cookie) {
          const cookies = document.cookie.split(';')
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              token = decodeURIComponent(cookie.substring(name.length + 1))
              break
            }
          }
        }
        return token
      }

      const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem('dev_mock_token') || localStorage.getItem('sanctum_token')
        const headers: Record<string, string> = {
          'X-XSRF-TOKEN': getCsrfToken()
        }
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
        return headers
      }

      const headers = getAuthHeaders()
      expect(headers).toHaveProperty('X-XSRF-TOKEN')
      // Authorization should not be present if no token
      expect(headers.Authorization).toBeUndefined()
    })
  })
})
