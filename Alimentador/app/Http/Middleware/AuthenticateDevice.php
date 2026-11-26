<?php

namespace App\Http\Middleware;

use App\Models\Device;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

final class AuthenticateDevice
{
    

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-Device-Token');

        if (! $token || ! is_string($token)) {
            return response()->json([
                'message' => 'Token do dispositivo não fornecido.',
            ], 401);
        }

        $device = Device::findByToken($token);

        if (! $device) {
            Log::warning('Tentativa de autenticação de device com token inválido.', [
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Dispositivo não autenticado.',
            ], 401);
        }

        
        $request->merge(['authenticated_device' => $device]);

        return $next($request);
    }
}
