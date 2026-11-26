<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Services\AlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AlertController extends Controller
{
    public function __construct(
        private readonly AlertService $alertService,
    ) {}

    

    public function index(Request $request): JsonResponse
    {
        $alerts = $this->alertService->listForUser(
            user: $request->user(),
            perPage: (int) $request->get('per_page', 30),
        );

        return response()->json($alerts);
    }

    

    public function markAsRead(Request $request, Alert $alert): JsonResponse
    {
        $this->alertService->markAsRead($alert, $request->user());

        return response()->json([
            'message' => 'Alerta marcado como lido.',
        ]);
    }
    

    public function resolve(Request $request, Alert $alert): JsonResponse
    {
        $this->alertService->resolve($alert, $request->user());

        return response()->json([
            'message' => 'Alerta resolvido com sucesso.',
        ]);
    }
}
