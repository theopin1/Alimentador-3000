<?php

namespace App\Services;

use App\Models\Device;
use App\Models\FeedingEvent;
use App\Models\FeedingSchedule;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

final class FeedingService
{
    private const DEFAULT_PORTION_GRAMS = 50;
    private const MAX_SCHEDULES_PER_DEVICE = 20;

    

    public function listSchedules(Device $device): Collection
    {
        return $device->feedingSchedules()
            ->orderBy('scheduled_time')
            ->limit(self::MAX_SCHEDULES_PER_DEVICE)
            ->get();
    }

    

    public function createSchedule(Device $device, array $data): FeedingSchedule
    {
        $schedule = $device->feedingSchedules()->create([
            'scheduled_time' => $data['scheduled_time'],
            'portion_grams'  => $data['portion_grams'],
            'days_of_week'   => $data['days_of_week'] ?? [1, 2, 3, 4, 5, 6, 7],
            'is_active'      => $data['is_active'] ?? true,
        ]);

        Log::info('Agendamento de alimentação criado.', [
            'device_id'   => $device->id,
            'schedule_id' => $schedule->id,
            'time'        => $data['scheduled_time'],
        ]);

        return $schedule;
    }

    

    public function updateSchedule(FeedingSchedule $schedule, array $data): FeedingSchedule
    {
        $schedule->update($data);

        Log::info('Agendamento atualizado.', [
            'schedule_id' => $schedule->id,
            'device_id'   => $schedule->device_id,
        ]);

        return $schedule->fresh();
    }

    

    public function deleteSchedule(FeedingSchedule $schedule): void
    {
        $scheduleId = $schedule->id;
        $deviceId = $schedule->device_id;

        $schedule->delete();

        Log::info('Agendamento removido.', [
            'schedule_id' => $scheduleId,
            'device_id'   => $deviceId,
        ]);
    }

    

    public function getEventHistory(Device $device, int $perPage = 30): LengthAwarePaginator
    {
        return $device->feedingEvents()
            ->with('schedule:id,scheduled_time')
            ->orderByDesc('executed_at')
            ->paginate(min($perPage, 100));
    }

    

    public function triggerManualFeed(Device $device, ?int $portionGrams = null): FeedingEvent
    {
        $portion = $portionGrams ?? self::DEFAULT_PORTION_GRAMS;

        $event = $device->feedingEvents()->create([
            'trigger_type'  => 'manual',
            'portion_grams' => $portion,
            'status'        => 'success',
            'executed_at'   => now(),
        ]);

        Log::info('Alimentação manual acionada.', [
            'device_id' => $device->id,
            'event_id'  => $event->id,
            'grams'     => $portion,
        ]);

        return $event;
    }
}
