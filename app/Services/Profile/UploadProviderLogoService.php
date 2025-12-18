<?php

namespace App\Services\Profile;

use App\Exceptions\Profile\AvatarUploadException;
use App\Helpers\StorageHelper;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Serwis uploadu logo providera
 * 
 * Analogiczny do UploadAvatarService, ale:
 * - Tylko dla providerów
 * - Limit 5MB (więcej niż avatar)
 * - Osobny katalog storage (provider-logos)
 */
class UploadProviderLogoService
{
    public function __construct(
        private StorageHelper $storage
    ) {}

    /**
     * Upload nowego logo providera
     * 
     * @param User $user Provider
     * @param UploadedFile $file Plik logo
     * @return string URL nowego logo
     * @throws AvatarUploadException Gdy upload się nie powiedzie
     */
    public function __invoke(User $user, UploadedFile $file): string
    {
        // Sprawdź czy provider
        abort_unless($user->isProvider(), 403, 'Only providers can upload logo');

        try {
            // Walidacja rozmiaru (5MB max)
            if ($file->getSize() > 5 * 1024 * 1024) {
                throw new AvatarUploadException('Logo size must be less than 5MB');
            }

            // Walidacja typu MIME
            $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!in_array($file->getMimeType(), $allowedMimes)) {
                throw new AvatarUploadException('Logo must be an image (jpeg, png, jpg, webp)');
            }

            // Usuń stare logo
            if ($user->avatar) {
                $this->storage->deleteFile($user->avatar);
            }

            // Upload nowego
            $path = $this->storage->uploadProviderLogo($file, $user->id);

            // Update user (logo jest przechowywane w users.avatar)
            $user->update(['avatar' => $path]);

            // Invalidacja cache providera
            Cache::forget("user.avatar.{$user->id}");
            Cache::tags(['providers', "provider.{$user->id}"])->flush();

            // Log
            Log::info('Provider logo uploaded', [
                'user_id' => $user->id,
                'path' => $path,
            ]);

            return $user->getAvatarUrlAttribute();

        } catch (AvatarUploadException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Logo upload failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw new AvatarUploadException('Failed to upload logo: ' . $e->getMessage());
        }
    }
}
