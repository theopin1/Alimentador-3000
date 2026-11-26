<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedingEvent extends Model
{
    use HasFactory;

    const UPDATED_AT = null;

    protected $fillable = [
        'device_id',
        'schedule_id',
        'trigger_type',
        'portion_grams',
        'status',
        'executed_at',
    ];

    protected function casts(): array
    {
        return [
            'portion_grams' => 'integer',
            'executed_at' => 'datetime',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(FeedingSchedule::class, 'schedule_id');
    }
}
