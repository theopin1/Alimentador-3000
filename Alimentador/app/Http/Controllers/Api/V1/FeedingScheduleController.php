<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedingScheduleRequest;
use App\Models\Device;
use App\Models\FeedingSchedule;
use App\Services\FeedingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class FeedingScheduleController extends Controller
{
    public function __construct(
        private readonly FeedingService $feedingService,
    ) {}

    

    public function deviceSchedules(Request $request): JsonResponse
    {
        $device = $request->get('authenticated_device');

        $schedules = $this->feedingService->listSchedules($device);

        return response()->json([
            'schedules' => $schedules,
        ]);
    }

    public function index(Device $device): JsonResponse
    {
        Gate::authorize('manageSchedules', $device);

        $schedules = $this->feedingService->listSchedules($device);

        return response()->json([
            'schedules' => $schedules,
        ]);
    }

    

    public function store(StoreFeedingScheduleRequest $request, Device $device): JsonResponse
    {
        Gate::authorize('manageSchedules', $device);

        $schedule = $this->feedingService->createSchedule($device, $request->validated());

        return response()->json([
            'message'  => 'Agendamento criado.',
            'schedule' => $schedule,
        ], 201);
    }

    

    public function update(StoreFeedingScheduleRequest $request, FeedingSchedule $schedule): JsonResponse
    {
        Gate::authorize('update', $schedule);

        $schedule = $this->feedingService->updateSchedule($schedule, $request->validated());

        return response()->json([
            'message'  => 'Agendamento atualizado.',
            'schedule' => $schedule,
        ]);
    }

    

    public function destroy(FeedingSchedule $schedule): JsonResponse
    {
        Gate::authorize('delete', $schedule);

        $this->feedingService->deleteSchedule($schedule);

        return response()->json([
            'message' => 'Agendamento removido.',
        ]);
    }
}
