<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Walidacja żądania przedłużenia boost'a
 */
class RenewBoostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isProvider();
    }

    public function rules(): array
    {
        return [
            'days' => 'required|in:7,14,30',
        ];
    }

    public function messages(): array
    {
        return [
            'days.required' => 'Liczba dni jest wymagana',
            'days.in' => 'Liczba dni musi być 7, 14 lub 30',
        ];
    }
}
