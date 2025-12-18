<?php

namespace App\Services\Profile;

use App\Exceptions\Profile\InvalidPasswordException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * Serwis zmiany hasła użytkownika
 * 
 * Weryfikuje obecne hasło i zapisuje nowe z hashowaniem.
 */
class UpdatePasswordService
{
    /**
     * Zmień hasło użytkownika
     * 
     * @param User $user Użytkownik
     * @param string $currentPassword Obecne hasło
     * @param string $newPassword Nowe hasło
     * @return void
     * @throws InvalidPasswordException Gdy obecne hasło jest nieprawidłowe
     */
    public function __invoke(User $user, string $currentPassword, string $newPassword): void
    {
        // Weryfikacja obecnego hasła
        if (!Hash::check($currentPassword, $user->password)) {
            throw new InvalidPasswordException('Current password is incorrect');
        }

        // Update hasła
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Log (bez hasła)
        Log::info('Password changed', [
            'user_id' => $user->id,
        ]);
    }
}
