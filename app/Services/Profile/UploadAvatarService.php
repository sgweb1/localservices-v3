<?php

namespace App\Services\Profile;

use App\Events\AvatarUpdated;
use App\Exceptions\Profile\AvatarUploadException;
use App\Helpers\StorageHelper;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Serwis uploadu avatara użytkownika
 * 
 * Obsługuje upload avatara z:
 * - Shardingiem ścieżek (100 katalogów)
 * - Usuwaniem starego avatara
 * - Invalidacją cache
 * - Logowaniem akcji
 * - Dispatchem eventu
 */
class UploadAvatarService
{
    public function __construct(
        private StorageHelper $storage
    ) {}

    /**
     * Upload nowego avatara
     * 
     * @param User $user Użytkownik
     * @param UploadedFile $file Plik avatara
     * @return string URL nowego avatara
     * @throws AvatarUploadException Gdy upload się nie powiedzie
     */
    public function __invoke(User $user, UploadedFile $file): string
    {
        try {
            // Walidacja rozmiaru (2MB max)
            if ($file->getSize() > 2 * 1024 * 1024) {
                throw new AvatarUploadException('Avatar size must be less than 2MB');
            }

            // Walidacja typu MIME
            $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                throw new AvatarUploadException('Avatar must be an image (jpeg, png, jpg, webp)');
            }

            // Usuń stary avatar
            if ($user->avatar) {
                $this->storage->deleteFile($user->avatar);
            }

            // Upload nowego
            $path = $this->storage->uploadAvatar($file, $user->id);

            // Update user
            $user->update(['avatar' => $path]);

            // Invalidacja cache
            Cache::forget("user.avatar.{$user->id}");

            // Log
            Log::info('Avatar uploaded', [
                'user_id' => $user->id,
                'path' => $path,
            ]);

            // Dispatch event
            AvatarUpdated::dispatch($user);

            return $user->getAvatarUrlAttribute();

        } catch (AvatarUploadException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Avatar upload failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw new AvatarUploadException('Failed to upload avatar: ' . $e->getMessage());
        }
    }
}
