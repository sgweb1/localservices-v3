/**
 * Hook do zarządzania drafts dla Service Form
 * 
 * CO: Centralizuje logikę save/load/restore drafts dla formularza usług
 * JAK: Wrappuje useDraftSave + loadDraft + hasFreshDraft
 * CZEMU: Service Form ma 50+ pól - dedykowany manager lepiej zarządza
 * 
 * ZMIANA (2025-01-02): Dodano modal do pytania o restore draft
 */

import { useEffect, useState } from 'react';
import { useDraftSave, getDraftMetadata, formatDraftTime } from '@/hooks/useDraftSave';
import { loadDraft, clearDraft as clearDraftStorage, hasFreshDraft } from '@/utils/draftStorage';

/**
 * Dane formularza usługi - mapa wszystkich pól
 * 
 * CO: Type-safe interfejs dla danych formularza
 * CZEMU: Używamy gdzie indziej (type safety + documentation)
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
 * Hook do zarządzania drafts dla Service Form
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
 * // Return JSX z DraftRestoreModal
 * {showRestoreModal && (
 *   <DraftRestoreModal
 *     draft={existingDraft!}
 *     onRestore={() => restoreDraft(existingDraft!)}
 *     onDiscard={closeRestoreModal}
 *   />
 * )}
 * 
 * // Return JSX z indicator
 * <DraftSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
 */
export function useFormDraftManager(
  serviceId: string | undefined,
  formData: ServiceFormData,
  onRestore?: (data: ServiceFormData) => void
): UseFormDraftManagerReturn {
  const mode = serviceId ? 'edit' : 'create';
  const draftKey = `service-form-draft:${mode}:${serviceId || 'new'}`;

  // Auto-save hook (co 30s)
  const { isSaving, lastSaved, hasError, saveDraftNow } = useDraftSave(
    draftKey,
    formData,
    {
      intervalMs: 30000,
      saveOnUnmount: true,
      saveImmediate: false,
    }
  );

  // State dla restore modal
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [existingDraft, setExistingDraft] = useState<ServiceFormData | null>(null);

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
  }, [draftKey, formData]); // Re-check jeśli changed serviceId

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
