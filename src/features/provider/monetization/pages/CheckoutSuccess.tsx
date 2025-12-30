/**
 * Strona potwierdzenia płatności (sukces)
 */

import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { confirmPayment } from '../utils/paymentHandler'
import type { Boost } from '../types/boost'
import type { Subscription } from '../types/subscription'

interface PaymentResult {
  type: 'boost' | 'subscription'
  data: Boost | Subscription
  loading: boolean
  error: string | null
}

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<PaymentResult>({
    type: 'boost',
    data: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const type = searchParams.get('type') as 'boost' | 'subscription'

    if (!sessionId || !type) {
      setResult(prev => ({
        ...prev,
        loading: false,
        error: 'Brakuje parametrów potwierdzenia'
      }))
      return
    }

    confirmPayment(sessionId, type)
      .then(data => {
        setResult({
          type,
          data,
          loading: false,
          error: null
        })
      })
      .catch(error => {
        setResult(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Błąd potwierdzenia płatności'
        }))
      })
  }, [searchParams])

  if (result.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-gray-600">Potwierdzanie płatności...</p>
        </div>
      </div>
    )
  }

  if (result.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="p-8 bg-red-50 border border-red-300 rounded-lg text-center">
            <div className="text-4xl text-red-600 mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Błąd</h1>
            <p className="text-red-700 mb-8">{result.error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Wróć do strony głównej
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-teal-50 to-cyan-50">
      <div className="max-w-lg w-full">
        {/* Ikona sukcesu */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Płatność Potwierdzona</h1>
        </div>

        {/* Szczegóły */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {result.type === 'boost' && result.data && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-teal-600">Boost Aktywny</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Typ:</span>
                  <span className="font-semibold">{(result.data as Boost).type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lokalizacja:</span>
                  <span className="font-semibold">
                    {(result.data as Boost).city || (result.data as Boost).category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wygaśnie:</span>
                  <span className="font-semibold">
                    {new Date((result.data as Boost).expires_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-semibold">Cena:</span>
                  <span className="text-teal-600 font-bold">{(result.data as Boost).price.toFixed(2)} PLN</span>
                </div>
              </div>
            </div>
          )}

          {result.type === 'subscription' && result.data && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-teal-600">Subskrypcja Aktywna</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">{(result.data as Subscription).plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Okres:</span>
                  <span className="font-semibold">{(result.data as Subscription).billing_period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Koniec okresu:</span>
                  <span className="font-semibold">
                    {new Date((result.data as Subscription).current_period_end).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-semibold">Cena:</span>
                  <span className="text-teal-600 font-bold">{(result.data as Subscription).price.toFixed(2)} PLN</span>
                </div>
              </div>
            </div>
          )}

          {/* Wiadomość informacyjna */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Dziękujemy!</strong> Twoja płatność została przetworzona. Możesz teraz korzystać z pełnych funkcji.
            </p>
          </div>

          {/* Przyciski akcji */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/provider/dashboard')}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Mój Panel
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Strona Główna
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
