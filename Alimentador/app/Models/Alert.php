<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'type',
        'message',
        'severity',
        'is_read',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    

    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }
}
