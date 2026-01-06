/**
 * Hook do zarządzania drafts dla Service Form z wbudowanym auto-save
 *
 * CO: Centralizuje logikę save/load/restore drafts z auto-save co 30s
 * JAK: Łączy funkcjonalność useDraftSave + useFormDraftManager w 1 hook
 * CZEMU: Uproszczenie - useDraftSave był używany tylko tutaj
 *
 * ZMIANA (2025-01-06): Scalono useDraftSave + useFormDraftManager (-150 linii)
 */

import { useEffect, useState, useRef } from 'react';
import {
  saveDraft,
  loadDraft,
  clearDraft as clearDraftStorage,
  hasFreshDraft,
  getDraftMetadata,
  formatDraftTime
} from '@/utils/draftStorage';

/**
 * Dane formularza usługi - mapa wszystkich pól
 *
 * CO: Type-safe interfejs dla danych formularza
 * CZEMU: Używany przez komponenty (type safety + documentation)
 */
export interface ServiceFormData {
  title: string;
  description: string;
  categoryId: number | null;
  pricingType: 'hourly' | 'fixed' | 'quote';
  basePrice: string;
  priceRangeLow: string;
  priceRangeHigh: string;
  pricingUnit: string;
  instantBooking: boolean;
  acceptsQuote: boolean;
  minNotice: string;
  maxAdvance: string;
  duration: string;
  selectedLocation: any | null;
  latitude: string;
  longitude: string;
  maxDistanceKm: string;
  willingToTravel: boolean;
  travelFeePerKm: string;
  whatIncluded: string;
  requirementsText: string;
  toolsText: string;
  metaTitle: string;
  metaDescription: string;
  status: 'active' | 'paused';
  photos: any[];
}

export interface UseFormDraftManagerReturn {
  /** Czy aktualnie zapisuje draft */
  isSaving: boolean;
  /** Timestamp ostatniego save */
  lastSaved: number | null;
  /** Czy błąd podczas save */
  hasError: boolean;
  /** Draft z localStorage (jeśli istnieje) */
  existingDraft: ServiceFormData | null;
  /** Czy pokazać modal o restore */
  showRestoreModal: boolean;
  /** Ręcznie restore draft do formu */
  restoreDraft: (data: ServiceFormData) => void;
  /** Ręcznie wyczyść draft */
  clearDraft: () => void;
  /** Ręcznie trigger save (bez czekania na interval) */
  saveDraftNow: () => Promise<boolean>;
  /** Close restore modal */
  closeRestoreModal: () => void;
}

/**
 * Hook do zarządzania drafts dla Service Form z auto-save
 *
 * @param serviceId - ID usługi (dla unique draft key) - optional (undefined = new service)
 * @param formData - aktualne dane formularza
 * @param onRestore - callback po restore (np. do setowania form state)
 * @returns { isSaving, lastSaved, existingDraft, showRestoreModal, ... }
 *
 * @example
 * // W ServiceFormPage
 * const [formData, setFormData] = useState<ServiceFormData>({...});
 *
 * const {
 *   isSaving,
 *   lastSaved,
 *   existingDraft,
 *   showRestoreModal,
 *   restoreDraft,
 *   clearDraft,
 * } = useFormDraftManager(serviceId, formData);
 *
 * // JSX z DraftRestoreModal
 * {showRestoreModal && (
 *   <DraftRestoreModal
 *     draft={existingDraft!}
 *     onRestore={() => restoreDraft(existingDraft!)}
 *     onDiscard={closeRestoreModal}
 *   />
 * )}
 *
 * // JSX z indicator
 * <DraftSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
 */
export function useFormDraftManager(
  serviceId: string | undefined,
  formData: ServiceFormData,
  onRestore?: (data: ServiceFormData) => void
): UseFormDraftManagerReturn {
  const mode = serviceId ? 'edit' : 'create';
  const draftKey = `service-form-draft:${mode}:${serviceId || 'new'}`;

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Restore modal state
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [existingDraft, setExistingDraft] = useState<ServiceFormData | null>(null);

  // Refs dla auto-save logic (throttling)
  const dataRef = useRef<ServiceFormData>(formData);
  const hasChangedRef = useRef(false);
  const intervalIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track changes w formData (throttling)
  useEffect(() => {
    if (JSON.stringify(dataRef.current) !== JSON.stringify(formData)) {
      dataRef.current = formData;
      hasChangedRef.current = true;
    }
  }, [formData]);

  // Ręczny save (bez throttling)
  const saveDraftNow = async (): Promise<boolean> => {
    setIsSaving(true);
    setHasError(false);

    try {
      const success = saveDraft(draftKey, dataRef.current);

      if (success) {
        const timestamp = Date.now();
        setLastSaved(timestamp);
        setHasError(false);
        hasChangedRef.current = false; // Reset flag
        return true;
      } else {
        throw new Error('Failed to save draft (localStorage full?)');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('[useFormDraftManager] Save failed:', err);
      setHasError(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Setup auto-save interval (co 30s)
  useEffect(() => {
    // Setup interval
    intervalIdRef.current = setInterval(() => {
      // Tylko save jeśli data się zmieniła (throttling)
      if (hasChangedRef.current) {
        saveDraftNow();
      }
    }, 30000); // 30 sekund

    // Cleanup
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }

      // Save on unmount jeśli są niezapisane zmiany
      if (hasChangedRef.current) {
        saveDraft(draftKey, dataRef.current);
      }
    };
  }, [draftKey]);

  // Na mount: sprawdź czy jest draft do restore
  useEffect(() => {
    const draft = loadDraft<ServiceFormData>(draftKey);

    // Pokaż modal TYLKO jeśli:
    // 1. Draft istnieje
    // 2. Draft jest świeży (younger than 24 hours)
    // 3. Form jest pusty (user nie zaczął edytować)
    if (
      draft &&
      hasFreshDraft(draftKey, 24 * 60 * 60 * 1000) &&
      isFormEmpty(formData)
    ) {
      setExistingDraft(draft);
      setShowRestoreModal(true);
    }
  }, [draftKey, formData]);

  // Restore draft do formu
  const restoreDraft = (data: ServiceFormData) => {
    onRestore?.(data);
    setShowRestoreModal(false);
  };

  // Wyczyść draft z localStorage
  const clearDraft = () => {
    clearDraftStorage(draftKey);
    setExistingDraft(null);
    setShowRestoreModal(false);
  };

  // Close modal
  const closeRestoreModal = () => {
    setShowRestoreModal(false);
  };

  return {
    isSaving,
    lastSaved,
    hasError,
    existingDraft,
    showRestoreModal,
    restoreDraft,
    clearDraft,
    saveDraftNow,
    closeRestoreModal,
  };
}

/**
 * Helper: sprawdza czy form jest pusty (all default values)
 *
 * CZEMU: Nie pokazuj "restore draft" jeśli user już edytuje form
 */
function isFormEmpty(formData: ServiceFormData): boolean {
  return (
    !formData.title &&
    !formData.description &&
    !formData.categoryId &&
    formData.pricingType === 'hourly' &&
    !formData.basePrice &&
    !formData.metaTitle
  );
}

/**
 * Re-export utilities dla kompatybilności
 */
export { getDraftMetadata, formatDraftTime };
