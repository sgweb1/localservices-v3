import React, { useState, useEffect } from 'react';
import { Ban, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { AvailabilityException } from './hooks/useAvailabilityExceptions';

interface BlockModalProps {
  open: boolean;
  onClose: () => void;
  exceptions: AvailabilityException[] | undefined;
  onCreateBlock: (data: { start_date: string; end_date: string; reason: string; description?: string }) => Promise<void>;
  onUpdateBlock: (id: number, data: { start_date: string; end_date: string; reason: string; description?: string }) => Promise<void>;
  onDeleteBlock: (id: number) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  open,
  onClose,
  exceptions,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  isCreating,
  isUpdating,
  isDeleting,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('Urlop');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Filtruj tylko aktywne bloki (przyszłe lub obecne)
  const activeExceptions = exceptions?.filter(ex => {
    const endDate = new Date(ex.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate >= today;
  }) || [];

  // Reset formularza
  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setReason('Urlop');
    setDescription('');
    setEditingId(null);
  };

  // Reset gdy modal się zamyka
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleEdit = (exception: AvailabilityException) => {
    setEditingId(exception.id);
    setStartDate(exception.start_date);
    setEndDate(exception.end_date);
    setReason(exception.reason);
    setDescription(exception.description || '');
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || startDate.trim() === '' || endDate.trim() === '') {
      toast.error('Podaj datę rozpoczęcia i zakończenia');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('Data zakończenia musi być późniejsza niż rozpoczęcia');
      return;
    }

    const data = { 
      start_date: startDate.trim(), 
      end_date: endDate.trim(), 
      reason: reason || 'Urlop', 
      description: description || undefined 
    };

    if (editingId) {
      await onUpdateBlock(editingId, data);
    } else {
      await onCreateBlock(data);
    }
    
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
        <DialogTitle className="sr-only">Urlopy i bloki</DialogTitle>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-medium text-slate-900">Urlopy i bloki</h3>
              <p className="text-xs text-slate-500">Zarządzaj swoją niedostępnością</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Formularz dodawania */}
          <div className="space-y-6 pb-6 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1.5">
                  📅 Data rozpoczęcia
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1.5">
                  📅 Data zakończenia
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                🏷️ Powód
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="Urlop">Urlop</option>
                <option value="Choroba">Choroba</option>
                <option value="Szkolenie">Szkolenie</option>
                <option value="Święta">Święta</option>
                <option value="Inne">Inne</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-normal text-slate-700 mb-1.5">
                📝 Opis (opcjonalnie)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dodatkowe informacje..."
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg hover:from-cyan-600 hover:to-teal-700 hover:shadow-md focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCreating || isUpdating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {editingId ? 'Aktualizowanie...' : 'Dodawanie...'}
                </span>
              ) : (
                editingId ? '✅ Zaktualizuj blok' : '➕ Dodaj blok'
              )}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ❌ Anuluj edycję
              </button>
            )}
          </div>

          {/* Lista aktywnych bloków */}
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Aktywne bloki ({activeExceptions.length})
            </h3>
            
            {activeExceptions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Brak aktywnych bloków
              </div>
            ) : (
              <div className="space-y-2">
                {activeExceptions.map((exception) => {
                  const start = new Date(exception.start_date);
                  const end = new Date(exception.end_date);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <div
                      key={exception.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        editingId === exception.id
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {exception.reason}
                          </span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            {days} {days === 1 ? 'dzień' : 'dni'}
                          </span>
                          {editingId === exception.id && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Edycja
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600">
                          {start.toLocaleDateString('pl-PL')} - {end.toLocaleDateString('pl-PL')}
                        </div>
                        {exception.description && (
                          <div className="text-xs text-slate-500 mt-1">
                            {exception.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(exception)}
                          disabled={isDeleting || editingId !== null}
                          className="p-2 rounded-md hover:bg-amber-200 text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
                          title="Edytuj blok"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteBlock(exception.id)}
                          disabled={isDeleting || editingId !== null}
                          className="p-2 rounded-md hover:bg-red-200 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Usuń blok"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
