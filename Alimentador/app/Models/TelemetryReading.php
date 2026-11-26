<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Casts\Attribute;
class TelemetryReading extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'device_id',
        'reservoir_level_cm',
        'temperature',
        'humidity',
        'battery_voltage',
        'read_at',
    ];

    protected $appends = [
        'reservoir_level_percentage',
    ];

    protected function casts(): array
    {
        return [
            'reservoir_level_cm' => 'decimal:2',
            'temperature' => 'decimal:2',
            'humidity' => 'decimal:2',
            'battery_voltage' => 'decimal:2',
            'read_at' => 'datetime',
        ];
    }

    protected function reservoirLevelPercentage(): Attribute
    {
return Attribute::make(
        get: function () {
            if ($this->reservoir_level_cm === null) {
                return null;
            }

            $maxHeightCm = 14.0;
            $currentHeight = (float) $this->reservoir_level_cm;

            if ($currentHeight >= $maxHeightCm) {
                return 100.0;
            }
            if ($currentHeight <= 0) {
                return 0.0;
            }

            $percentage = ($currentHeight / $maxHeightCm) * 100;
            
            return round($percentage, 2);
        }
    );
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
