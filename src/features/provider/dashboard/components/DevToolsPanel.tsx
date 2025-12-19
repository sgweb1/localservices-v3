import React, { useState } from 'react';
import { Settings, Database, Wifi, WifiOff, RefreshCw, Zap } from 'lucide-react';
import { getMockMode, setMockMode } from '@/utils/mockMode';

/**
 * DEV Tools Panel - przełącznik mock/api i inne narzędzia deweloperskie
 * 
 * Tylko w DEV mode
 */
export const DevToolsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mockMode, setMockModeState] = useState(getMockMode());

  if (!import.meta.env.DEV) {
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
        <div className="fixed bottom-24 right-6 z-50 w-80 glass-card rounded-2xl p-4 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-gray-900">DEV Tools</h3>
            </div>
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-bold">
              DEVELOPMENT
            </span>
          </div>

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
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
