<?php

namespace App\Exceptions;

use App\Models\Device;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

final class DeviceAlreadyPairedException extends ConflictHttpException
{
    public function __construct(
        public readonly Device $device,
    ) {
        parent::__construct('Este alimentador já está vinculado a outro usuário.');
    }
}
