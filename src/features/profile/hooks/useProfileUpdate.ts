import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../../../api/v1/profileApi';
import { ProfileUpdateRequest, User, ApiError } from '../../../types/profile';

/**
 * Hook do aktualizacji profilu użytkownika
 * 
 * - Optimistic update cache
 * - Invalidacja cache po sukcesie
 * - Typed error handling
 */
export function useProfileUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => updateProfile(data),

    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['user'] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(['user']);

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<User>(['user'], (old: User | undefined) => ({
          ...old!,
          ...newData,
          profile: {
            ...old!.profile!,
            ...newData,
          },
        }));
      }

      return { previousUser };
    },

    // Rollback on error
    onError: (error: ApiError, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user'], context.previousUser);
      }
    },

    // Invalidate cache on success
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
