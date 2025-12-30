/**
 * Komponent do wyświetlania listy aktywnych boostów usługodawcy
 */

import React from 'react'
import { useBoost } from '../hooks/useBoost'
import { useCountdown } from '../hooks/useCountdown'
import { BOOST_TYPE_LABELS, BOOST_PRICES } from '../types/boost'

interface BoostCardProps {
  boostId: number
  type: string
  city?: string
  category?: string
  expiresAt: string
  price: number
  onRenew: (boostId: number) => void
  onCancel: (boostId: number) => void
  isLoading?: boolean
}

const BoostCard: React.FC<BoostCardProps> = ({
  boostId,
  type,
  city,
  category,
  expiresAt,
  price,
  onRenew,
  onCancel,
  isLoading
}) => {
  const countdown = useCountdown(expiresAt)
  const isExpiringSoon = countdown.days === 0 || (countdown.days === 1 && countdown.hours < 12)
  const isExpired = countdown.days < 0

  if (isExpired) return null // Nie wyświetlaj wygasłych

  return (
    <div className={`p-6 rounded-lg border-2 ${
      isExpiringSoon
        ? 'border-orange-300 bg-orange-50'
        : 'border-green-300 bg-green-50'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {BOOST_TYPE_LABELS[type as keyof typeof BOOST_TYPE_LABELS]}
          </h3>
          <p className="text-gray-600">
            {type === 'city_boost' ? city : category}
          </p>
        </div>
        {isExpiringSoon && (
          <span className="px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded-full">
            Wygasa wkrótce
          </span>
        )}
      </div>

      {/* Countdown */}
      <div className="mb-6 p-4 bg-white rounded-lg">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600 mb-2">Czas pozostały:</p>
            <div className="flex gap-4 text-center">
              {[
                { value: countdown.days, label: 'dni' },
                { value: countdown.hours, label: 'godz' },
                { value: countdown.minutes, label: 'min' },
                { value: countdown.seconds, label: 'sek' }
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-teal-600">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Cena</p>
            <p className="text-2xl font-bold text-teal-600">{price.toFixed(2)} PLN</p>
          </div>
        </div>
      </div>

      {/* Wygaśnie */}
      <p className="text-sm text-gray-600 mb-4">
        Wygaśnie: <strong>{new Date(expiresAt).toLocaleDateString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</strong>
      </p>

      {/* Przyciski akcji */}
      <div className="flex gap-3">
        <button
          onClick={() => onRenew(boostId)}
          disabled={isLoading}
          className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
        >
          {isLoading ? 'Przetwarzanie...' : 'Przedłuż'}
        </button>
        <button
          onClick={() => {
            if (confirm('Na pewno chcesz anulować ten boost?')) {
              onCancel(boostId)
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
        >
          Anuluj
        </button>
      </div>
    </div>
  )
}

export const BoostList: React.FC = () => {
  const {
    boosts,
    isLoading,
    error,
    renewBoost,
    cancelBoost
  } = useBoost()

  const activeBoosts = boosts.filter(b => {
    const expiresAt = new Date(b.expires_at)
    return expiresAt > new Date()
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-3" />
        <p className="text-gray-500">Ładowanie booostów...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
        <p className="text-red-700">
          <strong>Błąd:</strong> {error}
        </p>
      </div>
    )
  }

  if (activeBoosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Nie masz żadnych aktywnych booostów</p>
        <a
          href="/monetization/boost"
          className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Kup boost
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Moje Booosty</h2>
        <p className="text-gray-600">Zarządzaj swoimi aktywnymi booostami</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeBoosts.map(boost => (
          <BoostCard
            key={boost.id}
            boostId={boost.id}
            type={boost.type}
            city={boost.city}
            category={boost.category}
            expiresAt={boost.expires_at}
            price={boost.price}
            onRenew={() => {
              // Modal do wyboru liczby dni
              const days = prompt('Ile dni? (7, 14 lub 30):', '7')
              if (days && ['7', '14', '30'].includes(days)) {
                renewBoost.mutate({ boostId: boost.id, days: parseInt(days) })
              }
            }}
            onCancel={() => cancelBoost.mutate(boost.id)}
            isLoading={renewBoost.isPending || cancelBoost.isPending}
          />
        ))}
      </div>

      {/* Przycisk do kupienia nowego */}
      <div className="mt-8 text-center">
        <a
          href="/monetization/boost"
          className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          + Kup kolejny boost
        </a>
      </div>
    </div>
  )
}
