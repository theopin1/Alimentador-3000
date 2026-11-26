<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedingSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'scheduled_time',
        'portion_grams',
        'days_of_week',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'days_of_week' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function feedingEvents(): HasMany
    {
        return $this->hasMany(FeedingEvent::class, 'schedule_id');
    }
}
