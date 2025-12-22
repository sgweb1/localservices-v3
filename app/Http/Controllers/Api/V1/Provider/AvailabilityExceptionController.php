<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Models\AvailabilityException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvailabilityExceptionController extends Controller
{
    /**
     * Lista wyjątków dostępności (bloków)
     */
    public function index(Request $request)
    {
        $providerId = $request->user()->id;
        
        $exceptions = AvailabilityException::where('provider_id', $providerId)
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $exceptions,
        ]);
    }

    /**
     * Dodanie nowego bloku
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
            'reason' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        // Dodatkowa walidacja dat
        if (strtotime($request->end_date) < strtotime($request->start_date)) {
            return response()->json([
                'success' => false,
                'error' => 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia',
            ], 422);
        }

        $exception = AvailabilityException::create([
            'provider_id' => $request->user()->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason ?: 'Urlop',
            'description' => $request->description ?: null,
            'is_approved' => true, // Auto-approve dla własnych bloków
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Blok dostępności został dodany',
            'data' => $exception,
        ], 201);
    }

    /**
     * Usunięcie bloku
     */
    public function destroy(Request $request, $id)
    {
        $exception = AvailabilityException::where('provider_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$exception) {
            return response()->json([
                'success' => false,
                'error' => 'Blok nie został znaleziony',
            ], 404);
        }

        $exception->delete();

        return response()->json([
            'success' => true,
            'message' => 'Blok dostępności został usunięty',
        ]);
    }

    /**
     * Aktualizacja bloku
     */
    public function update(Request $request, $id)
    {
        $exception = AvailabilityException::where('provider_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$exception) {
            return response()->json([
                'success' => false,
                'error' => 'Blok nie został znaleziony',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
            'reason' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        // Dodatkowa walidacja dat
        if (strtotime($request->end_date) < strtotime($request->start_date)) {
            return response()->json([
                'success' => false,
                'error' => 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia',
            ], 422);
        }

        $exception->update([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason ?: $exception->reason,
            'description' => $request->description ?: null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Blok dostępności został zaktualizowany',
            'data' => $exception->fresh(),
        ]);
    }
}
