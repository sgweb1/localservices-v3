import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, AlertCircle, Power, PowerOff, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  useCalendar, 
  useCreateSlot, 
  useUpdateSlot, 
  useDeleteSlot,
  type CreateSlotData,
  type TimeSlot,
  type CalendarBooking
} from './hooks/useCalendar';

/**
 * Kalendarz Dostępności - Widok zarządzania slotami providera
 * 
 * Integracja z API:
 * - Pobiera sloty i rezerwacje z backendu
 * - CRUD operacje na slotach
 * - Real-time aktualizacje
 */

const DAYS_OF_WEEK = [
  { value: 1, label: 'Poniedziałek', short: 'Pon' },
  { value: 2, label: 'Wtorek', short: 'Wt' },
  { value: 3, label: 'Środa', short: 'Śr' },
  { value: 4, label: 'Czwartek', short: 'Czw' },
  { value: 5, label: 'Piątek', short: 'Pt' },
  { value: 6, label: 'Sobota', short: 'Sob' },
  { value: 7, label: 'Niedziela', short: 'Nie' },
];

export const CalendarPage: React.FC = () => {
  const { data, isLoading, error } = useCalendar();
  const createSlotMutation = useCreateSlot();
  const updateSlotMutation = useUpdateSlot();
  const deleteSlotMutation = useDeleteSlot();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [newSlot, setNewSlot] = useState<CreateSlotData>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    max_bookings: 10,
  });

  // Grupuj sloty po dniu tygodnia
  const slotsByDay = React.useMemo(() => {
    if (!data?.slots) return {};
    
    const grouped: Record<number, TimeSlot[]> = {};
    DAYS_OF_WEEK.forEach(day => {
      grouped[day.value] = data.slots
        .filter(slot => slot.day_of_week === day.value)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  }, [data?.slots]);

  // Grupuj rezerwacje po dniu tygodnia
  const bookingsByDay = React.useMemo(() => {
    if (!data?.bookings) return {};
    
    const grouped: Record<number, CalendarBooking[]> = {};
    DAYS_OF_WEEK.forEach(day => {
      grouped[day.value] = data.bookings
        .filter(booking => booking.day_of_week === day.value)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  }, [data?.bookings]);

  const handleCreateSlot = async () => {
    try {
      if (isRecurring && selectedDays.length > 0) {
        // Twórz sloty dla wielu dni
        for (const day of selectedDays) {
          await createSlotMutation.mutateAsync({
            ...newSlot,
            day_of_week: day,
          });
        }
        toast.success(`Dodano ${selectedDays.length} slotów`);
      } else {
        await createSlotMutation.mutateAsync(newSlot);
        toast.success('Slot został dodany');
      }
      
      setShowAddModal(false);
      setIsRecurring(false);
      setSelectedDays([1]);
      setNewSlot({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        max_bookings: 10,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd');
    }
  };

  const handleUpdateSlot = async (id: number, is_available: boolean) => {
    try {
      await updateSlotMutation.mutateAsync({ id, data: { is_available } });
      toast.success(is_available ? 'Slot włączony' : 'Slot wyłączony');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Wystąpił błąd');
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten slot?')) return;
    
    try {
      await deleteSlotMutation.mutateAsync(id);
      toast.success('Slot został usunięty');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Nie można usunąć slotu z aktywnymi rezerwacjami');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Ładowanie kalendarza...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 rounded-2xl">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Błąd ładowania</h3>
            <p className="text-sm text-slate-600">Nie udało się pobrać kalendarza</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalendarz Dostępności</h1>
          <p className="text-sm text-slate-500 mt-1">
            Zarządzaj swoimi godzinami pracy • {data?.slots.length || 0} slotów • {data?.bookings.length || 0} rezerwacji
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Dodaj dostępność
        </button>
      </div>

      {/* Kalendarz tygodniowy */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-slate-200">
          {DAYS_OF_WEEK.map(day => (
            <div key={day.value} className="bg-white">
              {/* Nagłówek dnia */}
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-slate-200">
                <div className="font-semibold text-slate-900">{day.short}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {slotsByDay[day.value]?.length || 0} slotów
                </div>
              </div>

              {/* Sloty dostępności */}
              <div className="p-3 space-y-2 min-h-[300px]">
                {slotsByDay[day.value]?.map(slot => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      slot.is_available
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-900">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateSlot(slot.id, !slot.is_available)}
                          className={`p-1.5 rounded hover:bg-white transition ${
                            slot.is_available ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                          title={slot.is_available ? 'Wyłącz slot' : 'Włącz slot'}
                        >
                          {slot.is_available ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 hover:bg-white rounded text-red-500"
                          title="Usuń"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      Rezerwacje: {slot.current_bookings}/{slot.max_bookings}
                    </div>

                    {slot.break_time_start && (
                      <div className="text-xs text-slate-500 mt-1">
                        Przerwa: {slot.break_time_start} - {slot.break_time_end}
                      </div>
                    )}
                  </div>
                ))}

                {/* Rezerwacje w tym dniu */}
                {bookingsByDay[day.value]?.map(booking => (
                  <div
                    key={booking.id}
                    className={`p-3 rounded-lg border-2 ${
                      booking.status === 'confirmed'
                        ? 'bg-cyan-50 border-cyan-300'
                        : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-900">
                        {booking.start_time} - {booking.end_time}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {booking.customer_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {booking.service_name}
                    </div>
                    <div className={`text-xs mt-1 font-medium ${
                      booking.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {booking.status === 'confirmed' ? 'Potwierdzona' : 'Oczekuje'}
                    </div>
                  </div>
                ))}

                {!slotsByDay[day.value]?.length && !bookingsByDay[day.value]?.length && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Brak slotów
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal dodawania slotu */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Dodaj dostępność</h3>
                  <p className="text-sm text-slate-500">Określ kiedy jesteś dostępny dla klientów</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Tryb cykliczny */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                <Checkbox
                  checked={isRecurring}
                  onChange={(e) => {
                    setIsRecurring(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedDays([newSlot.day_of_week]);
                    }
                  }}
                  label="🔄 Dodaj cyklicznie"
                  description="Dodaj ten sam slot dla wielu dni w tygodniu"
                />
              </div>

              {/* Wybór dni */}
              {isRecurring ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    📅 Wybierz dni tygodnia
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          setSelectedDays(prev =>
                            prev.includes(day.value)
                              ? prev.filter(d => d !== day.value)
                              : [...prev, day.value]
                          );
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          selectedDays.includes(day.value)
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-400'
                        }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Wybrano: {selectedDays.length === 0 ? 'brak' : selectedDays.length === 7 ? 'wszystkie dni' : `${selectedDays.length} ${selectedDays.length === 1 ? 'dzień' : 'dni'}`}
                  </p>
                </div>
              ) : (
                <Select
                  label="📅 Dzień tygodnia"
                  value={newSlot.day_of_week.toString()}
                  onChange={(e) => {
                    const day = parseInt(e.target.value);
                    setNewSlot({ ...newSlot, day_of_week: day });
                    setSelectedDays([day]);
                  }}
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </Select>
              )}

              {/* Przedział czasowy */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  label="🕐 Godzina rozpoczęcia"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  icon={<Clock className="w-4 h-4" />}
                />
                <Input
                  type="time"
                  label="🕒 Godzina zakończenia"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>

              {/* Max rezerwacji i przerwa */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="📌 Maksymalna liczba rezerwacji"
                  min={1}
                  max={100}
                  value={newSlot.max_bookings}
                  onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) || 1 })}
                  helperText="Ile osób może zarezerwować w tym czasie"
                />
                <Input
                  type="number"
                  label="⏱️ Przerwa (minuty)"
                  min={0}
                  max={120}
                  placeholder="0"
                  onChange={(e) => {
                    const breakMinutes = parseInt(e.target.value) || 0;
                    setNewSlot({ ...newSlot, break_time_start: undefined, break_time_end: undefined });
                  }}
                  helperText="Opcjonalna przerwa w trakcie"
                />
              </div>

              {/* Podsumowanie */}
              {isRecurring && selectedDays.length > 0 && (
                <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                  <p className="text-sm font-medium text-cyan-900 mb-2">📋 Podsumowanie:</p>
                  <ul className="text-sm text-cyan-700 space-y-1">
                    <li>• Zostanie dodanych <strong>{selectedDays.length}</strong> slotów</li>
                    <li>• Godziny: <strong>{newSlot.start_time} - {newSlot.end_time}</strong></li>
                    <li>• Dni: <strong>{DAYS_OF_WEEK.filter(d => selectedDays.includes(d.value)).map(d => d.short).join(', ')}</strong></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Przyciski */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setIsRecurring(false);
                  setSelectedDays([1]);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleCreateSlot}
                disabled={createSlotMutation.isPending || (isRecurring && selectedDays.length === 0)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createSlotMutation.isPending 
                  ? 'Dodawanie...' 
                  : isRecurring 
                    ? `Dodaj ${selectedDays.length} ${selectedDays.length === 1 ? 'slot' : 'sloty'}`
                    : 'Dodaj slot'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
