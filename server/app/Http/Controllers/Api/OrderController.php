<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use LogsActivity;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $view = $request->query('view', 'default');

        if (in_array($user->role, ['staff', 'admin'], true)) {
            if ($view === 'ledger') {
                $orders = Order::orderByDesc('created_at')->get();
            } else {
                $orders = Order::where('status', '!=', 'completed')->orderBy('created_at')->get();
            }
        } else {
            $orders = Order::where('customer_id', $user->id)->orderByDesc('created_at')->get();
        }

        return response()->json([
            'success' => true,
            'orders'  => $orders->map->toApiArray(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'customerName'    => 'nullable|string|max:255',
            'contactPhone'    => 'nullable|string|max:50',
            'addressLine1'    => 'nullable|string|max:255',
            'addressLine2'    => 'nullable|string|max:255',
            'specialNotes'    => 'nullable|string',
            'weightKg'        => 'required|numeric|min:0.5|max:50',
            'serviceType'     => 'required|in:wash-dry-fold,wash-dry-press,premium-care',
            'scheduledDate'   => 'nullable|date',
            'scheduledTime'   => 'nullable',
            'fulfillmentType' => 'nullable|in:dropoff,delivery',
            'paymentStatus'   => 'nullable|in:pending,paid',
            'customerId'      => 'nullable|integer',
        ]);

        $customerId = in_array($user->role, ['staff', 'admin'], true)
            ? ($data['customerId'] ?? null)
            : $user->id;

        $totalFee = OrderService::calculateFee((float) $data['weightKg'], $data['serviceType']);

        $order = Order::create([
            'customer_id'      => $customerId,
            'customer_name'    => $data['customerName'] ?? $user->name,
            'contact_phone'    => $data['contactPhone'] ?? null,
            'address_line1'    => $data['addressLine1'] ?? null,
            'address_line2'    => $data['addressLine2'] ?? null,
            'special_notes'    => $data['specialNotes'] ?? null,
            'weight_kg'        => $data['weightKg'],
            'service_type'     => $data['serviceType'],
            'scheduled_date'   => $data['scheduledDate'] ?? null,
            'scheduled_time'   => $data['scheduledTime'] ?? null,
            'fulfillment_type' => $data['fulfillmentType'] ?? 'dropoff',
            'status'           => 'queue',
            'total_fee'        => $totalFee,
            'payment_status'   => $data['paymentStatus'] ?? 'pending',
        ]);

        OrderService::deductInventory((float) $data['weightKg']);
        $this->logActivity($user->id, 'ORDER_CREATE', 'Order #' . $order->id . ' created');

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully.',
            'order'   => $order->fresh()->toApiArray(),
        ], 201);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:queue,washing,drying,ready,completed',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $data['status']]);

        $this->logActivity($request->user()->id, 'ORDER_STATUS', "Order #{$id} → {$data['status']}");

        return response()->json([
            'success' => true,
            'message' => $data['status'] === 'completed' ? 'Order completed and archived.' : 'Order status updated.',
            'order'   => $order->fresh()->toApiArray(),
        ]);
    }
}
