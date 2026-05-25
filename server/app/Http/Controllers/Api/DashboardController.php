<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $revenue = (float) Order::where('payment_status', 'paid')->sum('total_fee');
        $totalKg = (float) Order::where('status', '!=', 'completed')->sum('weight_kg');
        $customers = User::where('role', 'customer')->count();
        $activeOrders = Order::where('status', '!=', 'completed')->count();

        return response()->json([
            'success' => true,
            'stats'   => [
                'totalRevenue'    => $revenue,
                'totalKilograms'  => $totalKg,
                'activeCustomers' => $customers,
                'activeOrders'    => $activeOrders,
            ],
        ]);
    }
}
