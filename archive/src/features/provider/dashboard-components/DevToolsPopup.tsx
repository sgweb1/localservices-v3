import React, { useState } from 'react';
import { Settings, X, Database, CreditCard, Bell } from 'lucide-react';

interface DevToolsPopupProps {
  enabled?: boolean;
}

/**
 * DEV Tools Popup
 * 
 * Popup widoczny tylko w środowisku lokalnym (APP_ENV=local).
 * 3 zakładki:
 * - Context: Informacje o użytkowniku, planie, feature flags
 * - Subscriptions: Generator planów/addonów (100+ kombinacji)
 * - Notifications: Generator powiadomień testowych
 * 
 * Pozycja: fixed bottom-right, floating z purple-pink gradient
 */
export const DevToolsPopup: React.FC<DevToolsPopupProps> = ({ enabled = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'context' | 'subscriptions' | 'notifications'>('context');

  // Wyświetl tylko w local env
  if (!enabled || import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
          aria-label="Otwórz DEV Tools"
        >
          <Settings className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            DEV
          </span>
        </button>
      )}

      {/* Popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border-2 border-purple-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">DEV Tools</h3>
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                Local Only
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('context')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'context'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Database className="w-4 h-4" />
              Context
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'subscriptions'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Plans
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notify
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[450px]">
            {activeTab === 'context' && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">123</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Current Plan</p>
                  <p className="text-sm font-semibold text-gray-900">Pro Plan</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Feature Flags</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">instant_booking</span>
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">messaging</span>
                    <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full">analytics_pro</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Cache Status</p>
                  <p className="text-sm font-semibold text-success">Active (60s TTL)</p>
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 mb-3">
                  Szybko przełączaj plany i dodatki do testowania limitów i gatingu.
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Plany bazowe:</p>
                  <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-900 transition-colors">
                    Basic (5 ogłoszeń, 3 kategorie)
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-900 transition-colors">
                    Pro (15 ogłoszeń, 8 kategorii)
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg text-sm font-medium text-pink-900 transition-colors">
                    Premium (Unlimited)
                  </button>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-xs font-semibold text-gray-700">Dodatki:</p>
                  <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-900">Instant Booking</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-900">Analityka PRO</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-900">Messaging</span>
                  </label>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold text-sm mt-4 hover:shadow-lg transition-shadow">
                  Zastosuj zmiany
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 mb-3">
                  Generuj testowe powiadomienia i sprawdź jak wyglądają w dashboard.
                </p>

                <button className="w-full text-left px-3 py-2 bg-success/10 hover:bg-success/20 rounded-lg text-sm font-medium text-gray-900 transition-colors">
                  ✅ Nowa rezerwacja (booking_created)
                </button>
                <button className="w-full text-left px-3 py-2 bg-warning/10 hover:bg-warning/20 rounded-lg text-sm font-medium text-gray-900 transition-colors">
                  ⭐ Nowa opinia (new_review)
                </button>
                <button className="w-full text-left px-3 py-2 bg-primary-50 hover:bg-primary-100 rounded-lg text-sm font-medium text-gray-900 transition-colors">
                  🔔 Przypomnienie weryfikacji
                </button>
                <button className="w-full text-left px-3 py-2 bg-error/10 hover:bg-error/20 rounded-lg text-sm font-medium text-gray-900 transition-colors">
                  ⚠️ Limit przekroczony
                </button>

                <div className="pt-3 border-t border-gray-200 mt-4">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-shadow">
                    Wyślij test (wszystkie)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
