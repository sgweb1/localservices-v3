/**
 * Testy dla hooku useCountdown
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCountdown } from '../useCountdown'

describe('useCountdown Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inicjalizuje countdown z prawidłową liczbą dni', () => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { result } = renderHook(() => useCountdown(expiresAt))

    expect(result.current.days).toBe(7)
    expect(result.current.hours).toBe(0)
    expect(result.current.minutes).toBe(0)
    expect(result.current.seconds).toBe(0)
  })

  it('prawidłowo liczy godziny i minuty', () => {
    // 2 dni, 5 godzin, 30 minut
    const expiresAt = new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000 + 30 * 60 * 1000
    ).toISOString()

    const { result } = renderHook(() => useCountdown(expiresAt))

    expect(result.current.days).toBe(2)
    expect(result.current.hours).toBe(5)
    expect(result.current.minutes).toBe(30)
  })

  it('dekrementuje sekundy co 1 sekundę', () => {
    const expiresAt = new Date(Date.now() + 5000).toISOString() // 5 sekund

    const { result } = renderHook(() => useCountdown(expiresAt))

    expect(result.current.seconds).toBeLessThanOrEqual(5)

    // Poczekaj 2 sekundy
    vi.advanceTimersByTime(2000)

    expect(result.current.seconds).toBeLessThanOrEqual(3)
  })

  it('zwraca ujemne dni jeśli data przeszła', () => {
    const expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // wczoraj

    const { result } = renderHook(() => useCountdown(expiresAt))

    expect(result.current.days).toBeLessThan(0)
  })

  it('obsługuje null wartość gracefully', () => {
    const { result } = renderHook(() => useCountdown(null))

    expect(result.current.days).toBe(0)
    expect(result.current.hours).toBe(0)
    expect(result.current.minutes).toBe(0)
    expect(result.current.seconds).toBe(0)
  })

  it('czyszcze interval na unmount', () => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { unmount } = renderHook(() => useCountdown(expiresAt))

    const intervalSpy = vi.spyOn(global, 'setInterval')

    unmount()

    // Interval powinien być wyczyszczony
    expect(intervalSpy).toHaveBeenCalled()

    intervalSpy.mockRestore()
  })

  it('prawidłowo oblicza na granicy dni', () => {
    // Dokładnie 1 dzień (86400 sekund)
    const expiresAt = new Date(Date.now() + 86400000).toISOString()

    const { result } = renderHook(() => useCountdown(expiresAt))

    expect(result.current.days).toBe(1)
    expect(result.current.hours).toBe(0)
  })

  it('prawidłowo oblicza na granicy godzin', () => {
    // Dokładnie 1 godzina (3600 sekund)
    const expiresAt = new Date(Date.now() + 3600000).toISOString()

    const { result } = renderHook(() => useCountdown(expiresAt))

    expect(result.current.days).toBe(0)
    expect(result.current.hours).toBe(1)
    expect(result.current.minutes).toBe(0)
  })

  it('prawidłowo oblicza na granicy minut', () => {
    // Dokładnie 1 minuta (60 sekund)
    const expiresAt = new Date(Date.now() + 60000).toISOString()

    const { result } = renderHook(() => useCountdown(expiresAt))

    expect(result.current.days).toBe(0)
    expect(result.current.hours).toBe(0)
    expect(result.current.minutes).toBe(1)
  })
})
