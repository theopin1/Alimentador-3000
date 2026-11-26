<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Services\FeedingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class FeedingEventController extends Controller
{
    public function __construct(
        private readonly FeedingService $feedingService,
    ) {}

    

    public function index(Request $request, Device $device): JsonResponse
    {
        Gate::authorize('view', $device);

        $events = $this->feedingService->getEventHistory(
            device: $device,
            perPage: (int) $request->get('per_page', 30),
        );

        return response()->json($events);
    }

    

    public function feed(Request $request, Device $device): JsonResponse
    {
        Gate::authorize('feed', $device);

        $validated = $request->validate([
            'portion_grams' => ['nullable', 'integer', 'min:10', 'max:500'],
        ]);

        $event = $this->feedingService->triggerManualFeed(
            device: $device,
            portionGrams: $validated['portion_grams'] ?? null,
        );

        return response()->json([
            'message' => 'Comando de alimentação enviado.',
            'event'   => $event,
        ], 201);
    }
}
