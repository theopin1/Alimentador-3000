<?php

namespace Database\Seeders;

use App\Models\Device;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cria um dispositivo de fábrica pronto para ser pareado pelo usuário
        Device::create([
            'serial_code' => 'FEEDER-ABC-12345',
            'api_token'   => hash('sha256', 'plain-text-token-for-esp32-12345'),
            'status'      => 'offline',
        ]);
        
        Device::create([
            'serial_code' => 'FEEDER-XYZ-98765',
            'api_token'   => hash('sha256', 'plain-text-token-for-esp32-98765'),
            'status'      => 'offline',
        ]);
    }
}
