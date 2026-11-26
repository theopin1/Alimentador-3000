<?php

use App\Http\Controllers\Api\V1\AlertController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\FeedingEventController;
use App\Http\Controllers\Api\V1\FeedingScheduleController;
use App\Http\Controllers\Api\V1\TelemetryController;
use App\Http\Middleware\AuthenticateDevice;
use Illuminate\Support\Facades\Route;

Route::get('/v1/health', fn () => response()->json([
    'status'  => 'ok',
    'service' => 'Alimentador 3000 API',
    'version' => '1.0.0',
]));

Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware(AuthenticateDevice::class)
    ->prefix('v1/ingest')
    ->group(function () {
        Route::post('/telemetry', [TelemetryController::class, 'ingest']);
        Route::get('/schedules', [FeedingScheduleController::class, 'deviceSchedules']);
    });

Route::middleware('auth:sanctum')
    ->prefix('v1')
    ->group(function () {

        
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);

        
        Route::get('/devices', [DeviceController::class, 'index']);
        Route::post('/devices/pair', [DeviceController::class, 'pair']);
        Route::get('/devices/{device}', [DeviceController::class, 'show']);
        Route::put('/devices/{device}', [DeviceController::class, 'update']);
        Route::delete('/devices/{device}', [DeviceController::class, 'destroy']);

        
        Route::get('/devices/{device}/telemetry', [TelemetryController::class, 'index']);
        Route::get('/devices/{device}/telemetry/latest', [TelemetryController::class, 'latest']);

        
        Route::get('/devices/{device}/schedules', [FeedingScheduleController::class, 'index']);
        Route::post('/devices/{device}/schedules', [FeedingScheduleController::class, 'store']);
        Route::put('/schedules/{schedule}', [FeedingScheduleController::class, 'update']);
        Route::delete('/schedules/{schedule}', [FeedingScheduleController::class, 'destroy']);

        
        Route::post('/devices/{device}/feed', [FeedingEventController::class, 'feed']);

        
        Route::get('/devices/{device}/events', [FeedingEventController::class, 'index']);

        
        Route::get('/alerts', [AlertController::class, 'index']);
        Route::put('/alerts/{alert}/read', [AlertController::class, 'markAsRead']);
        Route::put('/alerts/{alert}/resolve', [AlertController::class, 'resolve']);
    });
