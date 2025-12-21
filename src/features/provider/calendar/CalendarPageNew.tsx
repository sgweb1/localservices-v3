import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, AlertCircle, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DayCard, SlotCard, StatCard } from '@/components/ui/card';
import { PageTitle, Text, Label, Badge, EmptyText, Caption, CardTitle } from '@/components/ui/typography';
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
      await createSlotMutation.mutateAsync(newSlot);
      toast.success('Slot został dodany');
      setShowAddModal(false);
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
          <Text muted className="mt-4">Ładowanie kalendarza...</Text>
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
            <CardTitle>Błąd ładowania</CardTitle>
            <Text size="sm" muted>Nie udało się pobrać kalendarza</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[990px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageTitle gradient>Kalendarz Dostępności</PageTitle>
          <Text muted size="sm" className="mt-2">
            Zarządzaj swoimi godzinami pracy • <Badge variant="info">{data?.slots.length || 0} slotów</Badge> • <Badge variant="gradient">{data?.bookings.length || 0} rezerwacji</Badge>
          </Text>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
          <Plus className="w-5 h-5" />
          Dodaj slot
        </Button>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          variant="gradient"
          value={data?.slots.length || 0}
          label="Aktywne sloty"
          icon={<Clock className="w-6 h-6 text-cyan-600" />}
        />
        <StatCard
          variant="success"
          value={data?.bookings.filter(b => b.status === 'confirmed').length || 0}
          label="Potwierdzone rezerwacje"
          icon={<Calendar className="w-6 h-6 text-emerald-600" />}
        />
        <StatCard
          variant="warning"
          value={data?.bookings.filter(b => b.status === 'pending').length || 0}
          label="Oczekujące rezerwacje"
          icon={<AlertCircle className="w-6 h-6 text-amber-600" />}
        />
      </div>

      {/* Kalendarz tygodniowy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {DAYS_OF_WEEK.map(day => (
          <DayCard
            key={day.value}
            day={day.short}
            count={slotsByDay[day.value]?.length || 0}
          >
            {slotsByDay[day.value]?.map(slot => (
              <SlotCard
                key={slot.id}
                active={slot.is_available}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <Caption className="text-slate-700 text-[10px]">
                      {slot.start_time} - {slot.end_time}
                    </Caption>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleUpdateSlot(slot.id, !slot.is_available)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                      title={slot.is_available ? 'Wyłącz slot' : 'Włącz slot'}
                    >
                      {slot.is_available ? (
                        <Power className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <PowerOff className="w-3 h-3 text-red-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                      title="Usuń slot"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>

                <Caption className="text-[10px] text-slate-500">
                  {slot.current_bookings}/{slot.max_bookings}
                </Caption>

                {slot.break_time_start && (
                  <Caption className="mt-1">
                    Przerwa: {slot.break_time_start} - {slot.break_time_end}
                  </Caption>
                )}
              </SlotCard>
            ))}

            {/* Rezerwacje w tym dniu */}
            {bookingsByDay[day.value]?.map(booking => (
              <div
                key={booking.id}
                className={`p-2 rounded-lg border ${
                  booking.status === 'confirmed'
                    ? 'bg-cyan-50/20 border-cyan-100'
                    : 'bg-amber-50/20 border-amber-100'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <Caption className="text-slate-700 text-[10px]">
                    {booking.start_time} - {booking.end_time}
                  </Caption>
                </div>
                <Caption className="text-slate-600 text-[10px]">
                  {booking.customer_name}
                </Caption>
                <Caption muted className="text-[9px]">
                  {booking.service_name}
                </Caption>
                <div className="mt-1">
                  <Badge variant={booking.status === 'confirmed' ? 'success' : 'warning'} className="text-[9px] px-1.5 py-0">
                    {booking.status === 'confirmed' ? 'Potwierdzona' : 'Oczekuje'}
                  </Badge>
                </div>
              </div>
            ))}

            {!slotsByDay[day.value]?.length && !bookingsByDay[day.value]?.length && (
              <EmptyText className="py-12">
                Brak slotów
              </EmptyText>
            )}
          </DayCard>
        ))}
      </div>

      {/* Modal dodawania slotu */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="backdrop-blur-xl bg-white/95 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <PageTitle className="mb-2" gradient>Dodaj slot</PageTitle>
            <Text muted size="sm" className="mb-6">Uzupełnij informacje o dostępności</Text>

            <div className="space-y-4">
              <div>
                <Label required>Dzień tygodnia</Label>
                <select
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label required>Od</Label>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label required>Do</Label>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label required>Maksymalna liczba rezerwacji</Label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newSlot.max_bookings}
                  onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Anuluj
              </Button>
              <Button 
                onClick={handleCreateSlot} 
                className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                disabled={createSlotMutation.isPending}
              >
                {createSlotMutation.isPending ? 'Dodawanie...' : 'Dodaj'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
