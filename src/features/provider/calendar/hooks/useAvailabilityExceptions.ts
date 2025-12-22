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
 * Hook do pobierania listy wyjątków (bloków)
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
 * Hook do tworzenia nowego bloku
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
 * Hook do usuwania bloku
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
 * Hook do aktualizacji bloku
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
