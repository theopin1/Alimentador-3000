<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'serial_code',
        'name',
        'location_lat',
        'location_lng',
        'status',
        'api_token',
        'paired_at',
    ];

    protected function casts(): array
    {
        return [
            'location_lat' => 'decimal:8',
            'location_lng' => 'decimal:8',
            'paired_at' => 'datetime',
        ];
    }

    protected $hidden = [
        'api_token',
    ];

    

    public static function generateApiToken(): array
    {
        $plain = Str::random(64);

        return [
            'plain' => $plain,
            'hash'  => hash('sha256', $plain),
        ];
    }

    

    public static function findByToken(string $plainToken): ?self
    {
        return static::where('api_token', hash('sha256', $plainToken))->first();
    }

    

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    

    public function telemetryReadings(): HasMany
    {
        return $this->hasMany(TelemetryReading::class);
    }

    

    public function latestTelemetry(): HasOne
    {
        return $this->hasOne(TelemetryReading::class)->latestOfMany('read_at');
    }

    

    public function feedingSchedules(): HasMany
    {
        return $this->hasMany(FeedingSchedule::class);
    }

    

    public function feedingEvents(): HasMany
    {
        return $this->hasMany(FeedingEvent::class);
    }

    

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }
}
