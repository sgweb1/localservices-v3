<?php

namespace App\Services\Profile;

use App\Events\AvatarUpdated;
use App\Exceptions\Profile\AvatarUploadException;
use App\Helpers\MediaHelper;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
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
            [$processedPath, $width, $height] = $this->processAvatar($file);

            $dir = MediaHelper::getShardedPath('avatars', $user->id);
            $filename = sprintf('avatar_%d_%d.%s', $user->id, time(), $file->getClientOriginalExtension());
            $path = $dir . '/' . $filename;

            Storage::disk('public')->put($path, file_get_contents($processedPath));

            // Update user
            $user->update(['avatar' => $path]);

            // Invalidacja cache
            Cache::forget("user.avatar.{$user->id}");

            // Log
            Log::info('Avatar uploaded', [
                'user_id' => $user->id,
                'path' => $path,
                'width' => $width,
                'height' => $height,
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

    private function processAvatar(UploadedFile $file): array
    {
        $tmpPath = tempnam(sys_get_temp_dir(), 'avatar_');
        $image = $this->createImageFromFile($file);

        $width = imagesx($image);
        $height = imagesy($image);
        $square = min($width, $height);
        $srcX = (int) floor(($width - $square) / 2);
        $srcY = (int) floor(($height - $square) / 2);

        $canvas = imagecreatetruecolor(150, 150);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);

        imagecopyresampled($canvas, $image, 0, 0, $srcX, $srcY, 150, 150, $square, $square);

        $mime = $file->getMimeType();
        switch ($mime) {
            case 'image/png':
                imagepng($canvas, $tmpPath, 6);
                break;
            case 'image/webp':
                imagewebp($canvas, $tmpPath, 90);
                break;
            default:
                imagejpeg($canvas, $tmpPath, 90);
        }

        imagedestroy($image);
        imagedestroy($canvas);

        return [$tmpPath, 150, 150];
    }

    private function createImageFromFile(UploadedFile $file)
    {
        $mime = $file->getMimeType();
        $path = $file->getRealPath();

        return match ($mime) {
            'image/png' => imagecreatefrompng($path),
            'image/webp' => imagecreatefromwebp($path),
            default => imagecreatefromjpeg($path),
        };
    }
}
