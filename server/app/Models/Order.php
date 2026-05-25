<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'customer_name',
        'contact_phone',
        'address_line1',
        'address_line2',
        'special_notes',
        'weight_kg',
        'service_type',
        'scheduled_date',
        'scheduled_time',
        'fulfillment_type',
        'status',
        'total_fee',
        'payment_status',
    ];

    protected $casts = [
        'weight_kg' => 'float',
        'total_fee' => 'float',
        'scheduled_date' => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function toApiArray(): array
    {
        return [
            'id'              => $this->id,
            'customerId'      => $this->customer_id,
            'customerName'    => $this->customer_name,
            'contactPhone'    => $this->contact_phone,
            'addressLine1'    => $this->address_line1,
            'addressLine2'    => $this->address_line2,
            'specialNotes'    => $this->special_notes,
            'weightKg'        => (float) $this->weight_kg,
            'serviceType'     => $this->service_type,
            'scheduledDate'   => $this->scheduled_date?->format('Y-m-d'),
            'scheduledTime'   => $this->scheduled_time,
            'fulfillmentType' => $this->fulfillment_type,
            'status'          => $this->status,
            'totalFee'        => (float) $this->total_fee,
            'paymentStatus'   => $this->payment_status,
            'createdAt'       => $this->created_at?->toIso8601String(),
        ];
    }
}
