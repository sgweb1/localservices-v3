<?php

namespace App\Exceptions\Profile;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Wyjątek rzucany przy błędzie uploadu avatara/logo
 */
class AvatarUploadException extends Exception
{
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
