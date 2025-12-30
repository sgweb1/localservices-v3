import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { apiClient } from '@/api/client';

/**
 * DEV Tools Panel - przycisk do testowania eventów
 * Widoczny tylko w DEV mode
 */
export const DevToolsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isDEV = import.meta.env.DEV;

  console.log('[DevToolsPanel] mounted, DEV:', isDEV);

  const handleSimulateEvents = async () => {
    try {
      // Pobierz token z localStorage
      const token = localStorage.getItem('dev_mock_token') || 
                    localStorage.getItem('sanctum_token') ||
                    localStorage.getItem('auth_token');
      
      console.log('[DevToolsPanel] Token available:', !!token);
      
      const response = await apiClient.post('/dev/simulate-events');
      console.log('[DevToolsPanel] Events created:', response.data);
      // Odśwież stronę
      window.location.reload();
    } catch (error: any) {
      console.error('[DevToolsPanel] Error:', error.response?.status, error.response?.data || error.message);
    }
  };

  // Nie renderuj w produkcji
  if (!isDEV) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        title="DEV Tools"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
          <div className="space-y-3">
            <h3 className="font-bold text-purple-600">DEV Tools</h3>
            
            <button
              onClick={handleSimulateEvents}
              className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
            >
              Symuluj eventy testowe
            </button>

            <p className="text-xs text-gray-600">
              Tworzy 3 booking requests i 2 reviews
            </p>
          </div>
        </div>
      )}
    </>
  );
};
