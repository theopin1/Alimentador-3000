<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feeding_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->time('scheduled_time');
            $table->unsignedSmallInteger('portion_grams');
            $table->json('days_of_week')->default('[1,2,3,4,5,6,7]');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['device_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feeding_schedules');
    }
};
