<?php

namespace App\Services;

use App\Exceptions\DeviceAlreadyPairedException;
use App\Models\Device;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class DeviceService
{
    

    public function listForUser(User $user): Collection
    {
        return $user->devices()
            ->with('latestTelemetry')
            ->limit(100)
            ->get();
    }

    

    public function pairToUser(User $user, string $serialCode, ?string $name = null): Device
    {
        return DB::transaction(function () use ($user, $serialCode, $name) {
            
            $device = Device::where('serial_code', $serialCode)
                ->lockForUpdate()
                ->first();

            if ($device === null) {
                throw new \InvalidArgumentException('Alimentador não encontrado.');
            }

            if ($device->user_id !== null) {
                throw new DeviceAlreadyPairedException($device);
            }

            $device->update([
                'user_id'   => $user->id,
                'name'      => $name ?? $device->name,
                'paired_at' => now(),
            ]);

            Log::info('Alimentador pareado.', [
                'user_id'     => $user->id,
                'device_id'   => $device->id,
                'serial_code' => $serialCode,
            ]);

            return $device->fresh('latestTelemetry');
        });
    }

    

    public function getWithDetails(Device $device): Device
    {
        $device->load('latestTelemetry', 'feedingSchedules');

        return $device;
    }

    

    public function update(Device $device, array $data): Device
    {
        $device->update($data);

        Log::info('Alimentador atualizado.', [
            'device_id' => $device->id,
            'fields'    => array_keys($data),
        ]);

        return $device->fresh();
    }

    

    public function unpair(Device $device): void
    {
        $userId = $device->user_id;

        $device->update([
            'user_id'   => null,
            'paired_at' => null,
            'name'      => null,
        ]);

        Log::info('Alimentador desvinculado.', [
            'device_id' => $device->id,
            'user_id'   => $userId,
        ]);
    }
}
