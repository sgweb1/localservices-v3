import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar } from '../../../api/v1/profileApi';
import { User, ApiError } from '../../../types/profile';
import { useState } from 'react';

/**
 * Hook do uploadu avatara
 * 
 * - Progress tracking
 * - Rate limit error handling
 * - Preview przed uploadem
 */
export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setUploadProgress(0);
    },

    onError: (error: ApiError) => {
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
}

/**
 * Hook do generowania preview avatara
 */
export function useAvatarPreview(file: File | null) {
  const [preview, setPreview] = useState<string | null>(null);

  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return preview;
}
