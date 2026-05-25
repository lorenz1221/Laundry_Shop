<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Order;

class OrderService
{
    public static function calculateFee(float $weight, string $service): float
    {
        $rates = [
            'wash-dry-fold'  => 45,
            'wash-dry-press' => 65,
            'premium-care'   => 95,
        ];

        return round($weight * ($rates[$service] ?? 45), 2);
    }

    public static function deductInventory(float $weightKg): void
    {
        $deductions = [
            'Detergent' => max(1, (int) ceil($weightKg * 0.5)),
            'Softener'  => max(1, (int) ceil($weightKg * 0.3)),
            'Bleach'    => max(0, (int) ceil($weightKg * 0.15)),
        ];

        foreach ($deductions as $itemName => $amount) {
            if ($amount <= 0) {
                continue;
            }
            $item = Inventory::where('item_name', $itemName)->first();
            if ($item) {
                $item->update([
                    'current_level' => max(0, $item->current_level - $amount),
                ]);
            }
        }
    }
}
