<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use LogsActivity;

    public function updateLegacy(Request $request): JsonResponse
    {
        $id = (int) $request->query('id', 0);
        if ($id <= 0) {
            return response()->json(['success' => false, 'message' => 'Valid order id required.'], 422);
        }

        return $this->update($request, $id);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'paymentStatus' => 'required|in:pending,paid',
        ]);

        $order = Order::findOrFail($id);
        // SECURITY COMPLIANCE CHECK: Eloquent prepared UPDATE for payment_status
        $order->update(['payment_status' => $data['paymentStatus']]);

        $this->logActivity(
            $request->user()->id,
            'PAYMENT_UPDATE',
            sprintf('Order #%d payment_status → %s', $id, $data['paymentStatus'])
        );

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated to ' . $data['paymentStatus'] . '.',
            'order'   => $order->fresh()->toApiArray(),
        ]);
    }
}
