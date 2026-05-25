<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Inventory::orderBy('id')->get()->map(fn ($row) => [
            'id'           => $row->id,
            'itemName'     => $row->item_name,
            'currentLevel' => $row->current_level,
            'maxLevel'     => $row->max_level,
            'unit'         => $row->unit,
        ]);

        return response()->json(['success' => true, 'inventory' => $items]);
    }
}
