/**
 * Komponent: Modal do pytania o restore draft
 * 
 * CO: Pokazuje dialog z pytaniem czy wczytać znaleziony draft
 * JAK: Pobiera timestamp z metadata i pokazuje ładnie sformatowany czas
 * CZEMU: UX friendly way do recovery utraconych danych
 * 
 * ZMIANA (2025-01-02): Dodano info ile pól zostało zapamiętane
 */

import { ServiceFormData } from '@/features/provider/hooks/useFormDraftManager';
import { formatDraftTime, getDraftMetadata } from '@/utils/draftStorage';
import { Button } from '@/components/ui/button';

interface DraftRestoreModalProps {
  /** Draft data */
  draft: ServiceFormData;
  /** Draft key (dla metadata) */
  draftKey?: string;
  /** Callback restore */
  onRestore: () => void;
  /** Callback discard */
  onDiscard: () => void;
}

/**
 * Modal do pytania czy wczytać draft
 * 
 * @example
 * {showRestoreModal && (
 *   <DraftRestoreModal
 *     draft={existingDraft}
 *     draftKey="service-form-draft:new"
 *     onRestore={() => restoreDraft(existingDraft)}
 *     onDiscard={closeRestoreModal}
 *   />
 * )}
 * 
 * Renderuje:
 * [Dialog]
 * Znaleźliśmy niezapisaną wersję formularza
 * Ostatnio edytowany: wczoraj 14:32
 * 
 * [Wczytaj draft] [Zacznij nową]
 */
export function DraftRestoreModal({
  draft,
  draftKey,
  onRestore,
  onDiscard,
}: DraftRestoreModalProps) {
  // Metadata z draft (timestamp)
  const metadata = draftKey ? getDraftMetadata(draftKey) : null;

  // Count ile pól ma wartości (dla info)
  const filledFieldsCount = [
    draft.title,
    draft.description,
    draft.categoryId,
    draft.basePrice,
    draft.metaTitle,
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Znaleźliśmy niezapisaną wersję
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Formularz z poprzedniej sesji jest dostępny do przywrócenia
          </p>
        </div>

        {/* Info o draft */}
        <div className="bg-cyan-50/50 dark:bg-cyan-950/30 rounded-lg p-3 space-y-2 text-sm">
          {metadata && (
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Ostatnio edytowany:</span>{' '}
              <span className="text-cyan-600 dark:text-cyan-400">
                {formatDraftTime(metadata.savedAt)}
              </span>
            </p>
          )}

          <p className="text-slate-700 dark:text-slate-300">
            <span className="font-semibold">Pola:</span>{' '}
            <span className="text-cyan-600 dark:text-cyan-400">
              {filledFieldsCount} wypełnionych
            </span>
          </p>

          {draft.title && (
            <p className="text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Tytuł:</span> "{draft.title}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onRestore}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md hover:shadow-lg"
          >
            Wczytaj draft
          </Button>
          <Button
            variant="ghost"
            onClick={onDiscard}
            className="flex-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Zacznij nową
          </Button>
        </div>
      </div>
    </div>
  );
}
