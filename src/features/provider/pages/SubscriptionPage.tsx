import React from 'react';
import { useSubscription } from '../dashboard/hooks/useSubscription';
import { Check, Crown, Zap, TrendingUp } from 'lucide-react';

/**
 * Subscription Page - zgodny z localservices
 * 
 * Aktualny plan + limity + porównanie planów + upgrade CTA.
 */
export const SubscriptionPage: React.FC = () => {
  const { data, isLoading, error } = useSubscription();
  const sub = data?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subskrypcja</h1>
        <p className="text-sm text-gray-500 mt-1">Zarządzaj planem i funkcjami</p>
      </div>

      {isLoading && (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-500">Ładowanie...</div>
      )}
      {error && !isLoading && (
        <div className="glass-card rounded-2xl p-12 text-center text-error">Błąd ładowania danych subskrypcji</div>
      )}
      {sub && !isLoading && (
        <>
          {/* Aktualny plan */}
          <div className="glass-card rounded-2xl p-8 border-2 border-cyan-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {(sub.plan === 'pro' || sub.plan === 'premium') && (
                    <Crown className="w-8 h-8 text-amber-500" />
                  )}
                  <h2 className="text-3xl font-bold text-gradient capitalize">{sub.plan}</h2>
                </div>
                {sub.expiresAt && (
                  <p className="text-sm text-gray-500">Wygasa: {sub.expiresAt}</p>
                )}
              </div>
              <a
                href="/provider/subscription/plans"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Zmień plan
              </a>
            </div>

            {/* Funkcje */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Funkcje w Twoim planie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sub.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Limity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Limity i wykorzystanie</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Max usług</div>
                  <div className="text-2xl font-bold text-gray-900">{sub.limits.maxServices}</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Max zdjęć</div>
                  <div className="text-2xl font-bold text-gray-900">{sub.limits.maxPhotos}</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Wsparcie priorytetowe</div>
                  <div className="text-2xl font-bold text-gray-900">{sub.limits.prioritySupport ? '✔️' : '❌'}</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Analityka</div>
                  <div className="text-2xl font-bold text-gray-900">{sub.limits.analytics ? '✔️' : '❌'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          {sub.plan === 'free' && (
            <div className="glass-card rounded-2xl p-8 bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Odblokuj pełny potencjał LocalServices
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Przejdź na plan Pro i zyskaj więcej klientów dzięki zaawansowanym funkcjom.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                      <span>Nieograniczona liczba usług i zdjęć</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                      <span>Wyższa pozycja w wynikach wyszukiwania</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                      <span>Analityka i raporty w czasie rzeczywistym</span>
                    </li>
                  </ul>
                  <a
                    href="/provider/subscription/plans"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-bold hover:shadow-lg transition"
                  >
                    <Crown className="w-5 h-5" />
                    Sprawdź plany
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionPage;
