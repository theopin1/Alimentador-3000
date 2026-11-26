<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTelemetryRequest;
use App\Models\Device;
use App\Services\TelemetryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class TelemetryController extends Controller
{
    public function __construct(
        private readonly TelemetryService $telemetryService,
    ) {}

    

    public function ingest(StoreTelemetryRequest $request): JsonResponse
    {
        
        $device = $request->get('authenticated_device');

        $reading = $this->telemetryService->ingest($device, $request->validated());

        return response()->json([
            'message' => 'Leitura registrada.',
            'reading' => $reading,
        ], 201);
    }

    

    public function index(Request $request, Device $device): JsonResponse
    {
        Gate::authorize('viewTelemetry', $device);

        $readings = $this->telemetryService->getHistory(
            device: $device,
            perPage: (int) $request->get('per_page', 50),
        );

        return response()->json($readings);
    }

    

    public function latest(Device $device): JsonResponse
    {
        Gate::authorize('viewTelemetry', $device);

        $reading = $this->telemetryService->getLatest($device);

        return response()->json([
            'reading' => $reading,
        ]);
    }
}
