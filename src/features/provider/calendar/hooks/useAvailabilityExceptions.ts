import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface AvailabilityException {
  id: number;
  provider_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  description: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateExceptionData {
  start_date: string;
  end_date: string;
  reason?: string;
  description?: string;
}

/**
 * Hook do pobierania listy wyjątków dostępności (urlopy, blokady dat)
 * 
 * **Typy wyjątków:**
 * - Urlopy (vacation) - provider niedostępny przez okres (np. 7-14 dni)
 * - Blokady (block) - pojedyncza data nieaktywna (święta, konserwacja)
 * 
 * **Zwraca:**
 * - Lista wyjątków z datami start/end, powodem, statusem zatwierdzenia
 * 
 * **Zastosowanie:**
 * - Wyświetlanie kalendarza urlopów
 * - Blokowanie dat w kalendarzu rezerwacji
 * - Informowanie klientów o niedostępności
 * 
 * **Cache Strategy:**
 * - staleTime: 30s
 * - Auto-invalidation po create/update/delete
 * 
 * **Przykład:**
 * ```typescript
 * const { data: exceptions } = useAvailabilityExceptions();
 * 
 * // Sprawdź czy data jest zablokowana
 * const isBlocked = (date: Date) => {
 *   return exceptions?.some(ex => {
 *     const start = new Date(ex.start_date);
 *     const end = new Date(ex.end_date);
 *     return date >= start && date <= end;
 *   });
 * };
 * ```
 * 
 * @returns UseQueryResult<AvailabilityException[]>
 */
export const useAvailabilityExceptions = () => {
  return useQuery<AvailabilityException[]>({
    queryKey: ['availability-exceptions'],
    queryFn: async () => {
      const response = await apiClient.get('/provider/calendar/exceptions');
      return response.data.data;
    },
    staleTime: 30000,
  });
};

/**
 * Hook do tworzenia nowego wyjątku dostępności (urlop/blokada)
 * 
 * **Mutacja:** POST /provider/calendar/exceptions
 * 
 * **Typy wyjątków:**
 * 1. **Urlop (vacation)**: Wielodniowy okres niedostępności
 *    - Przykład: 7-14 dni urlopu
 *    - reason: "Urlop letni"
 * 
 * 2. **Blokada (block)**: Pojedyncza data zablokowana
 *    - Przykład: Święto, konserwacja sprzętu
 *    - reason: "Święto państwowe", "Konserwacja"
 * 
 * **Automatyczne akcje po sukcesie:**
 * - Invaliduje cache wyjątków (wymusza refetch)
 * - Invaliduje cache kalendarza (aktualizuje widok)
 * 
 * **Przykład - urlop:**
 * ```typescript
 * const createException = useCreateException();
 * 
 * await createException.mutateAsync({
 *   start_date: '2025-06-01',
 *   end_date: '2025-06-14',
 *   reason: 'Urlop letni',
 *   description: 'Wyjazd na Mazury',
 * });
 * ```
 * 
 * **Przykład - blokada pojedynczej daty:**
 * ```typescript
 * await createException.mutateAsync({
 *   start_date: '2025-05-01',
 *   end_date: '2025-05-01',
 *   reason: 'Święto państwowe',
 * });
 * ```
 * 
 * @returns UseMutationResult
 */
export const useCreateException = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateExceptionData) => {
      const response = await apiClient.post('/provider/calendar/exceptions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

/**
 * Hook do usuwania wyjątku dostępności
 * 
 * **Mutacja:** DELETE /provider/calendar/exceptions/{id}
 * 
 * **Kiedy używać:**
 * - Odwołanie urlopu (np. zmiana planów)
 * - Usunięcie błędnie wprowadzonej blokady
 * - Przywrócenie dostępności na daną datę
 * 
 * **Automatyczne akcje:**
 * - Invaliduje cache wyjątków
 * - Invaliduje cache kalendarza (odblokuje daty)
 * 
 * **Przykład z potwierdzeniem:**
 * ```typescript
 * const deleteException = useDeleteException();
 * const { confirm } = useConfirm();
 * 
 * const handleDelete = async (exceptionId: number) => {
 *   const ok = await confirm({
 *     title: 'Usuń urlop/blokadę',
 *     message: 'Czy na pewno chcesz usunąć ten wyjątek?',
 *     variant: 'danger',
 *   });
 *   
 *   if (ok) {
 *     await deleteException.mutateAsync(exceptionId);
 *     toast.success('Wyjątek usunięty - daty odblokowane');
 *   }
 * };
 * ```
 * 
 * @returns UseMutationResult
 */
export const useDeleteException = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/provider/calendar/exceptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

/**
 * Hook do aktualizacji istniejącego wyjątku dostępności
 * 
 * **Mutacja:** PUT /provider/calendar/exceptions/{id}
 * 
 * **Typowe przypadki użycia:**
 * - Zmiana dat urlopu (np. skrócenie/wydłużenie)
 * - Zmiana powodu (reason, description)
 * - Korekta błędnie wprowadzonych dat
 * 
 * **Przykład - zmiana dat urlopu:**
 * ```typescript
 * const updateException = useUpdateException();
 * 
 * // Skróć urlop o 3 dni (z 14 do 11 dni)
 * await updateException.mutateAsync({
 *   id: 123,
 *   data: {
 *     start_date: '2025-06-01',
 *     end_date: '2025-06-11', // Było: 2025-06-14
 *     reason: 'Urlop letni (skrócony)',
 *   },
 * });
 * ```
 * 
 * **Przykład - zmiana powodu:**
 * ```typescript
 * await updateException.mutateAsync({
 *   id: 123,
 *   data: {
 *     start_date: '2025-05-01',
 *     end_date: '2025-05-01',
 *     reason: 'Konserwacja sprzętu',
 *     description: 'Wymiana części w urządzeniu',
 *   },
 * });
 * ```
 * 
 * @returns UseMutationResult
 */
export const useUpdateException = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateExceptionData }) => {
      const response = await apiClient.put(`/provider/calendar/exceptions/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};
