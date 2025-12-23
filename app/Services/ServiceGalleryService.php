<?php

namespace App\Services;

use App\Models\Service;
use App\Models\ServicePhoto;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Serwis biznesowy do zarządzania galerią zdjęć usług.
 *
 * Odpowiada za upload, usuwanie, zmianę kolejności oraz ustawianie zdjęcia głównego.
 */
class ServiceGalleryService
{
    /**
     * Upload nowego zdjęcia do galerii usługi.
     *
     * - Zapis pliku na dysku `public` w katalogu services/{serviceId}/
     * - Nadanie pozycji = max(position)+1
     * - Jeśli brak primary, ustaw jako primary
     *
     * @param Service $service Usługa, do której dodajemy zdjęcie
     * @param UploadedFile $file Przesłany plik obrazu
     * @param string|null $alt Opcjonalny alt text
     * @return ServicePhoto Utworzone zdjęcie
     */
    public function uploadPhoto(Service $service, UploadedFile $file, ?string $alt = null): ServicePhoto
    {
        $dir = "services/{$service->id}";
        $storedPath = $file->store($dir, 'public');

        $nextPosition = (int) $service->photos()->max('position') + 1;

        $isPrimary = ! $service->photos()->where('is_primary', true)->exists();

        return $service->photos()->create([
            'image_path' => $storedPath,
            'alt_text' => $alt,
            'is_primary' => $isPrimary,
            'position' => $nextPosition,
        ]);
    }

    /**
     * Usunięcie zdjęcia z galerii.
     *
     * - Usuwa plik z dysku
     * - Jeśli usunięto primary, ustawia nowe primary na najniższą pozycję (jeśli istnieje)
     */
    public function deletePhoto(Service $service, ServicePhoto $photo): void
    {
        if ($photo->service_id !== $service->id) {
            abort(403, 'Forbidden');
        }

        DB::transaction(function () use ($service, $photo) {
            $wasPrimary = (bool) $photo->is_primary;
            $path = $photo->image_path;

            $photo->delete();

            // Usunięcie pliku po soft-delete – wykonaj natychmiast fizycznie
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            if ($wasPrimary) {
                /** @var ServicePhoto|null $newPrimary */
                $newPrimary = $service->photos()->orderBy('position')->first();
                if ($newPrimary) {
                    $service->photos()->update(['is_primary' => false]);
                    $newPrimary->update(['is_primary' => true]);
                }
            }
        });
    }

    /**
     * Zmiana kolejności zdjęć.
     *
     * @param array<int,int> $orderedIds Tablica identyfikatorów zdjęć w nowej kolejności
     */
    public function reorderPhotos(Service $service, array $orderedIds): void
    {
        // Upewnij się, że wszystkie zdjęcia należą do usługi
        $count = $service->photos()->whereIn('id', $orderedIds)->count();
        if ($count !== count($orderedIds)) {
            abort(422, 'Nieprawidłowa lista zdjęć');
        }

        DB::transaction(function () use ($service, $orderedIds) {
            foreach ($orderedIds as $index => $photoId) {
                $service->photos()->where('id', $photoId)->update(['position' => $index + 1]);
            }
        });
    }

    /**
     * Ustawienie zdjęcia głównego.
     */
    public function setPrimary(Service $service, ServicePhoto $photo): void
    {
        if ($photo->service_id !== $service->id) {
            abort(403, 'Forbidden');
        }

        DB::transaction(function () use ($service, $photo) {
            $service->photos()->update(['is_primary' => false]);
            $photo->update(['is_primary' => true]);
        });
    }
}
