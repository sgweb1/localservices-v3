import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Check, Crown } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { data, isLoading, error } = useSubscription();
  const sub = data?.data;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Subskrypcja</h1>

      {isLoading && (
        <div className="glass-card rounded-2xl p-6 text-center text-gray-500">Ładowanie...</div>
      )}
      {error && !isLoading && (
        <div className="glass-card rounded-2xl p-6 text-center text-error">Błąd ładowania danych</div>
      )}
      {sub && !isLoading && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {(sub.plan === 'pro' || sub.plan === 'premium') && (
                  <Crown className="w-6 h-6 text-amber-500" />
                )}
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{sub.plan}</h2>
              </div>
              {sub.expiresAt && (
                <p className="text-sm text-gray-500 mt-1">Wygasa: {sub.expiresAt}</p>
              )}
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all">
              Zmień plan
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Funkcje</h3>
            <ul className="space-y-2">
              {sub.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Max usług</div>
              <div className="text-lg font-bold text-gray-900">{sub.limits.maxServices}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Max zdjęć</div>
              <div className="text-lg font-bold text-gray-900">{sub.limits.maxPhotos}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Wsparcie priorytetowe</div>
              <div className="text-lg font-bold text-gray-900">{sub.limits.prioritySupport ? 'Tak' : 'Nie'}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">Analityka</div>
              <div className="text-lg font-bold text-gray-900">{sub.limits.analytics ? 'Tak' : 'Nie'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
