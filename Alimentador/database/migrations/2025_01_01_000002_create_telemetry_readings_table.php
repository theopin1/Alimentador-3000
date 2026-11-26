<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('telemetry_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->decimal('reservoir_level_cm', 6, 2)->nullable();
            $table->decimal('bowl_level_cm', 6, 2)->nullable();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->decimal('humidity', 5, 2)->nullable();
            $table->decimal('battery_voltage', 4, 2)->nullable();
            $table->timestamp('read_at');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['device_id', 'read_at']);
            $table->index('read_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('telemetry_readings');
    }
};
