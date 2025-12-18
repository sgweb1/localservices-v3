import { useMutation } from '@tanstack/react-query';
import { updatePassword } from '../../api/v1/profileApi';
import { UpdatePasswordRequest, ApiError } from '../../types/profile';

/**
 * Hook do zmiany hasła
 * 
 * - Walidacja current password
 * - Error handling dla 422 (incorrect password)
 */
export function usePasswordUpdate() {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => updatePassword(data),

    onError: (error: ApiError) => {
      // Handle specific error cases
      if (error.status === 422) {
        // Current password incorrect
        console.error('Current password is incorrect');
      }
    },

    onSuccess: () => {
      // Optional: logout user i redirect do login
      console.log('Password updated successfully');
    },
  });
}
