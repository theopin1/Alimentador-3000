<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feeding_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained('feeding_schedules')->nullOnDelete();
            $table->enum('trigger_type', ['scheduled', 'manual']);
            $table->unsignedSmallInteger('portion_grams');
            $table->enum('status', ['success', 'failed', 'timeout'])->default('success');
            $table->timestamp('executed_at');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['device_id', 'executed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feeding_events');
    }
};
