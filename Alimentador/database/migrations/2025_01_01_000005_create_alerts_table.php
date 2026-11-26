<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->enum('type', [
                'low_reservoir',
                'high_temperature',
                'high_humidity',
                'device_offline',
                'feeding_failed',
            ]);
            $table->string('message');
            $table->enum('severity', ['info', 'warning', 'critical'])->default('warning');
            $table->boolean('is_read')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['device_id', 'is_read']);
            $table->index(['device_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
