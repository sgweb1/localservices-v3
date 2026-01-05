import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

/**
 * Hook do aktualizacji usługi dostawcy
 * 
 * apiClient automatycznie dodaje X-CSRF-TOKEN!
 * Nie musisz nic robić - wszystko jest obsługiwane
 */
export function useUpdateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: number; [key: string]: any }) => {
      // apiClient.patch automatycznie:
      // ✅ Dodaje X-CSRF-TOKEN z cookies
      // ✅ Wysyła withCredentials: true
      const response = await apiClient.patch(
        `/api/v1/provider/services/${data.id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate cache - wymusimy refetch listy usług
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });
}
