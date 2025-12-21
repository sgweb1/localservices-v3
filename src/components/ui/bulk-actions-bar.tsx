import * as React from 'react';
import { Copy, Trash2, Power, PowerOff, Download } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onCopy: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
  onExport: () => void;
  onClear: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onCopy,
  onDelete,
  onToggle,
  onExport,
  onClear,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card rounded-2xl shadow-2xl border-2 border-cyan-400 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{selectedCount}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {selectedCount === 1 ? 'slot wybrany' : `sloty wybrane`}
            </span>
          </div>

          <div className="w-px h-8 bg-slate-300" />

          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="p-2 rounded-lg bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition-all active:scale-95"
              title="Kopiuj do innych dni"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onToggle(true)}
              className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all active:scale-95"
              title="Włącz wszystkie"
            >
              <Power className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onToggle(false)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
              title="Wyłącz wszystkie"
            >
              <PowerOff className="w-4 h-4" />
            </button>
            
            <button
              onClick={onExport}
              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all active:scale-95"
              title="Eksportuj do kalendarza"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all active:scale-95"
              title="Usuń zaznaczone"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-8 bg-slate-300" />

          <button
            onClick={onClear}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};
