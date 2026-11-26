<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\Device;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

final class AlertService
{
    

    public function listForUser(User $user, int $perPage = 30): LengthAwarePaginator
    {
        return $user->alerts()
            ->with('device:id,name,serial_code')
            ->orderByDesc('created_at')
            ->paginate(min($perPage, 100));
    }

    

    public function markAsRead(Alert $alert, User $user): void
    {
        if ($alert->device->user_id !== $user->id) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'Você não tem permissão para acessar este alerta.'
            );
        }

        $alert->update(['is_read' => true]);

        Log::debug('Alerta marcado como lido.', [
            'alert_id'  => $alert->id,
            'device_id' => $alert->device_id,
            'user_id'   => $user->id,
        ]);
    }

    

    public function createIfNotExists(
        Device $device,
        string $type,
        string $message,
        string $severity,
    ): ?Alert {
        $exists = $device->alerts()
            ->where('type', $type)
            ->whereNull('resolved_at')
            ->exists();

        if ($exists) {
            return null;
        }

        $alert = $device->alerts()->create([
            'type'     => $type,
            'message'  => $message,
            'severity' => $severity,
        ]);

        Log::warning('Alerta gerado automaticamente.', [
            'alert_id'  => $alert->id,
            'device_id' => $device->id,
            'type'      => $type,
            'severity'  => $severity,
        ]);

        return $alert;
    }

    

    public function resolveByType(Device $device, string $type): void
    {
        $updated = $device->alerts()
            ->where('type', $type)
            ->whereNull('resolved_at')
            ->update(['resolved_at' => now()]);

        if ($updated > 0) {
            Log::info('Alertas resolvidos automaticamente.', [
                'device_id' => $device->id,
                'type'      => $type,
                'count'     => $updated,
            ]);
        }
    }

    

    public function resolve(Alert $alert, User $user): void
    {
        if ($alert->device->user_id !== $user->id) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                'Você não tem permissão para acessar este alerta.'
            );
        }

        if ($alert->resolved_at === null) {
            $alert->update(['resolved_at' => now()]);

            Log::info('Alerta resolvido manualmente.', [
                'alert_id'  => $alert->id,
                'device_id' => $alert->device_id,
                'user_id'   => $user->id,
            ]);
        }
    }
}
