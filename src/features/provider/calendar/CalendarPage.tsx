import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Plus, Trash2, AlertCircle, Power, PowerOff, Sparkles, Copy, Filter, LayoutGrid, List, TrendingUp, CheckSquare, Repeat, ChevronLeft, ChevronRight, Ban, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/api/client';
import { useConfirm } from '@/hooks/useConfirm';
import { Button } from '@/components/ui/button';
import { CalendarDevTools } from './CalendarDevTools';
import { BlockModal } from './BlockModal';
import { Select } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import { DayMultiSelect } from '@/components/ui/day-multi-select';
import { BulkActionsBar } from '@/components/ui/bulk-actions-bar';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  useCalendar, 
  useGlobalCalendarStats,
  useCreateSlot, 
  useUpdateSlot, 
  useDeleteSlot,
  type CreateSlotData,
  type TimeSlot,
  type CalendarBooking
} from './hooks/useCalendar';
import { 
  useAvailabilityExceptions, 
  useCreateException,
  useUpdateException, 
  useDeleteException 
} from './hooks/useAvailabilityExceptions';

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
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = bieżący tydzień
  
  // Oblicz zakres dat dla API (obecny tydzień ± offset)
  const weekRange = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Niedziela, 1=Poniedziałek, ..., 6=Sobota
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Dni od poniedziałku
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysFromMonday + (currentWeekOffset * 7)); // Poniedziałek
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Niedziela
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0],
    };
  }, [currentWeekOffset]);
  
  const { data, isLoading, error, refetch } = useCalendar(weekRange.start, weekRange.end);
  const { data: globalData } = useGlobalCalendarStats(); // Globalne statystyki
  const createSlotMutation = useCreateSlot();
  const updateSlotMutation = useUpdateSlot();
  const deleteSlotMutation = useDeleteSlot();
  
  const { data: exceptions, refetch: refetchExceptions } = useAvailabilityExceptions();
  const createExceptionMutation = useCreateException();
  const updateExceptionMutation = useUpdateException();
  const deleteExceptionMutation = useDeleteException();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCopyTemplateModal, setShowCopyTemplateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'full'>('all');
  const [showBookings, setShowBookings] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [templateTargetDays, setTemplateTargetDays] = useState<number[]>([]);
  
  const { confirm, ConfirmDialog } = useConfirm();
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [newSlot, setNewSlot] = useState<CreateSlotData>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    max_bookings: 1,
  });

  // Oblicz daty dla bieżącego tygodnia
  const weekDates = useMemo(() => {
    const dates: Record<number, Date> = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() + (currentWeekOffset * 7) + (index - date.getDay() + (date.getDay() === 0 ? -6 : 1)));
      dates[day.value] = date;
    });
    return dates;
  }, [currentWeekOffset]);

  // Sprawdzenie czy dany dzień jest zablokowany urlopem
  const isDateBlocked = (date: Date) => {
    if (!exceptions || exceptions.length === 0) return null;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return exceptions.find(ex => {
      const start = new Date(ex.start_date);
      const end = new Date(ex.end_date);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

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
        daySlots = daySlots.filter(slot => getSlotBookingsCount(slot) >= slot.max_bookings);
      }
      
      grouped[day.value] = daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  }, [data?.slots, filterMode]);

  // Statystyki (przeliczone dla wybranego tygodnia)
  const stats = useMemo(() => {
    if (!data?.slots || !data?.bookings) return { total: 0, active: 0, full: 0, bookings: 0, capacity: 0 };
    
    // Oblicz zakres dat dla wybranego tygodnia
    const weekStart = weekDates[1]; // Poniedziałek
    const weekEnd = weekDates[7]; // Niedziela
    if (!weekStart || !weekEnd) return { total: 0, active: 0, full: 0, bookings: 0, capacity: 0 };
    
    const weekStartStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
    
    // Filtruj rezerwacje dla wybranego tygodnia
    const weekBookings = data.bookings.filter(booking => {
      const bookingDateStr = booking.booking_date.split('T')[0];
      return bookingDateStr >= weekStartStr && bookingDateStr <= weekEndStr;
    });
    
    const total = data.slots.length;
    const active = data.slots.filter(s => s.is_available).length;
    const capacity = data.slots.reduce((sum, s) => sum + s.max_bookings, 0);
    const bookings = weekBookings.length;
    
    // Przelicz pełne sloty dla tego tygodnia
    let full = 0;
    data.slots.forEach(slot => {
      // Policz rezerwacje dla tego slotu w wybranym tygodniu
      const slotBookings = weekBookings.filter(b => 
        b.day_of_week === slot.day_of_week && 
        b.start_time === slot.start_time
      ).length;
      
      if (slotBookings >= slot.max_bookings) {
        full++;
      }
    });
    
    return { total, active, full, bookings, capacity };
  }, [data?.slots, data?.bookings, weekDates]);

  // Globalne statystyki (wszystkie sloty i rezerwacje)
  const globalStats = useMemo(() => {
    if (!globalData?.slots || !globalData?.bookings) return { total: 0, active: 0, bookings: 0, capacity: 0 };
    
    const total = globalData.slots.length;
    const active = globalData.slots.filter(s => s.is_available).length;
    const capacity = globalData.slots.reduce((sum, s) => sum + s.max_bookings, 0);
    const bookings = globalData.bookings.length;
    
    return { total, active, bookings, capacity };
  }, [globalData?.slots, globalData?.bookings]);

  // Mapowanie statusów rezerwacji na style i etykiety
  const getBookingStatusStyle = (status: string) => {
    const statusMap = {
      confirmed: {
        bg: 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300',
        icon: 'text-cyan-600',
        badge: 'bg-emerald-100 text-emerald-700',
        label: '✓ Potwierdzona'
      },
      pending: {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        label: '⏳ Oczekuje'
      },
      in_progress: {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        label: '🔄 W trakcie'
      },
      completed: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-700',
        label: '✅ Zakończona'
      },
      cancelled: {
        bg: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700',
        label: '❌ Anulowana'
      },
      rejected: {
        bg: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300',
        icon: 'text-rose-600',
        badge: 'bg-rose-100 text-rose-700',
        label: '🚫 Odrzucona'
      },
      no_show: {
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300',
        icon: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700',
        label: '👻 Nieobecność'
      }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  // Grupuj rezerwacje po dniu tygodnia (tylko dla wybranego tygodnia)
  const bookingsByDay = React.useMemo(() => {
    if (!data?.bookings) return {};
    
    const grouped: Record<number, CalendarBooking[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      const targetDate = weekDates[day.value];
      if (!targetDate) {
        grouped[day.value] = [];
        return;
      }
      
      // Format daty jako YYYY-MM-DD do porównania
      const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
      
      grouped[day.value] = data.bookings
        .filter(booking => {
          // Porównaj booking_date z datą w tygodniu
          const bookingDateStr = booking.booking_date.split('T')[0]; // YYYY-MM-DD
          return bookingDateStr === dateStr;
        })
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });
    return grouped;
  }, [data?.bookings, weekDates]);

  // Helper do liczenia rezerwacji dla slotu w wybranym tygodniu
  const getSlotBookingsCount = (slot: TimeSlot) => {
    if (!data?.bookings) return 0;
    
    const targetDate = weekDates[slot.day_of_week];
    if (!targetDate) return 0;
    
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    return data.bookings.filter(booking => {
      const bookingDateStr = booking.booking_date.split('T')[0];
      return bookingDateStr === dateStr && 
             booking.day_of_week === slot.day_of_week && 
             booking.start_time === slot.start_time;
    }).length;
  };

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
    const ok = await confirm({
      title: 'Potwierdzenie usunięcia',
      message: 'Czy na pewno chcesz usunąć ten slot? Operacji nie można cofnąć.',
      confirmText: 'Usuń',
      variant: 'danger',
    });
    if (ok) {
      try {
        await deleteSlotMutation.mutateAsync(id);
        toast.success('Slot został usunięty');
        selectedSlots.delete(id);
        setSelectedSlots(new Set(selectedSlots));
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Nie można usunąć slotu z aktywnymi rezerwacjami');
      }
    }
  };

  const handleRejectBooking = async (bookingId: number, isConfirmed: boolean) => {
    const ok = await confirm({
      title: 'Potwierdź odrzucenie',
      message: 'Czy na pewno chcesz odrzucić tę rezerwację?',
      confirmText: 'Odrzuć',
      variant: 'danger',
    });
    if (ok) {
      try {
        await apiClient.patch(`/provider/bookings/${bookingId}/reject-booking`);
        toast.success('Rezerwacja odrzucona');
        refetch();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Błąd podczas odrzucania');
      }
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
    if (selectedSlots.size === 0) return;
    const ok = await confirm({
      title: 'Potwierdzenie usunięcia',
      message: `Czy na pewno chcesz usunąć ${selectedSlots.size} slotów? Operacji nie można cofnąć.`,
      confirmText: 'Usuń wszystkie',
      variant: 'danger',
    });
    if (ok) {
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
    }
  };

  const handleBulkToggle = async (enabled: boolean) => {
    const action = enabled ? 'enable' : 'disable';
    const ok = await confirm({
      title: `${enabled ? 'Włącz' : 'Wyłącz'} dostępność`,
      message: `Czy na pewno chcesz ${enabled ? 'włączyć' : 'wyłączyć'} dostępność dla ${selectedSlots.size} slotów?`,
      confirmText: enabled ? 'Włącz' : 'Wyłącz',
      variant: 'info',
    });
    if (ok) {
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
    }
  };

  const handleCopyTemplate = async () => {
    if (selectedSlots.size === 0) {
      toast.error('Wybierz sloty do skopiowania');
      return;
    }

    // For template copy, we need a custom dialog with day selection
    // This is handled separately - showing a custom dialog state
    setTemplateTargetDays([]);
    setShowCopyTemplateModal(true);
  };

  const confirmCopyTemplate = async () => {
    if (templateTargetDays.length === 0) {
      toast.error('Wybierz przynajmniej jeden dzień docelowy');
      return;
    }

    try {
      const selectedSlotsData = data?.slots?.filter((s: any) => selectedSlots.has(s.id)) || [];
      let createdCount = 0;

      for (const targetDay of templateTargetDays) {
        for (const slot of selectedSlotsData) {
          await createSlotMutation.mutateAsync({
            day_of_week: targetDay,
            start_time: slot.start_time,
            end_time: slot.end_time,
            max_bookings: slot.max_bookings,
          });
          createdCount++;
        }
      }

      toast.success(`Utworzono ${createdCount} slotów na podstawie szablonu`);
      setSelectedSlots(new Set());
      setSelectionMode(false);
    } catch (error: any) {
      toast.error('Błąd podczas kopiowania szablonu');
    } finally {
      setShowCopyTemplateModal(false);
      setTemplateTargetDays([]);
    }
  };

  const handleExport = () => {
    if (selectedSlots.size === 0) {
      toast.error('Wybierz sloty do eksportu');
      return;
    }

    try {
      const selectedSlotsData = data?.slots?.filter((s: any) => selectedSlots.has(s.id)) || [];
      const exportData = selectedSlotsData.map((slot: any) => ({
        dzień: DAYS_OF_WEEK.find(d => d.value === slot.day_of_week)?.label || slot.day_of_week,
        od: slot.start_time,
        do: slot.end_time,
        dostępny: slot.is_available ? 'Tak' : 'Nie',
        max_rezerwacji: slot.max_bookings,
        aktualnie_zarezerwowanych: getSlotBookingsCount(slot),
      }));

      const text = JSON.stringify(exportData, null, 2);
      navigator.clipboard.writeText(text);
      toast.success(`Skopiowano ${selectedSlots.size} slotów do schowka`);
      setSelectedSlots(new Set());
      setSelectionMode(false);
    } catch (error: any) {
      toast.error('Błąd podczas eksportu');
    }
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
          <Button
            onClick={() => setSelectionMode(!selectionMode)}
            variant={selectionMode ? "primary" : "neutral"}
            size="sm"
            className="text-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {selectionMode ? 'Anuluj zaznaczanie' : 'Zaznacz'}
          </Button>
          
          <Button
            onClick={() => {
              // Ustaw domyślny dzień na poniedziałek wybranego tygodnia
              const mondayDate = weekDates[1];
              const today = new Date();
              const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
              
              setNewSlot({
                day_of_week: currentWeekOffset === 0 ? currentDayOfWeek : 1,
                start_time: '09:00',
                end_time: '17:00',
                max_bookings: 1,
              });
              setIsRecurring(false);
              setSelectedDays([]);
              setShowAddModal(true);
            }}
            variant="primary"
            size="sm"
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dodaj dostępność</span>
          </Button>
          <Button
            onClick={() => setShowBlockModal(true)}
            variant="danger"
            size="sm"
            className="text-xs"
          >
            <Ban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Urlopy/Bloki</span>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
        <div className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-500 uppercase">Aktywne</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{globalStats.active}</div>
          <div className="text-xs text-slate-500 mt-1">z {globalStats.total} slotów</div>
        </div>

        <div className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300" style={{animationDelay: '50ms'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-500 uppercase">Rezerwacje</span>
            <Calendar className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">{globalStats.bookings}</div>
          <div className="text-xs text-slate-500 mt-1">ogółem</div>
        </div>

        <div className="glass-card p-3 rounded-xl animate-in slide-in-from-left-2 duration-300" style={{animationDelay: '100ms'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-normal text-slate-500 uppercase">Zapełnienie</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-semibold text-slate-900">
            {globalStats.capacity > 0 ? Math.round((globalStats.bookings / globalStats.capacity) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">średnia</div>
        </div>

        <div className="glass-card p-4 rounded-xl animate-in slide-in-from-left-2 duration-300" style={{animationDelay: '150ms'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">Pełne</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.full}</div>
          <div className="text-xs text-slate-500 mt-1">slotów w tym tygodniu</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 md:px-0">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="inline-flex bg-slate-100 rounded-lg p-1">
            <Button
              onClick={() => setViewMode('grid')}
              variant="ghost"
              size="icon"
              className={`rounded-md ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant="ghost"
              size="icon"
              className={`rounded-md ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter */}
          <Select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-3 py-2 text-xs border-2 border-slate-200 rounded-lg bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all"
          >
            <option value="all">Wszystkie sloty</option>
            <option value="active">Tylko aktywne</option>
            <option value="full">Tylko pełne</option>
          </Select>
          
          {/* Przycisk pokazywania rezerwacji */}
          <Button
            onClick={() => setShowBookings(!showBookings)}
            variant={showBookings ? "primary" : "neutral"}
            size="sm"
            className="text-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rezerwacje</span>
          </Button>
          
          <Button
            onClick={() => {
              if (!selectionMode) {
                toast.info('Włącz tryb zaznaczania, aby użyć szablonów');
                return;
              }
              handleCopyTemplate();
            }}
            disabled={!selectionMode}
            variant="neutral"
            size="sm"
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Szablon</span>
          </Button>
        </div>
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
          {/* Nawigacja tygodnia */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <Button
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              variant="neutral"
              size="sm"
              className="text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Poprzedni
            </Button>
            <span className="text-sm font-medium text-slate-700">
              {currentWeekOffset === 0 ? 'Bieżący tydzień' : currentWeekOffset === 1 ? 'Następny tydzień' : currentWeekOffset === -1 ? 'Poprzedni tydzień' : `${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset} tyg.`}
            </span>
            <Button
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              variant="neutral"
              size="sm"
              className="text-xs"
            >
              Następny
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Widok grid (kalendarz) */}
          {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-slate-200">
            {DAYS_OF_WEEK.map((day) => {
              const date = weekDates[day.value];
              const dateStr = date ? `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}` : '';
              const blockedException = date ? isDateBlocked(date) : null;
              
              return (
            <div key={day.value} className="bg-white">
              {/* Nagłówek dnia */}
              <div className={`p-2 border-b border-slate-200 ${
                blockedException 
                  ? 'bg-gradient-to-r from-red-100 to-rose-100' 
                  : 'bg-gradient-to-r from-cyan-50 to-teal-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{day.short}</div>
                    <div className={`text-xs font-medium ${
                      blockedException ? 'text-red-600' : 'text-cyan-600'
                    }`}>{dateStr}</div>
                  </div>
                  {blockedException && (
                    <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      <Ban className="w-3 h-3" />
                      <span>{blockedException.reason}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {slotsByDay[day.value]?.length || 0} slotów
                  {showBookings && bookingsByDay[day.value]?.length > 0 && (
                    <span className="text-cyan-600 font-medium"> · {bookingsByDay[day.value].length} rez.</span>
                  )}
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
                          className={getSlotBookingsCount(slot) >= slot.max_bookings ? 'text-red-500' : 'text-emerald-500'}
                          strokeDasharray={`${(getSlotBookingsCount(slot) / slot.max_bookings) * 56.5} 56.5`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-slate-700">
                        {getSlotBookingsCount(slot)}
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
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateSlot(slot.id, !slot.is_available);
                          }}
                          variant="ghost"
                          size="icon"
                          className={`
                            h-7 w-7 hover:bg-white/80 transition-all
                            ${slot.is_available ? 'text-emerald-600 hover:text-emerald-700' : 'text-red-600 hover:text-red-700'}
                          `}
                          title={slot.is_available ? 'Wyłącz slot' : 'Włącz slot'}
                        >
                          {slot.is_available ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlot(slot.id);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-50 text-red-500 hover:text-red-600 transition-all"
                          title="Usuń"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-1 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full transition-all duration-500 ${
                          getSlotBookingsCount(slot) >= slot.max_bookings
                            ? 'bg-gradient-to-r from-red-400 to-red-600'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`}
                        style={{ width: `${(getSlotBookingsCount(slot) / slot.max_bookings) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-normal">
                        Rezerwacje: {getSlotBookingsCount(slot)}/{slot.max_bookings}
                      </span>
                      {getSlotBookingsCount(slot) >= slot.max_bookings && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">
                          Pełne
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Rezerwacje w tym dniu */}
                {showBookings && bookingsByDay[day.value]?.map((booking, index) => {
                  const statusStyle = getBookingStatusStyle(booking.status);
                  return (
                  <div
                    key={booking.id}
                    className={`
                      p-2 rounded-lg border transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer
                      animate-in slide-in-from-right-2
                      ${statusStyle.bg}
                    `}
                    style={{ animationDelay: `${(slotsByDay[day.value]?.length || 0) * 50 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className={`w-4 h-4 ${statusStyle.icon}`} />
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
                    <div className="flex items-center justify-between gap-2">
                      <span className={`
                        inline-flex items-center px-2 py-1 text-xs font-bold rounded-lg
                        ${statusStyle.badge}
                      `}>
                        {statusStyle.label}
                      </span>
                      <div className="flex items-center gap-1">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await apiClient.patch(`/provider/bookings/${booking.id}/confirm`);
                                  toast.success('Rezerwacja potwierdzona');
                                  refetch();
                                } catch (error: any) {
                                  toast.error(error.response?.data?.error || 'Błąd podczas potwierdzania');
                                }
                              }}
                              variant="success"
                              size="sm"
                              className="text-xs h-6"
                              title="Potwierdź rezerwację"
                            >
                              ✓
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectBooking(booking.id, false);
                              }}
                              variant="danger"
                              size="sm"
                              className="text-xs h-6"
                              title="Odrzuć rezerwację"
                            >
                              ✕
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectBooking(booking.id, true);
                            }}
                            variant="danger"
                            size="sm"
                            className="text-xs h-6"
                            title="Odrzuć potwierdzoną rezerwację"
                          >
                            ✕
                          </Button>
                        )}
                        <span className="text-xs text-slate-400">
                          {booking.duration_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}

                {!slotsByDay[day.value]?.length && !bookingsByDay[day.value]?.length && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Brak slotów
                  </div>
                )}
              </div>
            </div>
            );
            })}
          </div>
          )}

          {/* Widok lista */}
          {viewMode === 'list' && (
          <div className="mt-4 space-y-2">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = slotsByDay[day.value] || [];
              const dayBookings = bookingsByDay[day.value] || [];
              if (daySlots.length === 0 && dayBookings.length === 0) return null;
              
              const date = weekDates[day.value];
              const dateStr = date ? `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}` : '';

              return (
                <div key={day.value} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{day.label}</span>
                        <span className="text-xs text-cyan-600 font-medium">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{daySlots.length} slotów</span>
                        {showBookings && dayBookings.length > 0 && (
                          <span className="text-xs text-cyan-600 font-medium">{dayBookings.length} rezerwacji</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() => selectionMode && toggleSlotSelection(slot.id)}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                          selectionMode && selectedSlots.has(slot.id) ? 'bg-cyan-50 ring-2 ring-cyan-400 ring-inset' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            slot.is_available ? 'bg-emerald-500' : 'bg-slate-300'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            <div className="text-xs text-slate-500">
                              {slot.current_bookings}/{slot.max_bookings} rezerwacji
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!selectionMode && (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateSlot(slot.id, !slot.is_available);
                                }}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                {slot.is_available ? (
                                  <Power className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <PowerOff className="w-4 h-4 text-slate-400" />
                                )}
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlot(slot.id);
                                }}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Rezerwacje dla tego dnia */}
                    {showBookings && dayBookings.map((booking) => {
                      const statusStyle = getBookingStatusStyle(booking.status);
                      return (
                        <div
                          key={`booking-${booking.id}`}
                          className={`px-4 py-3 ${statusStyle.bg} border-l-4`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Calendar className={`w-4 h-4 ${statusStyle.icon}`} />
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {booking.start_time} - {booking.end_time}
                                </div>
                                <div className="text-xs text-slate-700 font-semibold">
                                  {booking.customer_name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {booking.service_name}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-lg ${statusStyle.badge}`}>
                                  {statusStyle.label}
                                </span>
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      onClick={async () => {
                                        try {
                                          await apiClient.patch(`/provider/bookings/${booking.id}/confirm`);
                                          toast.success('Rezerwacja potwierdzona');
                                          refetch();
                                        } catch (error: any) {
                                          toast.error(error.response?.data?.error || 'Błąd podczas potwierdzania');
                                        }
                                      }}
                                      variant="success"
                                      size="sm"
                                      className="text-xs h-7"
                                      title="Potwierdź rezerwację"
                                    >
                                      ✓ Potwierdź
                                    </Button>
                                    <Button
                                      onClick={() => handleRejectBooking(booking.id, false)}
                                      variant="danger"
                                      size="sm"
                                      className="text-xs h-7"
                                      title="Odrzuć rezerwację"
                                    >
                                      ✕ Odrzuć
                                    </Button>
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <Button
                                    onClick={() => handleRejectBooking(booking.id, true)}
                                    variant="danger"
                                    size="sm"
                                    className="text-xs h-7"
                                    title="Odrzuć potwierdzoną rezerwację"
                                  >
                                    ✕ Odrzuć
                                  </Button>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                {booking.duration_minutes} min
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={() => setShowAddModal(true)}
        variant="primary"
        size="icon"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 shadow-2xl hover:scale-110 active:scale-95 transition-transform z-40 rounded-full"
      >
        <Plus className="w-6 h-6" />
      </Button>

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
            className="glass-card rounded-lg p-4 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 bg-gradient-to-br from-slate-50 to-slate-100" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-slate-900">Dodaj dostępność</h3>
                  <p className="text-xs text-slate-500">Określ kiedy jesteś dostępny</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddModal(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </Button>
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
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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

      {ConfirmDialog}

      {/* Modal kopiowania szablonu */}
      <Dialog open={showCopyTemplateModal} onOpenChange={setShowCopyTemplateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-cyan-600" />
              Kopiuj szablon slotów
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Wybrano <span className="font-semibold text-slate-900">{selectedSlots.size} {selectedSlots.size === 1 ? 'slot' : selectedSlots.size < 5 ? 'sloty' : 'slotów'}</span>.{' '}
              Wybierz dni, na które chcesz skopiować te ustawienia:
            </p>

            <DayMultiSelect
              selected={templateTargetDays}
              onChange={setTemplateTargetDays}
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowCopyTemplateModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={confirmCopyTemplate}
                disabled={createSlotMutation.isPending || templateTargetDays.length === 0}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg hover:from-cyan-600 hover:to-teal-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {createSlotMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kopiowanie...
                  </span>
                ) : (
                  `Kopiuj (${selectedSlots.size * templateTargetDays.length} slotów)`
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal bloków/urlopów */}
      <BlockModal
        open={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        exceptions={exceptions}
        onCreateBlock={async (data) => {
          try {
            await createExceptionMutation.mutateAsync(data);
            toast.success('Blok został dodany');
            await refetchExceptions(); // Manualny refetch
          } catch (error: any) {
            toast.error(error.response?.data?.error || 'Błąd podczas dodawania bloku');
          }
        }}
        onUpdateBlock={async (id, data) => {
          try {
            await updateExceptionMutation.mutateAsync({ id, data });
            toast.success('Blok został zaktualizowany');
            await refetchExceptions(); // Manualny refetch
          } catch (error: any) {
            toast.error(error.response?.data?.error || 'Błąd podczas aktualizacji bloku');
          }
        }}
        onDeleteBlock={async (id) => {
          const ok = await confirm({
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć ten blok? Operacji nie można cofnąć.',
            confirmText: 'Usuń',
            variant: 'danger',
          });
          if (ok) {
            try {
              await deleteExceptionMutation.mutateAsync(id);
              toast.success('Blok został usunięty');
              await refetchExceptions();
            } catch (error: any) {
              toast.error(error.response?.data?.error || 'Błąd podczas usuwania bloku');
            }
          }
        }}
        isCreating={createExceptionMutation.isPending}
        isUpdating={updateExceptionMutation.isPending}
        isDeleting={deleteExceptionMutation.isPending}
      />

      {/* DEV Tools */}
      <CalendarDevTools slots={data?.slots || []} />
    </div>
  );
};

export default CalendarPage;
