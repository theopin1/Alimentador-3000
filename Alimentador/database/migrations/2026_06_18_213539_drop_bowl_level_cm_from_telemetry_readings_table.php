<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('telemetry_readings', function (Blueprint $table) {
            $table->dropColumn('bowl_level_cm');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('telemetry_readings', function (Blueprint $table) {
            $table->decimal('bowl_level_cm', 5, 2)->nullable()->after('reservoir_level_cm');
        });
    }
};
