/**
 * Komponent do kupowania boost'ów
 */

import React, { useState, useMemo } from 'react'
import { BOOST_PRICES, BOOST_DURATIONS, BOOST_TYPE_LABELS } from '../types/boost'
import { useBoost } from '../hooks/useBoost'
import type { BoostType, BoostDuration } from '../types/boost'

export const BoostPurchase: React.FC = () => {
  const { purchaseBoost, error: hookError, isLoading } = useBoost()

  const [type, setType] = useState<BoostType>('city_boost')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [days, setDays] = useState<BoostDuration>(7)
  const [localError, setLocalError] = useState('')

  const isValid = useMemo(() => {
    return type === 'city_boost' ? city.trim().length > 0 : category.trim().length > 0
  }, [type, city, category])

  const price = useMemo(() => {
    return BOOST_PRICES[type][days]
  }, [type, days])

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!isValid) {
      setLocalError('Uzupełnij wszystkie wymagane pola')
      return
    }

    purchaseBoost({
      type,
      days,
      city: type === 'city_boost' ? city : undefined,
      category: type === 'spotlight' ? category : undefined
    })
  }

  return (
    <form onSubmit={handlePurchase} className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-teal-600 mb-2">Kup Boost</h2>
      <p className="text-gray-600 mb-6">Zwiększ widoczność na 7, 14 lub 30 dni</p>

      {/* Selektor typu */}
      <div className="mb-6 flex gap-3">
        {(['city_boost', 'spotlight'] as BoostType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 px-4 py-2 rounded font-medium transition ${
              type === t ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {BOOST_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Input - Miasto/Kategoria */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-2">
          {type === 'city_boost' ? 'Miasto' : 'Kategoria'}
        </label>
        {type === 'city_boost' ? (
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="np. Warszawa"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        ) : (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Wybierz kategorię</option>
            <option value="elektryk">Elektryk</option>
            <option value="hydraulik">Hydraulik</option>
            <option value="malarz">Malarz</option>
            <option value="sluzarz">Ślusarz</option>
            <option value="cieśla">Cieśla</option>
          </select>
        )}
      </div>

      {/* Selektor dni */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-3">Długość boost'a</label>
        <div className="grid grid-cols-3 gap-2">
          {BOOST_DURATIONS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`p-3 rounded border-2 text-center transition ${
                days === d
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-300 hover:border-teal-300'
              }`}
            >
              <div className="font-bold text-lg">{d}d</div>
              <div className="text-sm text-gray-600">{BOOST_PRICES[type][d]} PLN</div>
            </button>
          ))}
        </div>
      </div>

      {/* Podsumowanie */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Typ:</span>
          <span className="font-semibold">{BOOST_TYPE_LABELS[type]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Lokalizacja:</span>
          <span className="font-semibold">{city || category || '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Dni:</span>
          <span className="font-semibold">{days}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-lg font-bold text-teal-600">
          <span>Razem:</span>
          <span>{price.toFixed(2)} PLN</span>
        </div>
      </div>

      {/* Wyświetlanie błędów */}
      {(localError || hookError) && (
        <div className="mb-6 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          {localError || hookError}
        </div>
      )}

      {/* Przycisk */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Przetwarzanie...' : 'Przejdź do płatności'}
      </button>
    </form>
  )
}
