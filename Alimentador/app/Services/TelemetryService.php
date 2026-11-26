<?php

namespace App\Services;

use App\Models\Device;
use App\Models\TelemetryReading;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class TelemetryService
{
    private const RESERVOIR_LOW_THRESHOLD_CM = 2.9;
    private const TEMPERATURE_HIGH_THRESHOLD_C = 35.0;
    private const HUMIDITY_HIGH_THRESHOLD_PCT = 12.0;

    public function __construct(
        private readonly AlertService $alertService,
    ) {}



    public function ingest(Device $device, array $data): TelemetryReading
    {
        return DB::transaction(function () use ($device, $data) {
            $reading = $device->telemetryReadings()->create([
                'reservoir_level_cm' => $data['reservoir_level_cm'] ?? null,
                'temperature'        => $data['temperature'] ?? null,
                'humidity'           => $data['humidity'] ?? null,
                'battery_voltage'    => $data['battery_voltage'] ?? null,
                'read_at'            => $data['read_at'] ?? now(),
            ]);

            if ($device->status !== 'online') {
                $device->update(['status' => 'online']);
            }

            $this->evaluateAlerts($device, $reading);

            Log::debug('Telemetria registrada.', [
                'device_id'  => $device->id,
                'reading_id' => $reading->id,
            ]);

            return $reading;
        });
    }



    public function getHistory(Device $device, int $perPage = 50): LengthAwarePaginator
    {
        return $device->telemetryReadings()
            ->orderByDesc('read_at')
            ->orderByDesc('id')
            ->paginate(min($perPage, 100));
    }



    public function getLatest(Device $device): ?TelemetryReading
    {
        return $device->telemetryReadings()
            ->orderByDesc('read_at')
            ->orderByDesc('id')
            ->first();
    }



    private function evaluateAlerts(Device $device, TelemetryReading $reading): void
    {
        if ($reading->reservoir_level_cm !== null) {
            if ($reading->reservoir_level_cm < self::RESERVOIR_LOW_THRESHOLD_CM) {
                $this->alertService->createIfNotExists(
                    device: $device,
                    type: 'low_reservoir',
                    message: 'Nível do reservatório crítico! Reabastecimento necessário.',
                    severity: 'critical',
                );
            } else {
                $this->alertService->resolveByType($device, 'low_reservoir');
            }
        }

        if ($reading->temperature !== null) {
            if ($reading->temperature > self::TEMPERATURE_HIGH_THRESHOLD_C) {
                $this->alertService->createIfNotExists(
                    device: $device,
                    type: 'high_temperature',
                    message: "Temperatura elevada ({$reading->temperature}°C). Risco de deterioração da ração.",
                    severity: 'warning',
                );
            } else {
                $this->alertService->resolveByType($device, 'high_temperature');
            }
        }

        if ($reading->humidity !== null) {
            if ($reading->humidity > self::HUMIDITY_HIGH_THRESHOLD_PCT) {
                $this->alertService->createIfNotExists(
                    device: $device,
                    type: 'high_humidity',
                    message: "Umidade elevada ({$reading->humidity}%). Risco de mofo na ração.",
                    severity: 'warning',
                );
            } else {
                $this->alertService->resolveByType($device, 'high_humidity');
            }
        }
    }
}
