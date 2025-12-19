import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, Copy, Check, X } from 'lucide-react';

/**
 * Kalendarz Dostępności - Interaktywny widok zarządzania slotami
 * 
 * Features:
 * - Widok tygodniowy/miesięczny
 * - Drag & drop slotów
 * - Szybkie dodawanie dostępności
 * - Kopiowanie wzorców tygodniowych
 * - Konflikty i nakładki
 */

type TimeSlot = {
  id: string;
  day: string; // 'monday', 'tuesday', etc.
  startTime: string; // 'HH:MM'
  endTime: string; // 'HH:MM'
  isAvailable: boolean;
  isBooked?: boolean;
  bookingId?: number;
};

type WeekView = 'week' | 'month';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Poniedziałek', short: 'Pon' },
  { key: 'tuesday', label: 'Wtorek', short: 'Wt' },
  { key: 'wednesday', label: 'Środa', short: 'Śr' },
  { key: 'thursday', label: 'Czwartek', short: 'Czw' },
  { key: 'friday', label: 'Piątek', short: 'Pt' },
  { key: 'saturday', label: 'Sobota', short: 'Sob' },
  { key: 'sunday', label: 'Niedziela', short: 'Nie' },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  label: `${i.toString().padStart(2, '0')}:00`,
}));

export const CalendarPage: React.FC = () => {
  const [view, setView] = useState<WeekView>('week');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    },
    {
      id: '2',
      day: 'tuesday',
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    },
    {
      id: '3',
      day: 'monday',
      startTime: '14:00',
      endTime: '15:30',
      isAvailable: false,
      isBooked: true,
      bookingId: 123,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleQuickAdd = (day: string) => {
    setSelectedDay(day);
    setShowAddModal(true);
  };

  const handleCopyWeek = () => {
    console.log('Copy week pattern');
    // TODO: Implement week pattern copy
  };

  const getSlotsForDay = (day: string) => {
    return slots.filter(s => s.day === day).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalendarz Dostępności</h1>
          <p className="text-sm text-slate-500 mt-1">
            Zarządzaj swoimi godzinami pracy i dostępnością dla klientów
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyWeek}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <Copy className="w-4 h-4" />
            Kopiuj tydzień
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg hover:from-cyan-600 hover:to-teal-600 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Dodaj dostępność
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Godzin w tym tygodniu</p>
              <p className="text-2xl font-bold text-slate-900">32h</p>
            </div>
            <Clock className="w-8 h-8 text-cyan-500" />
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Zarezerwowanych</p>
              <p className="text-2xl font-bold text-emerald-600">8h</p>
            </div>
            <Calendar className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Dostępnych</p>
              <p className="text-2xl font-bold text-amber-600">24h</p>
            </div>
            <Check className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Średnie obłożenie</p>
              <p className="text-2xl font-bold text-indigo-600">25%</p>
            </div>
            <Calendar className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-4 pr-4 w-24">
                  Godzina
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day.key} className="text-center text-xs font-semibold text-slate-500 uppercase pb-4 px-2">
                    <div>{day.short}</div>
                    <div className="text-slate-400 font-normal mt-1">19.12</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.filter(t => t.hour >= 6 && t.hour <= 22).map(time => (
                <tr key={time.hour} className="border-t border-slate-100">
                  <td className="py-2 pr-4 text-xs text-slate-500 font-medium">
                    {time.label}
                  </td>
                  {DAYS_OF_WEEK.map(day => {
                    const daySlots = getSlotsForDay(day.key);
                    const hasSlotAtTime = daySlots.some(slot => {
                      const [startHour] = slot.startTime.split(':').map(Number);
                      const [endHour] = slot.endTime.split(':').map(Number);
                      return time.hour >= startHour && time.hour < endHour;
                    });

                    return (
                      <td
                        key={day.key}
                        className="px-2 py-1 relative"
                        onClick={() => handleQuickAdd(day.key)}
                      >
                        <div
                          className={`h-8 rounded-lg cursor-pointer transition ${
                            hasSlotAtTime
                              ? 'bg-gradient-to-r from-cyan-100 to-teal-100 border-2 border-cyan-300 hover:border-cyan-400'
                              : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slots List */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Twoje sloty dostępności</h3>
        <div className="space-y-3">
          {DAYS_OF_WEEK.map(day => {
            const daySlots = getSlotsForDay(day.key);
            if (daySlots.length === 0) return null;

            return (
              <div key={day.key} className="flex items-start gap-4">
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{day.label}</p>
                </div>
                <div className="flex-1 flex flex-wrap gap-2">
                  {daySlots.map(slot => (
                    <div
                      key={slot.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        slot.isBooked
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {slot.startTime} - {slot.endTime}
                      {slot.isBooked && <span className="text-xs">(Zarezerwowane)</span>}
                      <button className="ml-1 hover:text-red-600 transition">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-teal-50/50 to-cyan-50/50">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">💡 Wskazówki</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>• Kliknij na puste pole w kalendarzu, aby szybko dodać dostępność</li>
          <li>• Użyj "Kopiuj tydzień" aby zastosować ten sam wzorzec na kolejne tygodnie</li>
          <li>• Zielone sloty to zarezerwowane terminy - nie możesz ich edytować</li>
          <li>• Im więcej dostępności, tym wyższy Trust Score i widoczność w wyszukiwarce</li>
        </ul>
      </div>
    </div>
  );
};

export default CalendarPage;
