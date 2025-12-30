/**
 * Komponent do wyświetlania aktywnej subskrypcji
 */

import React from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { BILLING_PERIOD_LABELS } from '../types/subscription'

export const SubscriptionList: React.FC = () => {
  const { activeSubscription, isLoading, error } = useSubscription()

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-3" />
        <p className="text-gray-500">Ładowanie subskrypcji...</p>
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

  if (!activeSubscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Nie masz aktywnej subskrypcji</p>
        <a
          href="/monetization/subscription"
          className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          Wybierz plan
        </a>
      </div>
    )
  }

  const isRenewingSoon = new Date(activeSubscription.current_period_end) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const daysUntilRenewal = Math.ceil(
    (new Date(activeSubscription.current_period_end).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Moja Subskrypcja</h2>
        <p className="text-gray-600">Zarządzaj swoim aktualnym planem</p>
      </div>

      <div className={`p-8 rounded-lg border-2 ${
        isRenewingSoon
          ? 'border-orange-300 bg-orange-50'
          : 'border-green-300 bg-green-50'
      }`}>
        {/* Nagłówek */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {activeSubscription.plan_name}
            </h3>
            <p className="text-gray-600 text-lg">
              {activeSubscription.description}
            </p>
          </div>
          {isRenewingSoon && (
            <span className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-full text-sm">
              Odnawia się wkrótce
            </span>
          )}
        </div>

        {/* Informacje */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-white rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Okres</p>
            <p className="text-lg font-bold text-teal-600">
              {BILLING_PERIOD_LABELS[activeSubscription.billing_period]}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Cena</p>
            <p className="text-lg font-bold text-teal-600">
              {activeSubscription.price.toFixed(2)} PLN
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-lg font-bold text-green-600">Aktywna</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Odnowienie</p>
            <p className="text-lg font-bold text-gray-900">
              {daysUntilRenewal} dni
            </p>
          </div>
        </div>

        {/* Cechy */}
        <div className="mb-8 p-6 bg-white rounded-lg">
          <h4 className="font-bold mb-4 text-gray-900">Co jest w tym planie:</h4>
          <ul className="space-y-2">
            {activeSubscription.features?.map((feature, i) => (
              <li key={i} className="flex items-start text-gray-700">
                <span className="text-green-600 mr-3 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Daty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm">
          <div className="p-4 bg-white rounded-lg">
            <p className="text-gray-600 mb-1">Rozpoczęcie okresu</p>
            <p className="font-semibold text-gray-900">
              {new Date(activeSubscription.current_period_start).toLocaleDateString('pl-PL')}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-gray-600 mb-1">Koniec okresu</p>
            <p className="font-semibold text-gray-900">
              {new Date(activeSubscription.current_period_end).toLocaleDateString('pl-PL')}
            </p>
          </div>
        </div>

        {/* Wiadomość */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Informacja:</strong> Twoja subskrypcja będzie automatycznie odnawiana na dzień przed jej wygaśnięciem.
          </p>
        </div>

        {/* Przyciski akcji */}
        <div className="flex gap-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Zmień plan
          </button>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            onClick={() => {
              if (confirm('Na pewno chcesz anulować subskrypcję?')) {
                // TODO: Zaimplementować anulowanie
                alert('Funkcja anulowania w przygotowaniu')
              }
            }}
          >
            Anuluj subskrypcję
          </button>
        </div>
      </div>

      {/* Link do zakupienia */}
      <div className="mt-8 text-center">
        <a
          href="/monetization/subscription"
          className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Zobacz inne plany
        </a>
      </div>
    </div>
  )
}
