<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PairDeviceRequest;
use App\Models\Device;
use App\Services\DeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class DeviceController extends Controller
{
    public function __construct(
        private readonly DeviceService $deviceService,
    ) {}

    

    public function index(Request $request): JsonResponse
    {
        $devices = $this->deviceService->listForUser($request->user());

        return response()->json([
            'devices' => $devices,
        ]);
    }

    

    public function pair(PairDeviceRequest $request): JsonResponse
    {
        $device = $this->deviceService->pairToUser(
            user: $request->user(),
            serialCode: $request->validated('serial_code'),
            name: $request->validated('name'),
        );

        return response()->json([
            'message' => 'Alimentador vinculado com sucesso!',
            'device'  => $device,
        ]);
    }

    

    public function show(Device $device): JsonResponse
    {
        Gate::authorize('view', $device);

        $device = $this->deviceService->getWithDetails($device);

        return response()->json([
            'device' => $device,
        ]);
    }

    

    public function update(Request $request, Device $device): JsonResponse
    {
        Gate::authorize('update', $device);

        $validated = $request->validate([
            'name'         => ['nullable', 'string', 'max:100'],
            'location_lat' => ['nullable', 'numeric', 'min:-90', 'max:90'],
            'location_lng' => ['nullable', 'numeric', 'min:-180', 'max:180'],
        ]);

        $device = $this->deviceService->update($device, $validated);

        return response()->json([
            'message' => 'Alimentador atualizado.',
            'device'  => $device,
        ]);
    }

    

    public function destroy(Device $device): JsonResponse
    {
        Gate::authorize('delete', $device);

        $this->deviceService->unpair($device);

        return response()->json([
            'message' => 'Alimentador desvinculado com sucesso.',
        ]);
    }
}
