<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Walidacja do przedłużenia subskrypcji
 * 
 * PUT /api/v1/subscriptions/{subscription}/renew
 */
class RenewSubscriptionRequest extends FormRequest
{
    /**
     * Sprawdzenie autoryzacji - nie robimy tutaj, robimy w kontrolerze
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reguły walidacji
     */
    public function rules(): array
    {
        return [
            'billing_period' => 'nullable|in:monthly,yearly',
        ];
    }

    /**
     * Wiadomości błędów (po polsku)
     */
    public function messages(): array
    {
        return [
            'billing_period.in' => 'Okres rozliczeniowy musi być monthly lub yearly',
        ];
    }
}
