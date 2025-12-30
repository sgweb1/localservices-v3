import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAvatarUpload, useAvatarPreview } from '../hooks/useAvatarUpload';
import { useConfirm } from '@/hooks/useConfirm';
import { Button } from '@/components/ui/button';
import { deleteAvatar } from '../../../api/v1/profileApi';
import { User, UserType } from '../../../types/profile';

interface AvatarUploadProps {
  user: User;
  onSuccess?: () => void;
}

/**
 * Komponent uploadu avatara/logo
 * 
 * - Drag & drop zone
 * - Image preview przed uploadem
 * - Progress bar
 * - Rate limit error handling
 */
export function AvatarUpload({ user, onSuccess }: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending, error, uploadProgress } = useAvatarUpload();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const deleteMutation = useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => {
      // Odśwież użytkownika w cache
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      onSuccess?.();
    },
  });
  const preview = useAvatarPreview(selectedFile);

  const isProvider = user.user_type === UserType.Provider;
  const maxSize = isProvider ? 5 : 2; // MB
  const label = isProvider ? 'Logo' : 'Avatar';

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Client-side validation
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        onSuccess?.();
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Current avatar/logo */}
      <div className="flex items-center space-x-4">
        <img
          src={user.avatar_url || ''}
          alt={user.name}
          className="h-24 w-24 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium text-gray-700">
            Current {label}
          </p>
          <p className="text-xs text-gray-500">
            Max size: {maxSize}MB
          </p>
        </div>
      </div>

      {/* Drag & drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        <div className="text-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="mx-auto h-32 w-32 rounded-full object-cover"
            />
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          <div className="mt-4">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="md"
            >
              Choose file
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              or drag and drop
            </p>
          </div>
        </div>
      </div>

      {/* Upload button */}
      <div className="flex items-center justify-end gap-2">
        {/* Usuń avatar */}
        {user.avatar_url && (
          <Button
            type="button"
            onClick={async () => {
              const ok = await confirm({
                title: 'Potwierdzenie usunięcia',
                message: `Czy na pewno chcesz usunąć ${label.toLowerCase()}?`,
                confirmText: 'Usuń',
                variant: 'danger',
              });
              if (ok) {
                deleteMutation.mutate();
              }
            }}
            variant="secondary"
            size="md"
          >
            Usuń {label}
          </Button>
        )}

        {/* Upload */}
        {selectedFile && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isPending}
            size="md"
          >
            {isPending ? 'Uploading...' : `Upload ${label}`}
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {isPending && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error.status === 429
              ? 'Too many uploads. Please try again in 1 minute.'
              : error.message}
          </p>
        </div>
      )}

      {/* Dialog potwierdzenia */}
      {ConfirmDialog}
    </div>
  );
}
