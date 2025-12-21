import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Plus, Trash2, AlertCircle, Power, PowerOff, Sparkles, Copy, Filter, LayoutGrid, List, TrendingUp, CheckSquare, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TimePicker } from '@/components/ui/time-picker';
import { DayMultiSelect } from '@/components/ui/day-multi-select';
import { BulkActionsBar } from '@/components/ui/bulk-actions-bar';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const { data, isLoading, error, refetch } = useCalendar();
  const createSlotMutation = useCreateSlot();
  const updateSlotMutation = useUpdateSlot();
  const deleteSlotMutation = useDeleteSlot();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'full'>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [newSlot, setNewSlot] = useState<CreateSlotData>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    max_bookings: 1,
  });

  // Grupuj sloty po dniu tygodnia i filtruj
  const slotsByDay = useMemo(() => {
    if (!data?.slots) return {};
    
    const grouped: Record<number, TimeSlot[]> = {};
    DAYS_OF_WEEK.forEach(day => {
      let daySlots = data.slots.filter(slot => slot.day_of_week === day.value);
      
      // Filtrowanie
      if (filterMode === 'active') {
        daySlots = daySlots.filter(slot => slot.is_available);
      } else if (filterMode === 'full') {
        daySlots = daySlots.filter(slot => slot.current_bookings >= slot.max_bookings);
      }
      
      grouped[day.value] = daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  }, [data?.slots, filterMode]);

  // Statystyki
  const stats = useMemo(() => {
    if (!data?.slots) return { total: 0, active: 0, full: 0, bookings: 0, capacity: 0 };
    
    const total = data.slots.length;
    const active = data.slots.filter(s => s.is_available).length;
    const full = data.slots.filter(s => s.current_bookings >= s.max_bookings).length;
    const bookings = data.slots.reduce((sum, s) => sum + s.current_bookings, 0);
    const capacity = data.slots.reduce((sum, s) => sum + s.max_bookings, 0);
    
    return { total, active, full, bookings, capacity };
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
    setSlotToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;
    
    try {
      await deleteSlotMutation.mutateAsync(slotToDelete);
      toast.success('Slot został usunięty');
      selectedSlots.delete(slotToDelete);
      setSelectedSlots(new Set(selectedSlots));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Nie można usunąć slotu z aktywnymi rezerwacjami');
    } finally {
      setShowDeleteModal(false);
      setSlotToDelete(null);
    }
  };

  // Bulk actions
  const toggleSlotSelection = (id: number) => {
    const newSet = new Set(selectedSlots);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSlots(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć ${selectedSlots.size} slotów?`)) return;
    
    try {
      for (const id of Array.from(selectedSlots)) {
        await deleteSlotMutation.mutateAsync(id);
      }
      toast.success(`Usunięto ${selectedSlots.size} slotów`);
      setSelectedSlots(new Set());
      setSelectionMode(false);
    } catch (error: any) {
      toast.error('Błąd podczas usuwania slotów');
    }
  };

  const handleBulkToggle = async (enabled: boolean) => {
    try {
      for (const id of Array.from(selectedSlots)) {
        await updateSlotMutation.mutateAsync({ id, data: { is_available: enabled } });
      }
      toast.success(`${enabled ? 'Włączono' : 'Wyłączono'} ${selectedSlots.size} slotów`);
      setSelectedSlots(new Set());
      setSelectionMode(false);
    } catch (error: any) {
      toast.error('Błąd podczas aktualizacji slotów');
    }
  };

  const handleCopyTemplate = () => {
    toast.info('Funkcja kopiowania szablonu wkrótce dostępna');
  };

  const handleExport = () => {
    toast.info('Funkcja eksportu do kalendarza wkrótce dostępna');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <SkeletonLoader />
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
    <div className="space-y-4 md:space-y-6 pb-24 md:pb-6 max-w-[990px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Kalendarz Dostępności</h1>
          <p className="text-xs text-slate-500 mt-1">
            {stats.total} {stats.total === 1 ? 'slot' : 'slotów'} • {data?.bookings.length || 0} {data?.bookings.length === 1 ? 'rezerwacja' : 'rezerwacji'}
          </p>
        </div>
        
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setSelectionMode(!selectionMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal rounded-lg transition-all ${
              selectionMode
                ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {selectionMode ? 'Anuluj zaznaczanie' : 'Zaznacz'}
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg hover:shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dodaj dostępność</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
        <div className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-500 uppercase">Aktywne</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{stats.active}</div>
          <div className="text-xs text-slate-500 mt-1">z {stats.total} slotów</div>
        </div>

        <div className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300" style={{animationDelay: '50ms'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-500 uppercase">Rezerwacje</span>
            <Calendar className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{stats.bookings}</div>
          <div className="text-xs text-slate-500 mt-1">z {stats.capacity} miejsc</div>
        </div>

        <div className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300" style={{animationDelay: '100ms'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-500 uppercase">Zapełnienie</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">
            {stats.capacity > 0 ? Math.round((stats.bookings / stats.capacity) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">średnia</div>
        </div>

        <div className="glass-card p-4 rounded-xl animate-in slide-in-from-left-2 duration-300" style={{animationDelay: '150ms'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">Pełne</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.full}</div>
          <div className="text-xs text-slate-500 mt-1">slotów</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 md:px-0">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-3 py-2 text-sm border-2 border-slate-200 rounded-lg bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
          >
            <option value="all">Wszystkie sloty</option>
            <option value="active">Tylko aktywne</option>
            <option value="full">Tylko pełne</option>
          </select>
        </div>

        <button
          onClick={handleCopyTemplate}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-lg hover:border-cyan-400 transition-all"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Szablon</span>
        </button>
      </div>

      {/* Kalendarz tygodniowy */}
      {stats.total === 0 ? (
        <EmptyState
          title="Brak slotów dostępności"
          description="Zacznij od dodania pierwszego slotu, aby klienci mogli rezerwować Twoje usługi"
          actionLabel="Dodaj pierwszy slot"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden px-4 md:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-slate-200">
            {DAYS_OF_WEEK.map(day => (
            <div key={day.value} className="bg-white">
              {/* Nagłówek dnia */}
              <div className="p-2 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-slate-200">
                <div className="text-sm font-medium text-slate-900">{day.short}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {slotsByDay[day.value]?.length || 0} slotów
                </div>
              </div>

                {/* Sloty dostępności */}
              <div className="p-2 space-y-2 min-h-[200px]">
                {slotsByDay[day.value]?.map((slot, index) => (
                  <div
                    key={slot.id}
                    onClick={() => selectionMode && toggleSlotSelection(slot.id)}
                    className={`
                      group relative p-2 rounded-lg border transition-all duration-300 cursor-pointer
                      animate-in slide-in-from-left-2
                      ${selectionMode && selectedSlots.has(slot.id)
                        ? 'ring-2 ring-cyan-400 ring-offset-1'
                        : ''
                      }
                      ${slot.is_available
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:shadow-md hover:scale-105 active:scale-100'
                        : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 hover:shadow-sm hover:scale-105 active:scale-100'
                      }
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Progress ring */}
                    <div className="absolute -top-1 -right-1 w-6 h-6">
                      <svg className="w-6 h-6 transform -rotate-90">
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-slate-200"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          className={slot.current_bookings >= slot.max_bookings ? 'text-red-500' : 'text-emerald-500'}
                          strokeDasharray={`${(slot.current_bookings / slot.max_bookings) * 56.5} 56.5`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-slate-700">
                        {slot.current_bookings}
                      </span>
                    </div>

                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${slot.is_available ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold text-slate-900">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateSlot(slot.id, !slot.is_available);
                          }}
                          className={`
                            p-1.5 rounded-lg hover:bg-white/80 transition-all active:scale-90
                            ${slot.is_available ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-600 hover:text-red-700'}
                          `}
                          title={slot.is_available ? 'Wyłącz slot' : 'Włącz slot'}
                        >
                          {slot.is_available ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlot(slot.id);
                          }}
                          className="p-1 rounded-md hover:bg-red-50 text-red-500 hover:text-red-600 transition-all active:scale-90"
                          title="Usuń"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-1 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          slot.current_bookings >= slot.max_bookings
                            ? 'bg-gradient-to-r from-red-400 to-red-600'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`}
                        style={{ width: `${(slot.current_bookings / slot.max_bookings) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-normal">
                        Rezerwacje: {slot.current_bookings}/{slot.max_bookings}
                      </span>
                      {slot.current_bookings >= slot.max_bookings && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">
                          Pełne
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Rezerwacje w tym dniu */}
                {bookingsByDay[day.value]?.map((booking, index) => (
                  <div
                    key={booking.id}
                    className={`
                      p-2 rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer
                      animate-in slide-in-from-right-2
                      ${booking.status === 'confirmed'
                        ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                      }
                    `}
                    style={{ animationDelay: `${(slotsByDay[day.value]?.length || 0) * 50 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className={`w-4 h-4 ${booking.status === 'confirmed' ? 'text-cyan-600' : 'text-amber-600'}`} />
                      <span className="text-xs font-bold text-slate-900">
                        {booking.start_time} - {booking.end_time}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mb-1">
                      {booking.customer_name}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {booking.service_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-flex items-center px-2 py-1 text-xs font-bold rounded-lg
                        ${booking.status === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                        }
                      `}>
                        {booking.status === 'confirmed' ? '✓ Potwierdzona' : '⏳ Oczekuje'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {booking.duration_minutes} min
                      </span>
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
      )}

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bulk Actions Bar */}
      {selectionMode && (
        <BulkActionsBar
          selectedCount={selectedSlots.size}
          onCopy={handleCopyTemplate}
          onDelete={handleBulkDelete}
          onToggle={handleBulkToggle}
          onExport={handleExport}
          onClear={() => {
            setSelectedSlots(new Set());
            setSelectionMode(false);
          }}
        />
      )}

      {/* Modal dodawania slotu */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="glass-card rounded-lg p-4 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-slate-900">Dodaj dostępność</h3>
                  <p className="text-xs text-slate-500">Określ kiedy jesteś dostępny</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Tryb cykliczny */}
              <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-lg p-3 border border-teal-200">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => {
                      setIsRecurring(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedDays([newSlot.day_of_week]);
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                      <Repeat className="w-3.5 h-3.5" />
                      Dodaj cyklicznie
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">Dodaj ten sam slot dla wielu dni</p>
                  </div>
                </label>
              </div>

              {/* Wybór dni */}
              {isRecurring ? (
                <DayMultiSelect
                  selected={selectedDays}
                  onChange={setSelectedDays}
                  label="📅 Wybierz dni tygodnia"
                />
              ) : (
                <div>
                  <label className="block text-xs font-normal text-slate-700 mb-2">
                    📅 Dzień tygodnia
                  </label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          setNewSlot({ ...newSlot, day_of_week: day.value });
                          setSelectedDays([day.value]);
                        }}
                        className={`
                          px-1.5 py-2 text-xs font-medium rounded-lg transition-all
                          ${newSlot.day_of_week === day.value
                            ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-cyan-400'
                          }
                        `}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Przedział czasowy */}
              <div className="grid grid-cols-2 gap-3">
                <TimePicker
                  label="🕐 Rozpoczęcie"
                  value={newSlot.start_time}
                  onChange={(value) => setNewSlot({ ...newSlot, start_time: value })}
                />
                <TimePicker
                  label="🕒 Zakończenie"
                  value={newSlot.end_time}
                  onChange={(value) => setNewSlot({ ...newSlot, end_time: value })}
                />
              </div>

              {/* Max rezerwacji */}
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1.5">
                  📌 Max rezerwacji na slot
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newSlot.max_bookings || 1}
                  onChange={(e) => setNewSlot({ ...newSlot, max_bookings: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* Podsumowanie */}
              {isRecurring && selectedDays.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 rounded-lg p-3 border border-cyan-200 animate-in slide-in-from-top-2">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-200 to-teal-200 rounded-full blur-3xl opacity-20" />
                  <div className="relative">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      <p className="text-xs font-medium text-cyan-900">Podsumowanie:</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-700">Liczba slotów:</span>
                        <span className="font-semibold text-cyan-900">{selectedDays.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-700">Godziny:</span>
                        <span className="font-semibold text-cyan-900">{newSlot.start_time} - {newSlot.end_time}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-700">Max rezerwacji:</span>
                        <span className="font-semibold text-cyan-900">{newSlot.max_bookings} / slot</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-cyan-700">Dni: </span>
                        <span className="font-semibold text-cyan-900">
                          {DAYS_OF_WEEK.filter(d => selectedDays.includes(d.value)).map(d => d.short).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Przyciski */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setIsRecurring(false);
                  setSelectedDays([1]);
                }}
                className="flex-1 px-3 py-2 text-xs font-normal text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleCreateSlot}
                disabled={createSlotMutation.isPending || (isRecurring && selectedDays.length === 0)}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg hover:from-cyan-600 hover:to-teal-600 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {createSlotMutation.isPending 
                  ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Dodawanie...
                    </span>
                  )
                  : isRecurring 
                    ? `✨ Dodaj ${selectedDays.length} ${selectedDays.length === 1 ? 'slot' : selectedDays.length < 5 ? 'sloty' : 'slotów'}`
                    : '✨ Dodaj slot'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Potwierdzenie usunięcia
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600">
              Czy na pewno chcesz usunąć ten slot dostępności?
            </p>
            
            <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
              ⚠️ Tej operacji nie można cofnąć. Jeśli slot ma aktywne rezerwacje, usunięcie nie będzie możliwe.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-sm font-normal text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDeleteSlot}
                disabled={deleteSlotMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteSlotMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Usuwanie...
                  </span>
                ) : (
                  'Usuń slot'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
