import React, { useState } from 'react';
import { Settings, Database, Wifi, WifiOff, RefreshCw, Zap, Activity } from 'lucide-react';
import { getMockMode, setMockMode } from '@/utils/mockMode';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';

/**
 * DEV Tools Panel - przełącznik mock/api i symulacja eventów testowych
 * 
 * Tylko w DEV mode
 */
export const DevToolsPanel: React.FC = () => {
  console.log('[DevToolsPanel] component mounted');
  
  const [isOpen, setIsOpen] = useState(false);
  const [mockMode, setMockModeState] = useState(getMockMode());
  const [activeTab, setActiveTab] = useState<'settings' | 'events'>('settings');
  const queryClient = useQueryClient();

  const isDEV = import.meta.env.DEV;
  console.log('[DevToolsPanel] DEV mode:', isDEV, 'NODE_ENV:', process.env.NODE_ENV);

  // Mutacja do symulacji eventów
  const simulateEventsMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/v1/dev/simulate-events');
      return response.data;
    },
    onSuccess: (data) => {
      // Odśwież dane dashboardu
      queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard', 'widgets'] });
      queryClient.invalidateQueries({ queryKey: ['provider', 'bookings'] });
      
      // Pokaż toast
      toast.success(`Utworzono ${data.summary.booking_requests} booking requests i ${data.summary.reviews} reviews`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Wystąpił błąd podczas symulacji eventów');
    },
  });

  if (!import.meta.env.DEV) {
    console.log('[DevToolsPanel] DEV mode:', isDEV, 'NODE_ENV:', process.env.NODE_ENV);
    return null;
  }

  const handleToggleMock = () => {
    const newMode = !mockMode;
    setMockMode(newMode);
    // setMockMode wywołuje reload, więc stan lokalny nie jest ważny
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
        title="DEV Tools"
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">DEV Tools</h3>
              </div>
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-bold">
                DEVELOPMENT
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Ustawienia
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'events'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Symuluj eventy
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'settings' && (
              <div className="space-y-3">
                {/* Mock Mode Toggle */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-700" />
                      <span className="text-sm font-semibold text-gray-900">Tryb danych</span>
                    </div>
                    <button
                      onClick={handleToggleMock}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        mockMode ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          mockMode ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {mockMode ? (
                      <>
                        <WifiOff className="w-3 h-3 text-orange-600" />
                        <span>MOCK - dane testowe</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3 text-green-600" />
                        <span>API - dane rzeczywiste</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Refresh Data */}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full p-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                >
                  <RefreshCw className="w-4 h-4" />
                  Odśwież dane
                </button>

                {/* Info */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Tryb MOCK:</strong> Dane testowe, brak połączenia API
                  </p>
                  <p className="text-xs text-blue-800 mt-1">
                    <strong>Tryb API:</strong> Rzeczywiste dane z backendu
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-3">
                {/* Info o symulacji */}
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="text-sm font-bold text-purple-900 mb-2">Symulacja eventów testowych</h4>
                  <p className="text-xs text-purple-800 mb-2">
                    Kliknij przycisk aby dodać do bazy danych:
                  </p>
                  <ul className="text-xs text-purple-800 space-y-1 ml-4">
                    <li>• 3 nowe booking requests (status: pending)</li>
                    <li>• 2 nowe reviews (ocena: 4-5 gwiazdek)</li>
                    <li>• Automatyczne odświeżenie dashboardu</li>
                  </ul>
                </div>

                {/* Przycisk symulacji */}
                <button
                  onClick={() => simulateEventsMutation.mutate()}
                  disabled={simulateEventsMutation.isPending}
                  className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {simulateEventsMutation.isPending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Tworzenie eventów...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      Symuluj eventy teraz
                    </>
                  )}
                </button>

                {/* Success message */}
                {simulateEventsMutation.isSuccess && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200 animate-slide-in">
                    <p className="text-xs text-green-800 font-semibold">
                      ✅ Eventy utworzone! Dashboard odświeżony.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
