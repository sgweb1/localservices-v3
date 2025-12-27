import React, { useState } from 'react';
import { AlertCircle, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography';
import { HardLockOverlay } from './HardLockOverlay';
import { useSubscription } from '../hooks/useSubscription';
import {
  canAddPhotoToService,
  getHiddenPhotosPerService,
  getLimitColor,
} from '../utils/hardLockUtils';

interface Photo {
  id: number;
  url: string;
  alt?: string;
  uploadedAt?: string;
}

interface PhotoUploadWithLimitsProps {
  photos: Photo[];
  maxPhotos: number; // Z backend limits
  onUpload?: (file: File) => void;
  onDelete?: (photoId: number) => void;
  onUpgrade?: () => void;
}

/**
 * Photo upload component ze HARD LOCK dla limit zdjęć
 *
 * Features:
 * - Wyświetla progress: "3 / 5 zdjęć"
 * - Ukrywa zdjęcia > limit z overlay
 * - Disable upload button jeśli limit osiągnięty
 * - Drag & drop support
 *
 * @since 2025-12-24
 */
export const PhotoUploadWithLimits: React.FC<PhotoUploadWithLimitsProps> = ({
  photos,
  maxPhotos,
  onUpload,
  onDelete,
  onUpgrade,
}) => {
  const { limits } = useSubscription();
  const [isDragging, setIsDragging] = useState(false);

  if (!limits) return null;

  const visiblePhotos = photos.slice(0, maxPhotos);
  const hiddenCount = getHiddenPhotosPerService(photos.length, {
    ...limits,
    max_photos_per_service: maxPhotos,
  } as any);
  const canAdd = canAddPhotoToService(photos.length, {
    ...limits,
    max_photos_per_service: maxPhotos,
  } as any);
  const limitColor = getLimitColor(photos.length, maxPhotos);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        onUpload?.(file);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      onUpload?.(file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Limit Info */}
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-sm font-semibold">Zdjęcia</Text>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-semibold ${
                limitColor === 'red'
                  ? 'text-red-600 dark:text-red-400'
                  : limitColor === 'yellow'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
              }`}
            >
              {photos.length} / {maxPhotos} zdjęć
            </span>
          </div>
        </div>

        {/* Upload Button */}
        <div className="relative">
          <input
            id="photo-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={!canAdd}
            className="hidden"
          />
          <label htmlFor="photo-upload">
            <Button
              as="span"
              variant={canAdd ? 'primary' : 'disabled'}
              disabled={!canAdd}
              title={
                !canAdd
                  ? `Limit zdjęć osiągnięty (${maxPhotos}/${maxPhotos}).`
                  : undefined
              }
              className="cursor-pointer"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Dodaj zdjęcia
            </Button>
          </label>
        </div>
      </div>

      {/* Upload Area */}
      {canAdd && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20'
          }`}
        >
          <ImagePlus className="w-8 h-8 mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Przeciągnij i upuść zdjęcia tutaj
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            lub kliknij "Dodaj zdjęcia"
          </p>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Visible Photos */}
          {visiblePhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden group bg-slate-100 dark:bg-slate-800"
            >
              <img
                src={photo.url}
                alt={photo.alt || 'Photo'}
                className="w-full h-full object-cover"
              />

              {/* Delete Button */}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete?.(photo.id)}
                className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition"
              >
                Usuń
              </Button>
            </div>
          ))}

          {/* Hidden Photos Overlay */}
          {hiddenCount > 0 &&
            photos.slice(maxPhotos).map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden group bg-slate-100 dark:bg-slate-800"
              >
                {/* Locked Content */}
                <img
                  src={photo.url}
                  alt={photo.alt || 'Photo'}
                  className="w-full h-full object-cover blur-sm"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-xs font-semibold">
                      +{hiddenCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <Text muted size="sm">
            Brak zdjęć. Dodaj pierwsze zdjęcie.
          </Text>
        </div>
      )}

      {/* Upgrade CTA */}
      {hiddenCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {hiddenCount} zdjęć ukrytych
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-3">
                Upgrade do wyższego planu, aby wyświetlić więcej zdjęć.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={onUpgrade}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadWithLimits;
