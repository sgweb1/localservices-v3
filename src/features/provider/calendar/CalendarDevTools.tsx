import React, { useState } from 'react';
import { Settings, X, Calendar, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

interface CalendarDevToolsProps {
  enabled?: boolean;
  slots?: any[]; // Lista dostępnych slotów
}

interface GenerateBookingParams {
  slotId?: number;
  count: number;
  dateRange: 'thisWeek' | 'nextWeek' | 'thisMonth';
  status: 'pending' | 'confirmed';
}

/**
 * DEV Tools dla strony Kalendarz Dostępności
 * 
 * Funkcje:
 * - Generowanie rezerwacji do wybranych slotów
 * - Wypełnianie kalendarza testowymi danymi
 * - Czyszczenie rezerwacji testowych
 */
export const CalendarDevTools: React.FC<CalendarDevToolsProps> = ({ 
  enabled = true,
  slots = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | undefined>();
  const [bookingCount, setBookingCount] = useState(5);
  const [dateRange, setDateRange] = useState<'thisWeek' | 'nextWeek' | 'thisMonth'>('thisWeek');
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'confirmed'>('confirmed');
  
  const queryClient = useQueryClient();

  // Mutacja generowania rezerwacji
  const generateBookingsMutation = useMutation({
    mutationFn: async (params: GenerateBookingParams) => {
      const response = await apiClient.post('/dev/calendar/generate-bookings', params);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success(`Wygenerowano ${data.count} rezerwacji`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Błąd podczas generowania rezerwacji');
    },
  });

  // Mutacja czyszczenia testowych rezerwacji
  const clearTestBookingsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/dev/calendar/clear-test-bookings');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success(`Usunięto ${data.deleted} testowych rezerwacji`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Błąd podczas czyszczenia');
    },
  });

  // Wyświetl tylko w development
  if (!enabled || import.meta.env.MODE !== 'development') {
    return null;
  }

  const handleGenerateBookings = () => {
    generateBookingsMutation.mutate({
      slotId: selectedSlot,
      count: bookingCount,
      dateRange,
      status: bookingStatus,
    });
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
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
        <div className="fixed bottom-6 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border-2 border-cyan-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">Calendar DEV Tools</h3>
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

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="w-4 h-4" />
                Generator Rezerwacji
              </div>

              {/* Wybór slotu */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Slot (opcjonalnie)
                </label>
                <select
                  value={selectedSlot || ''}
                  onChange={(e) => setSelectedSlot(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Wszystkie sloty (losowo)</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.day_name} {slot.start_time}-{slot.end_time}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Wybierz konkretny slot lub pozostaw puste dla losowego
                </p>
              </div>

              {/* Liczba rezerwacji */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Liczba rezerwacji
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bookingCount}
                  onChange={(e) => setBookingCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Zakres dat */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Zakres dat
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="thisWeek">Ten tydzień</option>
                  <option value="nextWeek">Następny tydzień</option>
                  <option value="thisMonth">Ten miesiąc</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status rezerwacji
                </label>
                <select
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="confirmed">Potwierdzona</option>
                  <option value="pending">Oczekująca</option>
                </select>
              </div>

              {/* Przycisk generuj */}
              <button
                onClick={handleGenerateBookings}
                disabled={generateBookingsMutation.isPending}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generateBookingsMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generowanie...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Generuj Rezerwacje
                  </>
                )}
              </button>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-4" />

            {/* Czyszczenie */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4" />
                Czyszczenie
              </div>

              <button
                onClick={() => clearTestBookingsMutation.mutate()}
                disabled={clearTestBookingsMutation.isPending}
                className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clearTestBookingsMutation.isPending ? 'Czyszczenie...' : 'Usuń Testowe Rezerwacje'}
              </button>
              <p className="text-xs text-gray-500">
                Usuwa wszystkie rezerwacje utworzone przez DEV Tools
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
