<?php

namespace App\Exceptions\Profile;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Wyjątek rzucany gdy obecne hasło jest nieprawidłowe
 */
class InvalidPasswordException extends Exception
{
    /**
     * Create exception with default message
     */
    public function __construct(string $message = 'Current password is incorrect')
    {
        parent::__construct($message);
    }

    /**
     * Renderuj wyjątek jako JSON response
     */
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->message,
        ], 422);
    }
}
