/**
 * Hook do licznika odliczającego czas
 */

import { useEffect, useState } from 'react'

export interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Hook odliczający czas do danej daty
 */
export function useCountdown(expiresAt: string | null): CountdownTime {
  const [remaining, setRemaining] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    if (!expiresAt) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const distance = expiry - now

      if (distance <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setRemaining({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }

    // Aktualizuj od razu
    updateCountdown()

    // Potem co sekundę
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  return remaining
}
