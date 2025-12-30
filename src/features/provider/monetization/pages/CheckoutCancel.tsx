/**
 * Strona anulowania płatności (błąd)
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

export const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-red-50 to-orange-50">
      <div className="max-w-lg w-full">
        {/* Ikona błędu */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-4xl">✕</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Płatność Anulowana</h1>
        </div>

        {/* Informacja */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
            <h2 className="font-bold text-lg mb-2 text-orange-900">Co się stało?</h2>
            <p className="text-orange-800 mb-4">
              Anulowałeś proces płatności w systemie Stripe. Transakcja nie została przetworzona.
            </p>
            <p className="text-orange-700 text-sm">
              Nie pobraliśmy żadnych środków. Możesz spróbować ponownie.
            </p>
          </div>

          {/* Wskazówki */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Co możesz zrobić:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">•</span>
                <span>Sprawdź czy masz wystarczająco środków</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">•</span>
                <span>Spróbuj inną metodę płatności</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-3">•</span>
                <span>Skontaktuj się z obsługą jeśli problem się powtarza</span>
              </li>
            </ul>
          </div>

          {/* Przyciski akcji */}
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Spróbuj ponownie
            </button>
            <button
              onClick={() => navigate('/provider/dashboard')}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Wróć do panelu
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Strona główna
            </button>
          </div>
        </div>

        {/* Wsparcie */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Masz problemy? <a href="mailto:support@localservices.pl" className="text-blue-600 hover:underline">Skontaktuj się z nami</a>
          </p>
        </div>
      </div>
    </div>
  )
}
