<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\NewAccessToken;

final class AuthService
{
    

    public function register(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $accessToken = $user->createToken('auth-token');

        Log::info('Novo usuário registrado.', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        return [
            'user'  => $user,
            'token' => $accessToken->plainTextToken,
        ];
    }

    

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            Log::warning('Tentativa de login com credenciais inválidas.', [
                'email' => $credentials['email'],
            ]);

            throw ValidationException::withMessages([
                'email' => ['As credenciais informadas estão incorretas.'],
            ]);
        }

        $accessToken = $user->createToken('auth-token');

        Log::info('Login realizado.', [
            'user_id' => $user->id,
        ]);

        return [
            'user'  => $user,
            'token' => $accessToken->plainTextToken,
        ];
    }

    

    public function logout(User $user): void
    {
        
        $token = $user->currentAccessToken();
        $token->delete();

        Log::info('Logout realizado.', [
            'user_id' => $user->id,
        ]);
    }
}
