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
      await queryClient.cancelQueries({ queryKey: ['auth', 'user'] });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(['auth', 'user']);

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<User>(['auth', 'user'], (old: User | undefined) => ({
          ...old!,
          ...newData,
          profile: old?.profile
            ? {
                ...old.profile,
                ...newData,
              }
            : old?.profile ?? null,
          provider_profile: old?.provider_profile
            ? {
                ...old.provider_profile,
                business_name: newData.business_name ?? old.provider_profile.business_name,
                service_description: newData.service_description ?? old.provider_profile.service_description,
                website_url: newData.website_url ?? old.provider_profile.website_url,
              }
            : old?.provider_profile ?? null,
        }));
      }

      return { previousUser };
    },

    // Rollback on error
    onError: (error: ApiError, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['auth', 'user'], context.previousUser);
      }
    },

    // Invalidate cache on success
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });
}
