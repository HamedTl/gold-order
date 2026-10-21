<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'price',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:6',
            'price' => 'decimal:0',
            'total_price' => 'decimal:0',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
